import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MediaStorageModule } from '../media/media-storage.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [AuthModule, MediaStorageModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
