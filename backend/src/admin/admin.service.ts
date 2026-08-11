import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';
import { PrismaService } from '../database/prisma.service';
import {
  AdminJobQueryDto,
  AdminActivityQueryDto,
  AdminUserQueryDto,
  UpdateUsagePolicyDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [
      users,
      activeUsers,
      blockedUsers,
      admins,
      jobs,
      jobsToday,
      jobsWeek,
      pending,
      recentSignups,
    ] = await Promise.all([
      this.prisma.user.count({ where: { isSystem: false } }),
      this.prisma.user.count({ where: { status: 'ACTIVE', isSystem: false } }),
      this.prisma.user.count({ where: { status: 'BLOCKED', isSystem: false } }),
      this.prisma.user.count({ where: { role: 'ADMIN', isSystem: false } }),
      this.prisma.memeJob.count(),
      this.prisma.memeJob.count({ where: { createdAt: { gte: dayAgo } } }),
      this.prisma.memeJob.count({ where: { createdAt: { gte: weekAgo } } }),
      this.prisma.memeJob.count({ where: { status: { in: ['PENDING', 'PROCESSING'] } } }),
      this.prisma.user.count({ where: { createdAt: { gte: weekAgo }, isSystem: false } }),
    ]);
    const byStatus = await this.prisma.memeJob.groupBy({ by: ['status'], _count: { _all: true } });
    return {
      users: { total: users, active: activeUsers, blocked: blockedUsers, admins, recentSignups },
      generations: { total: jobs, today: jobsToday, last7Days: jobsWeek, pending, byStatus },
      generatedAt: new Date(),
    };
  }

  async users(query: AdminUserQueryDto) {
    const where: Prisma.UserWhereInput = {
      isSystem: false,
      ...(query.role ? { role: query.role } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search?.trim()
        ? {
            OR: [
              {
                emailNormalized: {
                  contains: query.search.trim().toLowerCase(),
                  mode: 'insensitive',
                },
              },
              { name: { contains: query.search.trim(), mode: 'insensitive' } },
              { city: { contains: query.search.trim(), mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { [query.sortBy]: query.sortOrder },
        select: {
          id: true,
          email: true,
          name: true,
          city: true,
          countryCode: true,
          dateOfBirth: true,
          role: true,
          status: true,
          ageGateStatus: true,
          profileComplete: true,
          lastLoginAt: true,
          lastSeenAt: true,
          createdAt: true,
          blockedAt: true,
          blockedReason: true,
          avatarObjectKey: true,
          usagePolicyOverride: true,
          _count: { select: { memeJobs: true, storyProjects: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      items: items.map(({ avatarObjectKey, ...item }) => ({
        ...item,
        hasAvatar: Boolean(avatarObjectKey),
      })),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        pages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
    };
  }

  async jobs(query: AdminJobQueryDto) {
    const search = query.search?.trim();
    const searchOr: Prisma.MemeJobWhereInput[] = [];
    if (search) {
      const jobId = this.uuidSearch(search);
      if (jobId) searchOr.push({ id: jobId });
      searchOr.push({
        user: { emailNormalized: { contains: search.toLowerCase(), mode: 'insensitive' } },
      });
    }
    const where: Prisma.MemeJobWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(searchOr.length ? { OR: searchOr } : {}),
    };
    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.memeJob.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          character: true,
          language: true,
          status: true,
          watermarked: true,
          errorMessage: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { id: true, email: true, name: true, status: true } },
        },
      }),
      this.prisma.memeJob.count({ where }),
    ]);
    return {
      items,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        pages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
    };
  }

  async activity(query: AdminActivityQueryDto) {
    const search = query.search?.trim();
    const where: Prisma.ActivityLogWhereInput = {
      deletedAt: null,
      ...(query.action ? { action: query.action } : {}),
      ...(search
        ? {
            OR: [
              { action: { contains: search, mode: 'insensitive' } },
              { entityName: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              {
                actor: { emailNormalized: { contains: search.toLowerCase(), mode: 'insensitive' } },
              },
            ],
          }
        : {}),
    };
    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.activityLog.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          entityName: true,
          description: true,
          metadata: true,
          createdAt: true,
          actor: { select: { id: true, email: true, name: true } },
          subject: { select: { id: true, email: true, name: true } },
        },
      }),
      this.prisma.activityLog.count({ where }),
    ]);
    return {
      items,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        pages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
    };
  }

  async updateStatus(actorUserId: string, targetUserId: string, input: UpdateUserStatusDto) {
    if (actorUserId === targetUserId)
      throw new ForbiddenException('administrators cannot block their own account');
    if (input.status === UserStatus.DELETION_PENDING)
      throw new BadRequestException('use the account-deletion workflow for deletion requests');
    const target = await this.target(targetUserId);
    const now = new Date();
    const user = await this.prisma.$transaction(async (database) => {
      const updated = await database.user.update({
        where: { id: targetUserId },
        data: {
          status: input.status,
          blockedAt: input.status === UserStatus.BLOCKED ? now : null,
          blockedReason:
            input.status === UserStatus.BLOCKED ? input.reason?.trim() || 'Blocked by admin' : null,
        },
      });
      if (input.status === UserStatus.BLOCKED)
        await database.authSession.updateMany({
          where: { userId: targetUserId, revokedAt: null },
          data: { revokedAt: now },
        });
      await database.activityLog.create({
        data: {
          id: uuidv7(),
          actorUserId,
          subjectUserId: targetUserId,
          action: input.status === UserStatus.BLOCKED ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
          entityType: 'User',
          entityId: targetUserId,
          entityName: target.email,
          description:
            input.status === UserStatus.BLOCKED
              ? 'Administrator blocked the account and revoked active sessions.'
              : 'Administrator restored account access.',
          metadata: { previousStatus: target.status, reason: input.reason || null },
        },
      });
      return updated;
    });
    return { id: user.id, status: user.status, blockedAt: user.blockedAt };
  }

  async updateRole(actorUserId: string, targetUserId: string, input: UpdateUserRoleDto) {
    if (actorUserId === targetUserId && input.role !== UserRole.ADMIN)
      throw new ForbiddenException('administrators cannot remove their own admin role');
    const target = await this.target(targetUserId);
    const user = await this.prisma.$transaction(async (database) => {
      const updated = await database.user.update({
        where: { id: targetUserId },
        data: { role: input.role },
      });
      await database.activityLog.create({
        data: {
          id: uuidv7(),
          actorUserId,
          subjectUserId: targetUserId,
          action: 'USER_ROLE_CHANGED',
          entityType: 'User',
          entityId: targetUserId,
          entityName: target.email,
          description: `Administrator changed the account role from ${target.role} to ${input.role}.`,
          metadata: { previousRole: target.role, nextRole: input.role },
        },
      });
      return updated;
    });
    return { id: user.id, role: user.role };
  }

  async updateUsagePolicy(actorUserId: string, targetUserId: string, input: UpdateUsagePolicyDto) {
    const target = await this.target(targetUserId);
    if (!input.unlimited && (input.generationLimit == null || input.windowDays == null))
      throw new BadRequestException(
        'a limit and window are required unless the account is unlimited',
      );
    const policy = await this.prisma.$transaction(async (database) => {
      const updated = await database.usagePolicyOverride.upsert({
        where: { userId: targetUserId },
        create: {
          id: uuidv7(),
          userId: targetUserId,
          unlimited: input.unlimited,
          generationLimit: input.unlimited ? null : input.generationLimit,
          windowDays: input.unlimited ? null : input.windowDays,
          note: input.note?.trim() || null,
          updatedByUserId: actorUserId,
        },
        update: {
          unlimited: input.unlimited,
          generationLimit: input.unlimited ? null : input.generationLimit,
          windowDays: input.unlimited ? null : input.windowDays,
          note: input.note?.trim() || null,
          updatedByUserId: actorUserId,
        },
      });
      await database.activityLog.create({
        data: {
          id: uuidv7(),
          actorUserId,
          subjectUserId: targetUserId,
          action: 'USAGE_POLICY_CHANGED',
          entityType: 'UsagePolicyOverride',
          entityId: updated.id,
          entityName: target.email,
          description: 'Administrator changed the account generation allowance.',
          metadata: {
            unlimited: input.unlimited,
            generationLimit: input.generationLimit || null,
            windowDays: input.windowDays || null,
          },
        },
      });
      return updated;
    });
    return policy;
  }

  private async target(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.isSystem) throw new NotFoundException('user not found');
    return user;
  }

  private uuidSearch(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[78][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value.trim(),
    )
      ? value.trim()
      : undefined;
  }
}
