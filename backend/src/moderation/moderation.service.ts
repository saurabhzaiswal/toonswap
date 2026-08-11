import { BadRequestException, Injectable } from '@nestjs/common';
import { checkScriptText } from '../meme/content-filter.util';

@Injectable()
export class ModerationService {
  assertTextAllowed(text?: string) {
    if (!text?.trim()) return;
    const result = checkScriptText(text);
    if (!result.allowed) throw new BadRequestException(result.reason);
  }

  capabilities() {
    return {
      textFilter: 'regex-first-pass',
      imageModeration: 'not-connected',
      audioModeration: 'not-connected',
      productionReady: false,
    };
  }
}
