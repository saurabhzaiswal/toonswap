import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AgeGateStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { PrismaService } from '../database/prisma.service';
import { StorageService } from '../media/storage.service';
import { AvatarUploadDto, UpdateProfileDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly config: ConfigService,
  ) {}

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('account not found');
    return this.privateProfile(user);
  }

  async updateProfile(userId: string, input: UpdateProfileDto) {
    if (!input.acceptTerms || !input.acceptPrivacy)
      throw new BadRequestException('terms and privacy acknowledgement are required');
    const dateOfBirth = new Date(`${input.dateOfBirth}T00:00:00.000Z`);
    if (dateOfBirth > new Date())
      throw new BadRequestException('date of birth cannot be in the future');
    const ageGateStatus = this.ageGateStatus(dateOfBirth);
    const now = new Date();
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name.trim(),
        dateOfBirth,
        city: input.city.trim(),
        countryCode: input.countryCode.trim().toUpperCase(),
        locale: input.locale?.trim() || null,
        timezone: input.timezone?.trim() || null,
        termsAcceptedAt: now,
        privacyAcceptedAt: now,
        ageGateStatus,
        profileComplete: true,
      },
    });
    return this.privateProfile(user);
  }

  async createAvatarUpload(userId: string, input: AvatarUploadDto) {
    if (!Number.isInteger(input.fileSize) || input.fileSize < 1 || input.fileSize > 5 * 1024 * 1024)
      throw new BadRequestException('profile picture must be 5 MB or smaller');
    const slot = await this.storage.createPrivateUpload(
      input.contentType,
      `profiles/${userId}/avatar`,
    );
    await this.prisma.user.update({
      where: { id: userId },
      data: { pendingAvatarObjectKey: slot.reference, avatarMimeType: input.contentType },
    });
    return {
      uploadUrl: slot.uploadUrl,
      contentType: input.contentType,
      expiresIn: slot.expiresIn,
    };
  }

  async finalizeAvatar(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.pendingAvatarObjectKey)
      throw new BadRequestException('start a profile picture upload first');
    if (!(await this.storage.privateObjectExists(user.pendingAvatarObjectKey)))
      throw new BadRequestException('profile picture upload is missing or incomplete');
    const oldAvatar = user.avatarObjectKey;
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        avatarObjectKey: user.pendingAvatarObjectKey,
        pendingAvatarObjectKey: null,
      },
    });
    if (oldAvatar && oldAvatar !== updated.avatarObjectKey)
      await this.storage.deletePublicUrl(oldAvatar);
    return { avatarUrl: '/api/users/me/avatar' };
  }

  async avatar(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarObjectKey: true, avatarMimeType: true },
    });
    if (!user?.avatarObjectKey) throw new NotFoundException('profile picture not found');
    const object = await this.storage.readPrivateObject(user.avatarObjectKey);
    return {
      body: object.Body as Readable,
      contentType: object.ContentType || user.avatarMimeType || 'image/webp',
      length: object.ContentLength,
    };
  }

  async deleteAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { selfInsertAssets: true, memeJobs: true },
    });
    if (!user) throw new NotFoundException('account not found');
    if (user.isSystem) throw new BadRequestException('system account cannot be deleted');
    const media = [
      user.avatarObjectKey,
      user.pendingAvatarObjectKey,
      ...user.selfInsertAssets.flatMap((asset) => [
        asset.photoSourceUrl,
        asset.voiceSourceUrl,
        asset.characterReferenceUrl,
        asset.voiceReferenceUrl,
      ]),
      ...user.memeJobs.flatMap((job) => [job.selfieUrl, job.voiceUrl, job.outputUrl]),
    ].filter(Boolean) as string[];
    await Promise.all(media.map((reference) => this.storage.deletePublicUrl(reference)));
    await this.prisma.user.delete({ where: { id: userId } });
    return { deleted: true };
  }

  private ageGateStatus(dateOfBirth: Date): AgeGateStatus {
    const thresholdValue = this.config.get<string>('MINIMUM_SELF_SERVE_AGE');
    if (!thresholdValue) return AgeGateStatus.POLICY_REQUIRED;
    const threshold = Number(thresholdValue);
    if (!Number.isInteger(threshold) || threshold < 1 || threshold > 21)
      throw new ServiceUnavailableException('MINIMUM_SELF_SERVE_AGE is invalid');
    const today = new Date();
    let age = today.getUTCFullYear() - dateOfBirth.getUTCFullYear();
    const beforeBirthday =
      today.getUTCMonth() < dateOfBirth.getUTCMonth() ||
      (today.getUTCMonth() === dateOfBirth.getUTCMonth() &&
        today.getUTCDate() < dateOfBirth.getUTCDate());
    if (beforeBirthday) age -= 1;
    return age >= threshold ? AgeGateStatus.ELIGIBLE : AgeGateStatus.GUARDIAN_REQUIRED;
  }

  private privateProfile(user: any) {
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
      lastSeenAt: user.lastSeenAt,
    };
  }
}
