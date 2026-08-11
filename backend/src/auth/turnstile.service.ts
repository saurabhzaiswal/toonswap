import { ForbiddenException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { v7 as uuidv7 } from 'uuid';

interface TurnstileResponse {
  success: boolean;
  hostname?: string;
  action?: string;
  'error-codes'?: string[];
}

@Injectable()
export class TurnstileService {
  constructor(private readonly config: ConfigService) {}

  configPayload() {
    const siteKey = this.config.get<string>('TURNSTILE_SITE_KEY')?.trim();
    const secret = this.config.get<string>('TURNSTILE_SECRET_KEY')?.trim();
    return { enabled: Boolean(siteKey && secret), siteKey: siteKey || null };
  }

  async assertValid(token: string, request: Request, expectedAction: 'login' | 'signup') {
    const secret = this.config.get<string>('TURNSTILE_SECRET_KEY')?.trim();
    if (!secret) throw new ServiceUnavailableException('Turnstile verification is not configured');
    if (!token || token.length > 2048)
      throw new ForbiddenException('complete the human verification and try again');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    let result: TurnstileResponse;
    try {
      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret,
          response: token,
          remoteip: String(request.ip || request.socket.remoteAddress || ''),
          idempotency_key: uuidv7(),
        }),
        signal: controller.signal,
      });
      if (!response.ok)
        throw new ServiceUnavailableException('human verification service is unavailable');
      result = (await response.json()) as TurnstileResponse;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException('human verification service is unavailable');
    } finally {
      clearTimeout(timeout);
    }

    const expectedHostname = this.config.get<string>('TURNSTILE_EXPECTED_HOSTNAME')?.trim();
    if (
      !result.success ||
      result.action !== expectedAction ||
      (expectedHostname && result.hostname !== expectedHostname)
    )
      throw new ForbiddenException('human verification expired or failed; please try again');
  }
}
