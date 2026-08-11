import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MemeController } from './meme.controller';
import { MemeService, MEME_QUEUE_NAME } from './meme.service';
import { MemeProcessor } from './meme.processor';
import { PrismaService } from './prisma.service';
import { StorageService } from './storage.service';
import { AudioGeneratorService } from './audio-generator.service';

@Module({
  imports: [BullModule.registerQueue({ name: MEME_QUEUE_NAME })],
  controllers: [MemeController],
  providers: [MemeService, MemeProcessor, PrismaService, StorageService, AudioGeneratorService],
})
export class MemeModule {}
