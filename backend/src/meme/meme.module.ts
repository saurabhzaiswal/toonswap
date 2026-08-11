import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MemeController } from './meme.controller';
import { MemeService, MEME_QUEUE_NAME } from './meme.service';
import { MemeProcessor } from './meme.processor';
import { AudioGeneratorService } from './audio-generator.service';
import { MediaStorageModule } from '../media/media-storage.module';
import { UsageModule } from '../usage/usage.module';

@Module({
  imports: [BullModule.registerQueue({ name: MEME_QUEUE_NAME }), MediaStorageModule, UsageModule],
  controllers: [MemeController],
  providers: [MemeService, MemeProcessor, AudioGeneratorService],
})
export class MemeModule {}
