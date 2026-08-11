import { ForbiddenException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';

@Injectable()
export class GenerationPolicyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async assertAllowed(user: AuthenticatedUser) {
    if (!user.profileComplete)
      throw new ForbiddenException('complete your profile before creating a video');
    if (!['ELIGIBLE', 'GUARDIAN_APPROVED'].includes(user.ageGateStatus)) {
      if (user.ageGateStatus === 'POLICY_REQUIRED')
        throw new ServiceUnavailableException('the account age policy must be configured first');
      throw new ForbiddenException('guardian approval is required before creating a video');
    }
    const policy = await this.policyFor(user);
    if (policy.unlimited) return { allowed: true, remaining: null, policy };
    const start = policy.windowDays
      ? new Date(Date.now() - policy.windowDays * 24 * 60 * 60 * 1000)
      : undefined;
    const used = await this.prisma.memeJob.count({
      where: {
        userId: user.id,
        status: { in: ['PENDING', 'PROCESSING', 'DONE'] },
        ...(start ? { createdAt: { gte: start } } : {}),
      },
    });
    if (used >= policy.limit)
      throw new ForbiddenException(
        policy.windowDays
          ? `video allowance used for the current ${policy.windowDays}-day window`
          : 'free video credit has already been used',
      );
    return { allowed: true, remaining: Math.max(0, policy.limit - used - 1), policy };
  }

  async summary(user: AuthenticatedUser) {
    const policy = await this.policyFor(user);
    if (policy.unlimited) return { ...policy, used: 0, remaining: null };
    const start = policy.windowDays
      ? new Date(Date.now() - policy.windowDays * 24 * 60 * 60 * 1000)
      : undefined;
    const used = await this.prisma.memeJob.count({
      where: {
        userId: user.id,
        status: { in: ['PENDING', 'PROCESSING', 'DONE'] },
        ...(start ? { createdAt: { gte: start } } : {}),
      },
    });
    return { ...policy, used, remaining: Math.max(0, policy.limit - used) };
  }

  private async policyFor(user: AuthenticatedUser) {
    const override = await this.prisma.usagePolicyOverride.findUnique({
      where: { userId: user.id },
    });
    if (override) {
      if (override.unlimited)
        return { source: 'override', unlimited: true, limit: 0, windowDays: 0 };
      if (override.generationLimit == null || override.windowDays == null)
        throw new ServiceUnavailableException('this account usage policy is incomplete');
      return {
        source: 'override',
        unlimited: false,
        limit: override.generationLimit,
        windowDays: override.windowDays,
      };
    }
    const prefix = user.role === UserRole.ADMIN ? 'ADMIN' : 'FREE';
    const limitValue = this.config.get<string>(`${prefix}_GENERATION_LIMIT`);
    const windowValue = this.config.get<string>(`${prefix}_GENERATION_WINDOW_DAYS`);
    if (!limitValue?.trim() || !windowValue?.trim())
      throw new ServiceUnavailableException(
        `${prefix.toLowerCase()} generation policy is not configured`,
      );
    const limit = Number(limitValue);
    const windowDays = Number(windowValue);
    if (!Number.isInteger(limit) || limit < 0 || !Number.isInteger(windowDays) || windowDays < 0)
      throw new ServiceUnavailableException(`${prefix.toLowerCase()} generation policy is invalid`);
    return {
      source: user.role === UserRole.ADMIN ? 'admin-role' : 'free-role',
      unlimited: limit === 0,
      limit,
      windowDays,
    };
  }
}
