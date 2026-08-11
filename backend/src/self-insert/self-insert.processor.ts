import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { SelfInsertStatus, SelfInsertVoiceMode } from '@prisma/client';
import { Job } from 'bullmq';
import Replicate from 'replicate';
import { PrismaService } from '../database/prisma.service';
import { StorageService } from '../media/storage.service';
import { SELF_INSERT_QUEUE } from './self-insert.service';

@Processor(SELF_INSERT_QUEUE, { concurrency: 2 })
export class SelfInsertProcessor extends WorkerHost {
  private readonly replicate: Replicate;
  constructor(private readonly prisma: PrismaService, private readonly storage: StorageService, private readonly config: ConfigService) { super(); this.replicate = new Replicate({ auth: this.config.get('REPLICATE_API_TOKEN') }); }

  async process(job: Job<{ assetId?: string }>) {
    if (job.name === 'purge-expired') { await this.purgeExpired(); return; }
    if (!job.data.assetId) throw new Error('self-insert asset id is required');
    const asset = await this.prisma.selfInsertAsset.findUniqueOrThrow({ where: { id: job.data.assetId } });
    await this.prisma.selfInsertAsset.update({ where: { id: asset.id }, data: { status: SelfInsertStatus.PROCESSING } });
    try {
      const characterReferenceUrl = asset.photoSourceUrl ? await this.createPhotoReference(asset.photoSourceUrl) : null;
      const voiceReferenceUrl = asset.voiceSourceUrl ? (asset.voiceMode === SelfInsertVoiceMode.AS_IS ? asset.voiceSourceUrl : await this.convertVoice(asset.voiceSourceUrl, asset.voiceStyle)) : null;
      await this.prisma.selfInsertAsset.update({ where: { id: asset.id }, data: { status: SelfInsertStatus.READY, characterReferenceUrl, voiceReferenceUrl } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'self-insert provider failed';
      await this.prisma.selfInsertAsset.update({ where: { id: asset.id }, data: { status: SelfInsertStatus.FAILED, failureReason: message.slice(0, 500) } });
      throw error;
    }
  }

  private async purgeExpired() {
    const assets = await this.prisma.selfInsertAsset.findMany({ where: { expiresAt: { lt: new Date() }, status: { not: SelfInsertStatus.DELETED } }, take: 100 });
    for (const asset of assets) {
      await Promise.all([asset.photoSourceUrl, asset.voiceSourceUrl, asset.characterReferenceUrl, asset.voiceReferenceUrl].filter(Boolean).map((reference) => this.storage.deletePublicUrl(reference as string)));
      await this.prisma.selfInsertAsset.update({ where: { id: asset.id }, data: { status: SelfInsertStatus.DELETED, photoSourceUrl: null, voiceSourceUrl: null, characterReferenceUrl: null, voiceReferenceUrl: null, deletedAt: new Date() } });
    }
  }

  private async createPhotoReference(sourceUrl: string) {
    const model = this.config.get<string>('REPLICATE_SELF_INSERT_MODEL');
    if (!model) throw new Error('REPLICATE_SELF_INSERT_MODEL is not configured');
    const signedSourceUrl = await this.storage.signedReadUrl(sourceUrl);
    const output = await this.replicate.run(model as `${string}/${string}:${string}`, { input: { image: signedSourceUrl, prompt: 'original ToonSwap 2D cartoon character reference, consistent face geometry, family-friendly, no text, no celebrity or copyrighted character styling' } });
    const providerUrl = Array.isArray(output) ? String(output[0]) : String(output);
    const response = await fetch(providerUrl);
    if (!response.ok) throw new Error(`character reference download failed: ${response.status}`);
    return this.storage.uploadPrivateBuffer(Buffer.from(await response.arrayBuffer()), response.headers.get('content-type') || 'image/png', 'self-insert/references');
  }

  private async convertVoice(sourceUrl: string, voiceStyle: string | null) {
    const map = JSON.parse(this.config.get<string>('ELEVENLABS_SELF_INSERT_VOICE_MAP', '{}')) as Record<string, string>;
    const voiceId = map[voiceStyle || ''];
    if (!voiceId) throw new Error('approved original voice style is not configured');
    const source = await fetch(await this.storage.signedReadUrl(sourceUrl));
    const form = new FormData();
    form.append('audio', await source.blob(), 'voice.webm');
    form.append('model_id', 'eleven_multilingual_sts_v2');
    const response = await fetch(`https://api.elevenlabs.io/v1/speech-to-speech/${voiceId}`, { method: 'POST', headers: { 'xi-api-key': this.config.get<string>('ELEVENLABS_API_KEY', '') }, body: form });
    if (!response.ok) throw new Error(`voice conversion failed: ${response.status}`);
    return this.storage.uploadPrivateBuffer(Buffer.from(await response.arrayBuffer()), 'audio/mpeg', 'self-insert/references');
  }
}
