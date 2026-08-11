import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MediaStorageModule } from '../media/media-storage.module';
import { ModerationModule } from '../moderation/moderation.module';
import { SelfInsertController } from './self-insert.controller';
import { SelfInsertProcessor } from './self-insert.processor';
import { SELF_INSERT_QUEUE, SelfInsertService } from './self-insert.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: SELF_INSERT_QUEUE }),
    MediaStorageModule,
    ModerationModule,
  ],
  controllers: [SelfInsertController],
  providers: [SelfInsertService, SelfInsertProcessor],
  exports: [SelfInsertService],
})
export class SelfInsertModule {}
