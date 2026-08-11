import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Generic, original voice presets. Each voiceId points to a voice YOU design
// and register in ElevenLabs (Voice Design / Voice Library) — never a clone
// of a real actor or a copyrighted character's exact voice performance.
export const VOICE_PRESETS: Record<string, { voiceId: string; label: string }> = {
  'bhojpuri-comedy-uncle': {
    voiceId: 'REPLACE_WITH_YOUR_ELEVENLABS_VOICE_ID',
    label: 'Bhojpuri Comedy Uncle',
  },
  'bhojpuri-funny-aunty': {
    voiceId: 'REPLACE_WITH_YOUR_ELEVENLABS_VOICE_ID',
    label: 'Bhojpuri Funny Aunty',
  },
  'kannada-funny-boy': {
    voiceId: 'REPLACE_WITH_YOUR_ELEVENLABS_VOICE_ID',
    label: 'Kannada Funny Boy',
  },
  'kannada-comedy-thatha': {
    voiceId: 'REPLACE_WITH_YOUR_ELEVENLABS_VOICE_ID',
    label: 'Kannada Comedy Thatha',
  },
};

@Injectable()
export class AudioGeneratorService {
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('ELEVENLABS_API_KEY') as string;
  }

  async generateRegionalComedyVoice(text: string, voiceStyle: string): Promise<Buffer> {
    const preset = VOICE_PRESETS[voiceStyle];
    if (!preset) {
      throw new Error(`unknown voiceStyle: ${voiceStyle}`);
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${preset.voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.35,
          similarity_boost: 0.75,
          style: 0.45,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`TTS generation failed: ${response.status} ${await response.text()}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }
}
