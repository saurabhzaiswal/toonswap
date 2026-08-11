import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpPurpose, Prisma, User, UserRole } from '@prisma/client';
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'crypto';
import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { v7 as uuidv7 } from 'uuid';
import { PrismaService } from '../database/prisma.service';
import { TransactionalMailService } from '../mail/transactional-mail.service';
import { authCookieNames, authCookieOptions } from './auth.cookies';

@Injectable()
export class AuthService {
  private readonly google = new OAuth2Client();

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mail: TransactionalMailService,
  ) {}

  issueLoginCsrf(response: Response) {
    const token = randomBytes(24).toString('base64url');
    response.cookie(authCookieNames(this.config).loginCsrf, token, {
      ...authCookieOptions(this.config, false),
      maxAge: 30 * 60 * 1000,
    });
    return token;
  }

  async requestOtp(email: string, purpose: OtpPurpose, request: Request) {
    const normalized = this.normalizeEmail(email);
    const now = new Date();
    const ttlMinutes = this.numberConfig('OTP_TTL_MINUTES', 10, 5, 10);
    const windowMinutes = this.numberConfig('OTP_REQUEST_WINDOW_MINUTES', 15, 5, 60);
    const emailLimit = this.numberConfig('OTP_REQUEST_LIMIT_PER_EMAIL', 3, 1, 10);
    const ipLimit = this.numberConfig('OTP_REQUEST_LIMIT_PER_IP', 10, 2, 50);
    const since = new Date(now.getTime() - windowMinutes * 60 * 1000);
    const requestIpHash = this.hashSensitive(this.requestIp(request));
    const [emailRequests, ipRequests, latest] = await Promise.all([
      this.prisma.otpChallenge.count({
        where: { emailNormalized: normalized, createdAt: { gte: since } },
      }),
      this.prisma.otpChallenge.count({ where: { requestIpHash, createdAt: { gte: since } } }),
      this.prisma.otpChallenge.findFirst({
        where: { emailNormalized: normalized },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);
    if (emailRequests >= emailLimit || ipRequests >= ipLimit)
      throw new HttpException(
        'too many code requests; please wait and try again',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    if (latest && now.getTime() - latest.createdAt.getTime() < 60_000)
      throw new HttpException(
        'please wait one minute before requesting another code',
        HttpStatus.TOO_MANY_REQUESTS,
      );

    const challengeId = uuidv7();
    const code = String(randomInt(100000, 1000000));
    await this.prisma.otpChallenge.create({
      data: {
        id: challengeId,
        emailNormalized: normalized,
        purpose,
        codeHash: this.otpHash(challengeId, code),
        requestIpHash,
        expiresAt: new Date(now.getTime() + ttlMinutes * 60 * 1000),
      },
    });
    try {
      await this.mail.sendLoginCode(normalized, code, ttlMinutes);
    } catch (error) {
      await this.prisma.otpChallenge.delete({ where: { id: challengeId } }).catch(() => undefined);
      throw error;
    }
    return {
      challengeId,
      expiresInSeconds: ttlMinutes * 60,
      destination: this.maskEmail(normalized),
    };
  }

  async verifyOtp(challengeId: string, code: string, request: Request, response: Response) {
    const challenge = await this.prisma.otpChallenge.findUnique({ where: { id: challengeId } });
    const maxAttempts = this.numberConfig('OTP_MAX_ATTEMPTS', 5, 3, 10);
    if (!challenge || challenge.consumedAt || challenge.expiresAt <= new Date())
      throw new UnauthorizedException('code is invalid or expired');
    if (challenge.attempts >= maxAttempts)
      throw new HttpException(
        'too many attempts; request a new code',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    if (!this.safeEqual(challenge.codeHash, this.otpHash(challenge.id, code))) {
      await this.prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('code is invalid or expired');
    }

    const user = await this.prisma.$transaction(async (database) => {
      const consumed = await database.otpChallenge.updateMany({
        where: { id: challenge.id, consumedAt: null },
        data: { consumedAt: new Date() },
      });
      if (consumed.count !== 1) throw new UnauthorizedException('code has already been used');

      let account = await database.user.findUnique({
        where: { emailNormalized: challenge.emailNormalized },
      });
      if (challenge.purpose === OtpPurpose.LOGIN && !account)
        throw new UnauthorizedException('no account found; create an account first');
      if (challenge.purpose === OtpPurpose.SIGNUP && account)
        throw new ConflictException('an account already exists; sign in instead');
      if (!account) {
        account = await database.user.create({
          data: {
            id: uuidv7(),
            email: challenge.emailNormalized,
            emailNormalized: challenge.emailNormalized,
            emailVerifiedAt: new Date(),
            role: this.bootstrapRole(challenge.emailNormalized),
          },
        });
      } else if (!account.emailVerifiedAt) {
        account = await database.user.update({
          where: { id: account.id },
          data: { emailVerifiedAt: new Date() },
        });
      }
      await database.authIdentity.upsert({
        where: {
          provider_providerSubject: {
            provider: 'EMAIL_OTP',
            providerSubject: challenge.emailNormalized,
          },
        },
        create: {
          id: uuidv7(),
          userId: account.id,
          provider: 'EMAIL_OTP',
          providerSubject: challenge.emailNormalized,
          providerEmail: challenge.emailNormalized,
        },
        update: { lastUsedAt: new Date(), providerEmail: challenge.emailNormalized },
      });
      return account;
    });
    return this.finishLogin(user, request, response);
  }

  async googleLogin(credential: string, request: Request, response: Response) {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) throw new ServiceUnavailableException('Google sign-in is not configured');
    const ticket = await this.google.verifyIdToken({ idToken: credential, audience: clientId });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || !payload.email_verified)
      throw new UnauthorizedException('Google could not verify this email address');
    const normalized = this.normalizeEmail(payload.email);

    const existingIdentity = await this.prisma.authIdentity.findUnique({
      where: { provider_providerSubject: { provider: 'GOOGLE', providerSubject: payload.sub } },
      include: { user: true },
    });
    let user = existingIdentity?.user;
    if (!user) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { emailNormalized: normalized },
      });
      if (existingEmail && !normalized.endsWith('@gmail.com') && !payload.hd)
        throw new ConflictException(
          'sign in with your email code before connecting this Google account',
        );
      user = await this.prisma.$transaction(async (database) => {
        const account =
          existingEmail ||
          (await database.user.create({
            data: {
              id: uuidv7(),
              email: payload.email as string,
              emailNormalized: normalized,
              emailVerifiedAt: new Date(),
              name: payload.name?.slice(0, 120) || null,
              role: this.bootstrapRole(normalized),
            },
          }));
        await database.authIdentity.create({
          data: {
            id: uuidv7(),
            userId: account.id,
            provider: 'GOOGLE',
            providerSubject: payload.sub as string,
            providerEmail: normalized,
          },
        });
        return account;
      });
    } else {
      await this.prisma.authIdentity.update({
        where: { id: existingIdentity?.id },
        data: { lastUsedAt: new Date(), providerEmail: normalized },
      });
    }
    return this.finishLogin(user, request, response);
  }

  async session(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { usagePolicyOverride: true },
    });
    return { user: this.userPayload(user), policy: this.policySummary(user) };
  }

  async logout(sessionId: string, response: Response) {
    await this.prisma.authSession.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    this.clearAuthCookies(response);
    return { signedOut: true };
  }

  async logoutEverywhere(userId: string, response: Response) {
    await this.prisma.authSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    this.clearAuthCookies(response);
    return { signedOut: true, allDevices: true };
  }

  private async finishLogin(user: User, request: Request, response: Response) {
    if (user.status !== 'ACTIVE') throw new ForbiddenException('account access is blocked');
    const token = randomBytes(32).toString('base64url');
    const csrfToken = randomBytes(24).toString('base64url');
    const ttlDays = this.numberConfig('SESSION_TTL_DAYS', 30, 1, 90);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);
    await this.prisma.$transaction([
      this.prisma.authSession.create({
        data: {
          id: uuidv7(),
          userId: user.id,
          tokenHash: this.sha256(token),
          csrfTokenHash: this.sha256(csrfToken),
          ipHash: this.hashSensitive(this.requestIp(request)),
          userAgent: String(request.headers['user-agent'] || '').slice(0, 500) || null,
          expiresAt,
        },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: now, lastSeenAt: now },
      }),
    ]);
    const names = authCookieNames(this.config);
    response.cookie(names.session, token, {
      ...authCookieOptions(this.config, true),
      maxAge: ttlDays * 24 * 60 * 60 * 1000,
    });
    response.cookie(names.csrf, csrfToken, {
      ...authCookieOptions(this.config, false),
      maxAge: ttlDays * 24 * 60 * 60 * 1000,
    });
    return { user: this.userPayload(user), requiresProfile: !user.profileComplete };
  }

  private userPayload(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      dateOfBirth: user.dateOfBirth,
      city: user.city,
      countryCode: user.countryCode,
      locale: user.locale,
      timezone: user.timezone,
      role: user.role,
      status: user.status,
      ageGateStatus: user.ageGateStatus,
      profileComplete: user.profileComplete,
      avatarUrl: user.avatarObjectKey ? '/api/users/me/avatar' : null,
      createdAt: user.createdAt,
    };
  }

  private policySummary(user: User & { usagePolicyOverride?: any }) {
    return {
      ageThresholdConfigured: Boolean(this.config.get<string>('MINIMUM_SELF_SERVE_AGE')),
      generationWindowConfigured: Boolean(this.config.get<string>('FREE_GENERATION_WINDOW_DAYS')),
      override: user.usagePolicyOverride
        ? {
            generationLimit: user.usagePolicyOverride.generationLimit,
            windowDays: user.usagePolicyOverride.windowDays,
            unlimited: user.usagePolicyOverride.unlimited,
          }
        : null,
    };
  }

  clearAuthCookies(response: Response) {
    const names = authCookieNames(this.config);
    response.clearCookie(names.session, authCookieOptions(this.config, true));
    response.clearCookie(names.csrf, authCookieOptions(this.config, false));
  }

  private authSecret() {
    const secret = this.config.get<string>('AUTH_SECRET');
    if (!secret || secret.length < 32)
      throw new ServiceUnavailableException('AUTH_SECRET must be at least 32 characters');
    return secret;
  }

  private otpHash(challengeId: string, code: string) {
    return createHmac('sha256', this.authSecret()).update(`${challengeId}:${code}`).digest('hex');
  }

  private hashSensitive(value: string) {
    return createHmac('sha256', this.authSecret()).update(value).digest('hex');
  }

  private sha256(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }

  private safeEqual(left: string, right: string) {
    const a = Buffer.from(left);
    const b = Buffer.from(right);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private bootstrapRole(email: string) {
    const allowed = (this.config.get<string>('BOOTSTRAP_ADMIN_EMAILS') || '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    return allowed.includes(email) ? UserRole.ADMIN : UserRole.USER;
  }

  private maskEmail(email: string) {
    const [name, domain] = email.split('@');
    return `${name.slice(0, 2)}${'*'.repeat(Math.max(2, name.length - 2))}@${domain}`;
  }

  private requestIp(request: Request) {
    return String(request.ip || request.socket.remoteAddress || 'unknown');
  }

  private numberConfig(name: string, fallback: number, minimum: number, maximum: number) {
    const value = Number(this.config.get<string>(name) || fallback);
    return Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : fallback));
  }
}
