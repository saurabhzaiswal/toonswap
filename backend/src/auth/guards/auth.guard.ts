import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { createHash } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { authCookieNames } from '../auth.cookies';
import { AuthenticatedRequest } from '../auth.types';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    if (
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ])
    )
      return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.cookies?.[authCookieNames(this.config).session];
    if (!token) throw new UnauthorizedException('sign in required');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const session = await this.prisma.authSession.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (!session || session.revokedAt || session.expiresAt <= new Date())
      throw new UnauthorizedException('session expired');
    if (session.user.status !== 'ACTIVE') {
      await this.prisma.authSession.updateMany({
        where: { userId: session.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new ForbiddenException('account access is blocked');
    }

    request.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      status: session.user.status,
      ageGateStatus: session.user.ageGateStatus,
      profileComplete: session.user.profileComplete,
    };
    request.authSession = { id: session.id, csrfTokenHash: session.csrfTokenHash };

    if (Date.now() - session.lastSeenAt.getTime() > 5 * 60 * 1000) {
      const now = new Date();
      await this.prisma.$transaction([
        this.prisma.authSession.update({ where: { id: session.id }, data: { lastSeenAt: now } }),
        this.prisma.user.update({ where: { id: session.userId }, data: { lastSeenAt: now } }),
      ]);
    }
    return true;
  }
}
