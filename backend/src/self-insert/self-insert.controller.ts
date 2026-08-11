import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Readable } from 'stream';
import { CreateSelfInsertDto } from './dto/create-self-insert.dto';
import { CreateUploadSessionDto } from './dto/create-upload-session.dto';
import { SelfInsertService } from './self-insert.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/x-m4a'];

@Controller('api/self-insert')
export class SelfInsertController {
  constructor(private readonly selfInsert: SelfInsertService) {}
  @Get('capabilities') capabilities() {
    return this.selfInsert.capabilities();
  }
  @Post('upload-sessions') createUploadSession(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateUploadSessionDto,
  ) {
    return this.selfInsert.createUploadSession(user.id, body);
  }
  @Post('assets/:assetId/finalize') finalize(
    @Param('assetId') assetId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.selfInsert.finalizeUpload(assetId, user.id);
  }
  @Get('assets/:assetId/media/:kind')
  async media(
    @Param('assetId') assetId: string,
    @Param('kind') kind: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const object = await this.selfInsert.media(assetId, kind, user.id);
    response.setHeader('Content-Type', object.ContentType || 'application/octet-stream');
    response.setHeader('Cache-Control', 'private, no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    if (object.ContentLength) response.setHeader('Content-Length', String(object.ContentLength));
    return new StreamableFile(object.Body as Readable);
  }
  @Post('assets')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'photo', maxCount: 1 },
        { name: 'voice', maxCount: 1 },
      ],
      { limits: { fileSize: 15 * 1024 * 1024, files: 2 } },
    ),
  )
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateSelfInsertDto,
    @UploadedFiles() files: { photo?: Express.Multer.File[]; voice?: Express.Multer.File[] },
  ) {
    const photo = files?.photo?.[0];
    const voice = files?.voice?.[0];
    if (photo && !IMAGE_TYPES.includes(photo.mimetype))
      throw new BadRequestException('photo must be JPG, PNG, or WebP');
    if (voice && !AUDIO_TYPES.includes(voice.mimetype))
      throw new BadRequestException('voice must be MP3, M4A, WAV, or WebM');
    return this.selfInsert.create(user.id, body, { photo, voice });
  }
  @Get('assets/:assetId') get(
    @Param('assetId') assetId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.selfInsert.get(assetId, user.id);
  }
  @Delete('assets/:assetId') delete(
    @Param('assetId') assetId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.selfInsert.delete(assetId, user.id);
  }
}
