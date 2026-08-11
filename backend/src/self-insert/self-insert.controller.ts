import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
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

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/x-m4a'];

@Controller('api/self-insert')
export class SelfInsertController {
  constructor(private readonly selfInsert: SelfInsertService) {}
  @Get('capabilities') capabilities() {
    return this.selfInsert.capabilities();
  }
  @Post('upload-sessions') createUploadSession(@Body() body: CreateUploadSessionDto) {
    return this.selfInsert.createUploadSession(body);
  }
  @Post('assets/:assetId/finalize') finalize(
    @Param('assetId') assetId: string,
    @Headers('x-toonswap-session') session?: string,
  ) {
    return this.selfInsert.finalizeUpload(assetId, session);
  }
  @Get('assets/:assetId/media/:kind')
  async media(
    @Param('assetId') assetId: string,
    @Param('kind') kind: string,
    @Headers('x-toonswap-session') session: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    const object = await this.selfInsert.media(assetId, kind, session);
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
    @Body() body: CreateSelfInsertDto,
    @UploadedFiles() files: { photo?: Express.Multer.File[]; voice?: Express.Multer.File[] },
  ) {
    const photo = files?.photo?.[0];
    const voice = files?.voice?.[0];
    if (photo && !IMAGE_TYPES.includes(photo.mimetype))
      throw new BadRequestException('photo must be JPG, PNG, or WebP');
    if (voice && !AUDIO_TYPES.includes(voice.mimetype))
      throw new BadRequestException('voice must be MP3, M4A, WAV, or WebM');
    return this.selfInsert.create(body, { photo, voice });
  }
  @Get('assets/:assetId') get(
    @Param('assetId') assetId: string,
    @Headers('x-toonswap-session') session?: string,
  ) {
    return this.selfInsert.get(assetId, session);
  }
  @Delete('assets/:assetId') delete(
    @Param('assetId') assetId: string,
    @Headers('x-toonswap-session') session?: string,
  ) {
    return this.selfInsert.delete(assetId, session);
  }
}
