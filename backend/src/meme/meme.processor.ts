import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import Replicate from 'replicate';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { PrismaService } from './prisma.service';
import { StorageService } from '../media/storage.service';
import { AudioGeneratorService } from './audio-generator.service';
import { MEME_QUEUE_NAME } from './meme.service';

// Maps our internal (original, non-infringing) character names to their
// base template video + reference voice-model asset stored in our bucket.
const TEMPLATE_ASSET_BASE_URL =
  process.env.TEMPLATE_ASSET_BASE_URL || 'https://toonswap.vercel.app';
const CHARACTER_TEMPLATES: Record<string, { templateVideoUrl: string; voiceModelId: string }> = {
  'chulbul-the-naughty-kid': {
    templateVideoUrl: `${TEMPLATE_ASSET_BASE_URL}/templates/chulbul_base.mp4`,
    voiceModelId: 'toonswap-chulbul-v1',
  },
  'robo-guru': {
    templateVideoUrl: `${TEMPLATE_ASSET_BASE_URL}/templates/robo_guru_base.mp4`,
    voiceModelId: 'toonswap-robo-guru-v1',
  },
  'ninja-chotu': {
    templateVideoUrl: `${TEMPLATE_ASSET_BASE_URL}/templates/ninja_chotu_base.mp4`,
    voiceModelId: 'toonswap-ninja-chotu-v1',
  },
};

const FACE_SWAP_MODEL =
  'lucataco/live-portrait:a141dc634c78fb7d1f5b4c5cd8bfa38dd25f6c7c1e91d18e5aae0c5d0dd3d3e';

interface MemeJobData {
  jobId: string;
}

@Processor(MEME_QUEUE_NAME, { concurrency: 3 })
export class MemeProcessor extends WorkerHost {
  private readonly logger = new Logger(MemeProcessor.name);
  private readonly replicate: Replicate;
  private readonly elevenLabsApiKey: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly config: ConfigService,
    private readonly audioGenerator: AudioGeneratorService,
  ) {
    super();
    this.replicate = new Replicate({
      auth: this.config.get<string>('REPLICATE_API_TOKEN'),
    });
    this.elevenLabsApiKey = this.config.get<string>('ELEVENLABS_API_KEY') as string;
  }

  async process(job: Job<MemeJobData>): Promise<void> {
    const { jobId } = job.data;
    const record = await this.prisma.memeJob.findUniqueOrThrow({ where: { id: jobId } });

    await this.prisma.memeJob.update({
      where: { id: jobId },
      data: { status: 'PROCESSING' },
    });

    const template = CHARACTER_TEMPLATES[record.character];
    if (!template) {
      await this.fail(jobId, `unknown character: ${record.character}`);
      return;
    }

    const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'toonswap-'));

    try {
      this.logger.log(`[${jobId}] starting face swap`);
      const faceSwapOutput = await this.replicate.run(FACE_SWAP_MODEL, {
        input: {
          source_image: record.selfieUrl,
          target_video: template.templateVideoUrl,
        },
      });

      const swappedVideoUrl = Array.isArray(faceSwapOutput)
        ? (faceSwapOutput[0] as string)
        : (faceSwapOutput as unknown as string);

      this.logger.log(
        `[${jobId}] generating voice track (${record.voiceUrl ? 'speech-to-speech' : `regional TTS: ${record.voiceStyle}`})`,
      );
      const audioBuffer = record.voiceUrl
        ? await this.convertVoice({
            voiceModelId: template.voiceModelId,
            sourceAudioUrl: record.voiceUrl,
            scriptText: record.scriptText,
          })
        : await this.audioGenerator.generateRegionalComedyVoice(
            record.scriptText as string,
            record.voiceStyle,
          );

      const localVideoPath = path.join(workDir, 'swapped.mp4');
      const localAudioPath = path.join(workDir, 'voice.mp3');
      const outputPath = path.join(workDir, 'final.mp4');

      await this.downloadToFile(swappedVideoUrl, localVideoPath);
      await fs.writeFile(localAudioPath, audioBuffer);

      this.logger.log(`[${jobId}] stitching audio + video`);
      await this.stitchAudioVideo(localVideoPath, localAudioPath, outputPath, record.watermarked);

      const outputBuffer = await fs.readFile(outputPath);
      const finalUrl = await this.storage.uploadBuffer(outputBuffer, 'video/mp4', 'outputs');

      await this.prisma.memeJob.update({
        where: { id: jobId },
        data: { status: 'DONE', outputUrl: finalUrl },
      });

      this.logger.log(`[${jobId}] completed -> ${finalUrl}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown processing error';
      await this.fail(jobId, message);
    } finally {
      await fs.rm(workDir, { recursive: true, force: true });
    }
  }

  private async convertVoice(opts: {
    voiceModelId: string;
    sourceAudioUrl: string | null;
    scriptText: string | null;
  }): Promise<Buffer> {
    // If the user recorded their own voice, run it through voice conversion
    // (speech-to-speech). Otherwise fall back to text-to-speech using the
    // character voice model.
    const endpoint = opts.sourceAudioUrl
      ? `https://api.elevenlabs.io/v1/speech-to-speech/${opts.voiceModelId}`
      : `https://api.elevenlabs.io/v1/text-to-speech/${opts.voiceModelId}`;

    const body = opts.sourceAudioUrl
      ? await this.buildAudioFormData(opts.sourceAudioUrl)
      : JSON.stringify({ text: opts.scriptText, model_id: 'eleven_multilingual_v2' });

    const headers: Record<string, string> = {
      'xi-api-key': this.elevenLabsApiKey,
    };
    if (!opts.sourceAudioUrl) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(endpoint, { method: 'POST', headers, body });
    if (!response.ok) {
      throw new Error(`voice conversion failed: ${response.status} ${await response.text()}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private async buildAudioFormData(sourceAudioUrl: string): Promise<FormData> {
    const res = await fetch(sourceAudioUrl);
    const blob = await res.blob();
    const form = new FormData();
    form.append('audio', blob, 'input.wav');
    form.append('model_id', 'eleven_multilingual_sts_v2');
    return form;
  }

  private async downloadToFile(url: string, destPath: string): Promise<void> {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`failed to download ${url}: ${res.status}`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(destPath, buffer);
  }

  private stitchAudioVideo(
    videoPath: string,
    audioPath: string,
    outputPath: string,
    addWatermark: boolean,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(videoPath)
        .input(audioPath)
        .outputOptions(['-map 0:v:0', '-map 1:a:0', '-c:v copy', '-shortest']);

      if (addWatermark) {
        command = command
          .videoFilters(
            "drawtext=text='ToonSwap Preview':fontcolor=white@0.8:fontsize=28:x=w-tw-20:y=h-th-20",
          )
          .outputOptions(['-c:v libx264', '-crf 28']);
      }

      command
        .on('error', reject)
        .on('end', () => resolve())
        .save(outputPath);
    });
  }

  private async fail(jobId: string, message: string): Promise<void> {
    this.logger.error(`[${jobId}] failed: ${message}`);
    await this.prisma.memeJob.update({
      where: { id: jobId },
      data: { status: 'FAILED', errorMessage: message.slice(0, 500) },
    });
  }
}
