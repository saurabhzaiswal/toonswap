import { Injectable } from '@nestjs/common';

@Injectable()
export class StudioService {
  capabilities() {
    return {
      projectStorage: 'implemented',
      sceneVersionModel: 'implemented',
      catalogApi: 'implemented-in-dedicated-module',
      selfInsertRecords: 'implemented-in-dedicated-module',
      selfInsertProviderQueue: 'safety-and-provider-gated',
      storyPlanner: 'local-prototype-only',
      renderQueue: 'not-connected',
      voiceSynthesis: 'not-connected-for-story-rendering',
      moderation: 'regex-first-pass; media moderation required before provider calls',
      limits: { minimumSeconds: 15, maximumSeconds: 3600 },
    };
  }
}
