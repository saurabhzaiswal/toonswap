import { BadRequestException, Body, Controller, Delete, Get, Headers, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreateSelfInsertDto } from './dto/create-self-insert.dto';
import { SelfInsertService } from './self-insert.service';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/x-m4a'];

@Controller('api/self-insert')
export class SelfInsertController {
  constructor(private readonly selfInsert: SelfInsertService) {}
  @Get('capabilities') capabilities() { return this.selfInsert.capabilities(); }
  @Post('assets')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'photo', maxCount: 1 }, { name: 'voice', maxCount: 1 }], { limits: { fileSize: 15 * 1024 * 1024, files: 2 } }))
  create(@Body() body: CreateSelfInsertDto, @UploadedFiles() files: { photo?: Express.Multer.File[]; voice?: Express.Multer.File[] }) {
    const photo = files?.photo?.[0]; const voice = files?.voice?.[0];
    if (photo && !IMAGE_TYPES.includes(photo.mimetype)) throw new BadRequestException('photo must be JPG, PNG, or WebP');
    if (voice && !AUDIO_TYPES.includes(voice.mimetype)) throw new BadRequestException('voice must be MP3, M4A, WAV, or WebM');
    return this.selfInsert.create(body, { photo, voice });
  }
  @Get('assets/:assetId') get(@Param('assetId') assetId: string, @Headers('x-toonswap-session') session?: string) { return this.selfInsert.get(assetId, session); }
  @Delete('assets/:assetId') delete(@Param('assetId') assetId: string, @Headers('x-toonswap-session') session?: string) { return this.selfInsert.delete(assetId, session); }
}
