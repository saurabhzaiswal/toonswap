import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MemeService } from './meme.service';
import { checkScriptText } from './content-filter.util';
import { VOICE_PRESETS } from './audio-generator.service';

interface GenerateMemeBody {
  character: string;
  language?: string;
  voiceStyle?: string;
  scriptText?: string;
}

interface UploadedMemeFiles {
  selfie?: Express.Multer.File[];
  voice?: Express.Multer.File[];
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm'];
const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB

@Controller('api/meme')
export class MemeController {
  constructor(private readonly memeService: MemeService) {}

  @Post('generate')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'selfie', maxCount: 1 },
        { name: 'voice', maxCount: 1 },
      ],
      { limits: { fileSize: MAX_FILE_BYTES } },
    ),
  )
  async generate(
    @Body() body: GenerateMemeBody,
    @UploadedFiles() files: UploadedMemeFiles,
  ) {
    if (!body.character) {
      throw new BadRequestException('character is required');
    }

    const selfie = files.selfie?.[0];
    if (!selfie) {
      throw new BadRequestException('selfie file is required');
    }
    if (!ALLOWED_IMAGE_TYPES.includes(selfie.mimetype)) {
      throw new BadRequestException('selfie must be jpeg, png, or webp');
    }

    const voice = files.voice?.[0];
    if (voice && !ALLOWED_AUDIO_TYPES.includes(voice.mimetype)) {
      throw new BadRequestException('voice must be mpeg, mp4, wav, or webm audio');
    }

    if (!voice && !body.scriptText?.trim()) {
      throw new BadRequestException('either a voice recording or scriptText is required');
    }

    // Text-driven jobs go through a regional generic voice preset — validate
    // both the preset (never a real-person clone) and the script content.
    if (!voice) {
      const voiceStyle = body.voiceStyle;
      if (!voiceStyle || !VOICE_PRESETS[voiceStyle]) {
        throw new BadRequestException('a valid voiceStyle is required when not recording your own voice');
      }
      const check = checkScriptText(body.scriptText as string);
      if (!check.allowed) {
        throw new BadRequestException(check.reason);
      }
    }

    const job = await this.memeService.createJob({
      character: body.character,
      language: body.language ?? 'hindi',
      voiceStyle: body.voiceStyle,
      scriptText: body.scriptText,
      selfie,
      voice,
    });

    return { sessionId: job.id, status: job.status };
  }

  @Get(':sessionId/status')
  async getStatus(@Param('sessionId') sessionId: string) {
    return this.memeService.getStatus(sessionId);
  }
}
