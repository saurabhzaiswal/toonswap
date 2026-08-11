import { BadRequestException, ForbiddenException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { SelfInsertStatus, SelfInsertVoiceMode } from '@prisma/client';
import { Queue } from 'bullmq';
import { v7 as uuidv7 } from 'uuid';
import { PrismaService } from '../database/prisma.service';
import { StorageService } from '../media/storage.service';
import { ModerationService } from '../moderation/moderation.service';
import { CreateSelfInsertDto, SelfInsertVoiceModeInput } from './dto/create-self-insert.dto';

export const SELF_INSERT_QUEUE = 'self-insert-generation';
type SelfInsertFiles = { photo?: Express.Multer.File; voice?: Express.Multer.File };

@Injectable()
export class SelfInsertService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService, private readonly storage: StorageService, private readonly moderation: ModerationService, private readonly config: ConfigService, @InjectQueue(SELF_INSERT_QUEUE) private readonly queue: Queue) {}

  async onModuleInit() {
    await this.queue.add('purge-expired', {}, { jobId: 'self-insert-retention', repeat: { every: 60 * 60 * 1000 }, removeOnComplete: 10, removeOnFail: 20 });
  }

  capabilities() {
    const providerEnabled = this.config.get('SELF_INSERT_PROVIDER_ENABLED') === 'true';
    const mediaModerationEnabled = this.config.get('SELF_INSERT_MEDIA_MODERATION_ENABLED') === 'true';
    return { consentRecords: 'implemented', sessionReusableReferences: 'implemented', sourceRetentionHours: 24, deletionEndpoint: 'implemented', providerQueue: providerEnabled && mediaModerationEnabled ? 'enabled' : 'locked-until-provider-and-media-moderation', photoReference: 'Replicate adapter', voiceReference: 'as-is or consented ElevenLabs speech-to-speech' };
  }

  async create(input: CreateSelfInsertDto, files: SelfInsertFiles) {
    if (!files.photo && !files.voice) throw new BadRequestException('photo or voice is required');
    if (files.photo && !input.likenessAuthorized) throw new BadRequestException('likeness permission is required');
    if (files.voice && !input.voiceAuthorized) throw new BadRequestException('voice permission is required');
    if (!input.retentionAccepted) throw new BadRequestException('retention acknowledgement is required');
    this.moderation.assertTextAllowed(input.scriptText);
    const ownerSessionId = input.ownerSessionId || uuidv7();
    const assetId = uuidv7();
    const consentRecordId = uuidv7();
    const [photoSourceUrl, voiceSourceUrl] = await Promise.all([
      files.photo ? this.storage.uploadPrivateBuffer(files.photo.buffer, files.photo.mimetype, `self-insert/${assetId}/photo`) : null,
      files.voice ? this.storage.uploadPrivateBuffer(files.voice.buffer, files.voice.mimetype, `self-insert/${assetId}/voice`) : null,
    ]);
    const canQueue = this.config.get('SELF_INSERT_PROVIDER_ENABLED') === 'true' && this.config.get('SELF_INSERT_MEDIA_MODERATION_ENABLED') === 'true';
    const asset = await this.prisma.$transaction(async (database) => {
      await database.consentRecord.create({ data: { id: consentRecordId, ownerSessionId, likenessAuthorized: Boolean(files.photo && input.likenessAuthorized), voiceAuthorized: Boolean(files.voice && input.voiceAuthorized), retentionAccepted: true, policyVersion: 'self-insert-v1-2026-08' } });
      return database.selfInsertAsset.create({ data: { id: assetId, ownerSessionId, projectId: input.projectId || null, consentRecordId, displayName: input.displayName.trim(), photoSourceUrl, voiceSourceUrl, voiceMode: input.voiceMode === SelfInsertVoiceModeInput.CONVERT ? SelfInsertVoiceMode.CONVERT : SelfInsertVoiceMode.AS_IS, voiceStyle: input.voiceStyle || null, status: canQueue ? SelfInsertStatus.QUEUED : SelfInsertStatus.DRAFT, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
    });
    if (canQueue) await this.queue.add('create-reusable-reference', { assetId }, { attempts: 2, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: 100, removeOnFail: 100 });
    return { ownerSessionId, assetId: asset.id, status: asset.status, expiresAt: asset.expiresAt, queued: canQueue };
  }

  async get(assetId: string, ownerSessionId?: string) {
    const asset = await this.prisma.selfInsertAsset.findUnique({ where: { id: assetId }, select: { id: true, ownerSessionId: true, displayName: true, status: true, characterReferenceUrl: true, voiceReferenceUrl: true, voiceMode: true, expiresAt: true, failureReason: true } });
    if (!asset) throw new NotFoundException('self-insert asset not found');
    this.assertOwner(asset.ownerSessionId, ownerSessionId);
    return { id: asset.id, displayName: asset.displayName, status: asset.status, voiceMode: asset.voiceMode, expiresAt: asset.expiresAt, failureReason: asset.failureReason, hasCharacterReference: Boolean(asset.characterReferenceUrl), hasVoiceReference: Boolean(asset.voiceReferenceUrl) };
  }

  async delete(assetId: string, ownerSessionId?: string) {
    const asset = await this.prisma.selfInsertAsset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException('self-insert asset not found');
    this.assertOwner(asset.ownerSessionId, ownerSessionId);
    await Promise.all([asset.photoSourceUrl, asset.voiceSourceUrl, asset.characterReferenceUrl, asset.voiceReferenceUrl].filter(Boolean).map((url) => this.storage.deletePublicUrl(url as string)));
    await this.prisma.$transaction([
      this.prisma.selfInsertAsset.update({ where: { id: assetId }, data: { status: SelfInsertStatus.DELETED, photoSourceUrl: null, voiceSourceUrl: null, characterReferenceUrl: null, voiceReferenceUrl: null, deletedAt: new Date() } }),
      this.prisma.consentRecord.update({ where: { id: asset.consentRecordId }, data: { withdrawnAt: new Date() } }),
    ]);
    return { assetId, status: 'DELETED' };
  }

  private assertOwner(expected: string, received?: string) { if (!received || received !== expected) throw new ForbiddenException('valid x-toonswap-session header required'); }
}
