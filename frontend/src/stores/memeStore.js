import { defineStore } from 'pinia';

const backendOrigin = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const API_BASE = `${backendOrigin}/api/meme`;
const POLL_INTERVAL_MS = 2500;
const MAX_POLL_ATTEMPTS = 60;

export const useMemeStore = defineStore('meme', {
  state: () => ({
    selectedCharacter: null,
    selfieFile: null,
    selfiePreviewUrl: null,
    inputMode: 'text',
    scriptText: '',
    language: 'hindi',
    voiceStyle: 'bhojpuri-comedy-uncle',
    voiceFile: null,
    sessionId: null,
    status: 'idle',
    outputUrl: null,
    errorMessage: null,
  }),

  getters: {
    canGenerate(state) {
      const hasScript = state.inputMode === 'text' && state.scriptText.trim().length > 0;
      const hasVoice = state.inputMode === 'voice' && !!state.voiceFile;
      return !!state.selectedCharacter && !!state.selfieFile && (hasScript || hasVoice);
    },
    isProcessing(state) {
      return ['uploading', 'PENDING', 'PROCESSING'].includes(state.status);
    },
  },

  actions: {
    selectCharacter(characterId) {
      this.selectedCharacter = characterId;
    },

    setSelfie(file) {
      if (this.selfiePreviewUrl) URL.revokeObjectURL(this.selfiePreviewUrl);
      this.selfieFile = file;
      this.selfiePreviewUrl = file ? URL.createObjectURL(file) : null;
    },

    setVoiceFile(file) {
      this.voiceFile = file;
    },

    reset() {
      this.sessionId = null;
      this.status = 'idle';
      this.outputUrl = null;
      this.errorMessage = null;
    },

    async generate() {
      if (!this.canGenerate || this.isProcessing) return;

      this.status = 'uploading';
      this.errorMessage = null;

      const form = new FormData();
      form.append('character', this.selectedCharacter);
      form.append('selfie', this.selfieFile);
      form.append('language', this.language);
      if (this.inputMode === 'voice' && this.voiceFile) {
        form.append('voice', this.voiceFile);
      } else {
        form.append('scriptText', this.scriptText.trim());
        form.append('voiceStyle', this.voiceStyle);
      }

      try {
        const res = await fetch(`${API_BASE}/generate`, { method: 'POST', body: form });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
          throw new Error(message ?? `Request failed (${res.status})`);
        }
        const data = await res.json();
        this.sessionId = data.sessionId;
        this.status = data.status;
        await this.pollStatus();
      } catch (err) {
        this.status = 'FAILED';
        this.errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      }
    },

    async pollStatus() {
      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

        try {
          const res = await fetch(`${API_BASE}/${this.sessionId}/status`);
          if (!res.ok) continue;
          const data = await res.json();
          this.status = data.status;

          if (data.status === 'DONE') {
            this.outputUrl = data.outputUrl;
            return;
          }
          if (data.status === 'FAILED') {
            this.errorMessage = data.errorMessage ?? 'Generation failed';
            return;
          }
        } catch {
          // Brief network interruptions are tolerated while the worker is active.
        }
      }
      this.status = 'FAILED';
      this.errorMessage = 'Your video is taking longer than expected. Please try again.';
    },
  },
});
