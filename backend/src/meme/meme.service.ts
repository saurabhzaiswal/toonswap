import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { v7 as uuidv7 } from 'uuid';
import { PrismaService } from './prisma.service';
import { StorageService } from '../media/storage.service';

interface CreateJobInput {
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
    const sessionId = uuidv7();

    const selfieUrl = await this.storage.uploadBuffer(
      input.selfie.buffer,
      input.selfie.mimetype,
      'selfies',
    );

    const voiceUrl = input.voice
      ? await this.storage.uploadBuffer(input.voice.buffer, input.voice.mimetype, 'voices')
      : null;

    const job = await this.prisma.memeJob.create({
      data: {
        id: sessionId,
        character: input.character,
        language: input.language ?? 'hindi',
        voiceStyle: input.voiceStyle ?? 'comedy-uncle',
        selfieUrl,
        voiceUrl,
        scriptText: input.scriptText ?? null,
        status: 'PENDING',
      },
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

  async getStatus(sessionId: string) {
    const job = await this.prisma.memeJob.findUnique({ where: { id: sessionId } });
    if (!job) {
      throw new NotFoundException('session not found');
    }
    return {
      sessionId: job.id,
      status: job.status,
      outputUrl: job.status === 'DONE' ? job.outputUrl : null,
      errorMessage: job.status === 'FAILED' ? job.errorMessage : null,
    };
  }
}
