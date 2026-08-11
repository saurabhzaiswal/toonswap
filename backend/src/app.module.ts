import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AppConfigModule } from './config/config.module';
import { MemeModule } from './meme/meme.module';
import { DatabaseModule } from './database/database.module';
import { StudioModule } from './studio/studio.module';
import { SelfInsertModule } from './self-insert/self-insert.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD'),
        },
      }),
    }),
    MemeModule,
    StudioModule,
    SelfInsertModule,
  ],
})
export class AppModule {}
