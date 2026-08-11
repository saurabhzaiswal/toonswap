import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { v7 as uuidv7 } from 'uuid';
import { PrismaService } from './prisma.service';
import { StorageService } from '../media/storage.service';

interface CreateJobInput {
  userId: string;
  character: string;
  language?: string;
  voiceStyle?: string;
  scriptText?: string;
  selfie: Express.Multer.File;
  voice?: Express.Multer.File;
}

export const MEME_QUEUE_NAME = 'meme-generation';

@Injectable()
export class MemeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    @InjectQueue(MEME_QUEUE_NAME) private readonly memeQueue: Queue,
  ) {}

  async createJob(input: CreateJobInput) {
    const jobId = uuidv7();

    const selfieUrl = await this.storage.uploadBuffer(
      input.selfie.buffer,
      input.selfie.mimetype,
      'selfies',
    );

    const voiceUrl = input.voice
      ? await this.storage.uploadBuffer(input.voice.buffer, input.voice.mimetype, 'voices')
      : null;

    const job = await this.prisma.$transaction(async (database) => {
      const created = await database.memeJob.create({
        data: {
          id: jobId,
          userId: input.userId,
          character: input.character,
          language: input.language ?? 'hindi',
          voiceStyle: input.voiceStyle ?? 'comedy-uncle',
          selfieUrl,
          voiceUrl,
          scriptText: input.scriptText ?? null,
          status: 'PENDING',
        },
      });
      await database.activityLog.create({
        data: {
          id: uuidv7(),
          actorUserId: input.userId,
          subjectUserId: input.userId,
          action: 'GENERATION_REQUESTED',
          entityType: 'MemeJob',
          entityId: created.id,
          entityName: input.character,
          description: 'User submitted a short-form cartoon generation job.',
          metadata: {
            language: created.language,
            voiceInput: Boolean(input.voice),
            watermarked: created.watermarked,
          },
        },
      });
      return created;
    });

    await this.memeQueue.add(
      'generate',
      { jobId: job.id },
      {
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 500,
        removeOnFail: 500,
      },
    );

    return job;
  }

  async getStatus(jobId: string, userId: string) {
    const job = await this.prisma.memeJob.findFirst({ where: { id: jobId, userId } });
    if (!job) {
      throw new NotFoundException('job not found');
    }
    return {
      jobId: job.id,
      status: job.status,
      outputUrl: job.status === 'DONE' ? job.outputUrl : null,
      errorMessage: job.status === 'FAILED' ? job.errorMessage : null,
    };
  }
}
