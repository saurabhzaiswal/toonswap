import { defineStore } from 'pinia';

const storageKey = 'toonswap-project-studio-v1';
const backendOrigin = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const defaultScenes = [
  { id: 'scene-1', title: 'Meet the hero', duration: 8, character: 'Lead character', location: 'Opening location', action: 'Show the world, the hero, and what they want.', dialogue: '', expression: 'curious', camera: 'Wide establishing shot', audioMode: 'Narration', changeScope: 'Keep everything', continuity: '' },
  { id: 'scene-2', title: 'A funny surprise', duration: 10, character: 'Full cast', location: 'Main location', action: 'A playful problem changes the plan.', dialogue: '', expression: 'surprised', camera: 'Medium action shot', audioMode: 'Dialogue', changeScope: 'Keep everything', continuity: '' },
  { id: 'scene-3', title: 'The big smile', duration: 7, character: 'Lead character', location: 'Closing location', action: 'Solve the problem with an original visual punchline.', dialogue: '', expression: 'joyful', camera: 'Close reaction and pull back', audioMode: 'Music and action only', changeScope: 'Keep everything', continuity: '' },
];

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useProjectStore = defineStore('projectStudio', {
  state: () => ({
    hydrated: false,
    characterDrafts: [],
    selectedVoice: null,
    storyIdeaAudio: { file: null, name: '', duration: 0 },
    selfInsert: {
      displayName: 'Me in the story', photoFile: null, photoPreviewUrl: '', voiceFile: null, voiceName: '',
      voiceMode: 'as-is', voiceStyle: 'warm-story', consentIdentity: false, consentRetention: false,
      savedCharacterId: '', assetId: '', ownerSessionId: '', status: 'local-draft', uploadError: '',
    },
    project: {
      title: 'Untitled ToonSwap story',
      prompt: '',
      era: 'stone-spark',
      genre: 'Comedy adventure',
      duration: 30,
      language: 'Hindi',
      audience: 'Family',
      visualStyle: 'Warm 2D adventure',
      captions: true,
      mode: 'simple',
      cast: [],
    },
    scenes: defaultScenes,
  }),

  getters: {
    totalDuration(state) {
      return state.scenes.reduce((total, scene) => total + Number(scene.duration || 0), 0);
    },
  },

  actions: {
    hydrate() {
      if (this.hydrated) return;
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey));
        if (saved?.project) this.project = { ...this.project, ...saved.project };
        if (Array.isArray(saved?.scenes)) this.scenes = saved.scenes.map((scene) => ({
          ...scene,
          duration: Math.min(900, Math.max(1, Number(scene.duration) || 8)),
          audioMode: scene.audioMode || 'Narration',
          changeScope: scene.changeScope || 'Keep everything',
          continuity: scene.continuity || '',
        }));
        if (Array.isArray(saved?.characterDrafts)) this.characterDrafts = saved.characterDrafts;
        if (saved?.selectedVoice) this.selectedVoice = saved.selectedVoice;
        if (saved?.selfInsert) this.selfInsert = { ...this.selfInsert, ...saved.selfInsert, photoFile: null, photoPreviewUrl: '', voiceFile: null, voiceName: '', uploadError: '' };
      } catch {
        // A corrupt local draft should not block the studio.
      }
      this.project.duration = Math.min(3600, Math.max(15, Number(this.project.duration) || 30));
      this.hydrated = true;
    },
    persist() {
      localStorage.setItem(storageKey, JSON.stringify({
        project: this.project,
        scenes: this.scenes,
        characterDrafts: this.characterDrafts,
        selectedVoice: this.selectedVoice,
        selfInsert: {
          displayName: this.selfInsert.displayName, voiceMode: this.selfInsert.voiceMode, voiceStyle: this.selfInsert.voiceStyle,
          consentIdentity: false, consentRetention: false, savedCharacterId: this.selfInsert.savedCharacterId, assetId: this.selfInsert.assetId,
          ownerSessionId: this.selfInsert.ownerSessionId, status: this.selfInsert.status,
        },
      }));
    },
    saveCharacter(draft) {
      const character = { ...draft, id: createId('custom-character'), savedAt: new Date().toISOString() };
      this.characterDrafts.unshift(character);
      this.persist();
      return character;
    },
    selectVoice(voice) {
      this.selectedVoice = voice;
      this.persist();
    },
    setStoryIdeaAudio(file, duration = 0) {
      this.storyIdeaAudio = { file, name: file?.name || 'Spoken story idea', duration };
    },
    setSelfInsertPhoto(file) {
      if (this.selfInsert.photoPreviewUrl) URL.revokeObjectURL(this.selfInsert.photoPreviewUrl);
      this.selfInsert.photoFile = file;
      this.selfInsert.photoPreviewUrl = file ? URL.createObjectURL(file) : '';
      this.selfInsert.status = 'local-draft';
    },
    setSelfInsertVoice(file) {
      this.selfInsert.voiceFile = file;
      this.selfInsert.voiceName = file?.name || '';
      this.selfInsert.status = 'local-draft';
    },
    addSelfInsertToCast() {
      if ((!this.selfInsert.photoFile && !this.selfInsert.voiceFile) || !this.selfInsert.consentIdentity || !this.selfInsert.consentRetention) return null;
      const id = this.selfInsert.savedCharacterId || createId('self-insert');
      const character = {
        id, name: this.selfInsert.displayName.trim() || 'Me in the story', role: 'Consented self-insert', source: 'self-insert',
        hasPhoto: Boolean(this.selfInsert.photoFile), hasVoice: Boolean(this.selfInsert.voiceFile), voiceMode: this.selfInsert.voiceMode,
        status: 'local-sensitive-draft', personality: 'Directed by the creator', world: 'Your selected story world',
      };
      const cast = this.project.cast.filter((item) => item.id !== id);
      this.project.cast = [character, ...cast];
      this.selfInsert.savedCharacterId = id;
      this.selfInsert.status = 'ready-for-consented-upload';
      this.persist();
      return character;
    },
    async uploadSelfInsertReference() {
      if (!backendOrigin) return { configured: false };
      const form = new FormData();
      if (this.selfInsert.photoFile) form.append('photo', this.selfInsert.photoFile);
      if (this.selfInsert.voiceFile) form.append('voice', this.selfInsert.voiceFile);
      if (this.selfInsert.ownerSessionId) form.append('ownerSessionId', this.selfInsert.ownerSessionId);
      form.append('displayName', this.selfInsert.displayName.trim() || 'Me in the story');
      form.append('voiceMode', this.selfInsert.voiceMode === 'convert' ? 'CONVERT' : 'AS_IS');
      if (this.selfInsert.voiceMode === 'convert') form.append('voiceStyle', this.selfInsert.voiceStyle);
      form.append('likenessAuthorized', String(this.selfInsert.consentIdentity && Boolean(this.selfInsert.photoFile)));
      form.append('voiceAuthorized', String(this.selfInsert.consentIdentity && Boolean(this.selfInsert.voiceFile)));
      form.append('retentionAccepted', String(this.selfInsert.consentRetention));
      form.append('scriptText', this.project.prompt);
      this.selfInsert.status = 'uploading';
      this.selfInsert.uploadError = '';
      try {
        const response = await fetch(`${backendOrigin}/api/self-insert/assets`, { method: 'POST', body: form });
        if (!response.ok) throw new Error((await response.json().catch(() => null))?.message || 'Secure self-insert upload failed');
        const result = await response.json();
        this.selfInsert.assetId = result.assetId;
        this.selfInsert.ownerSessionId = result.ownerSessionId;
        this.selfInsert.status = String(result.status || 'DRAFT').toLowerCase();
        this.project.cast = this.project.cast.map((item) => item.id === this.selfInsert.savedCharacterId ? { ...item, selfInsertAssetId: result.assetId, referenceStatus: result.status } : item);
        this.persist();
        return { configured: true, ...result };
      } catch (error) {
        this.selfInsert.status = 'upload-failed';
        this.selfInsert.uploadError = error instanceof Error ? error.message : 'Secure self-insert upload failed';
        return { configured: true, error: this.selfInsert.uploadError };
      }
    },
    async clearSelfInsert() {
      if (backendOrigin && this.selfInsert.assetId && this.selfInsert.ownerSessionId) {
        await fetch(`${backendOrigin}/api/self-insert/assets/${this.selfInsert.assetId}`, { method: 'DELETE', headers: { 'x-toonswap-session': this.selfInsert.ownerSessionId } }).catch(() => null);
      }
      if (this.selfInsert.photoPreviewUrl) URL.revokeObjectURL(this.selfInsert.photoPreviewUrl);
      const id = this.selfInsert.savedCharacterId;
      this.project.cast = this.project.cast.filter((item) => item.id !== id);
      this.selfInsert = { displayName: 'Me in the story', photoFile: null, photoPreviewUrl: '', voiceFile: null, voiceName: '', voiceMode: 'as-is', voiceStyle: 'warm-story', consentIdentity: false, consentRetention: false, savedCharacterId: '', assetId: '', ownerSessionId: '', status: 'local-draft', uploadError: '' };
      this.persist();
    },
    updateProject(updates) {
      this.project = { ...this.project, ...updates };
      this.persist();
    },
    addScene() {
      this.scenes.push({ id: createId('scene'), title: `Scene ${this.scenes.length + 1}`, duration: 8, character: 'Full cast', location: 'New location', action: 'Describe what happens.', dialogue: '', expression: 'neutral', camera: 'Medium shot', audioMode: 'Narration', changeScope: 'Keep everything', continuity: '' });
      this.persist();
    },
    duplicateScene(index) {
      const source = this.scenes[index];
      this.scenes.splice(index + 1, 0, { ...source, id: createId('scene'), title: `${source.title} copy` });
      this.persist();
    },
    removeScene(index) {
      if (this.scenes.length <= 1) return;
      this.scenes.splice(index, 1);
      this.persist();
    },
    moveScene(index, direction) {
      const target = index + direction;
      if (target < 0 || target >= this.scenes.length) return;
      const [scene] = this.scenes.splice(index, 1);
      this.scenes.splice(target, 0, scene);
      this.persist();
    },
    planFromPrompt() {
      const subject = this.project.prompt.trim() || 'An unexpected invention turns an ordinary day upside down';
      const sceneLength = Math.max(3, Math.floor(Math.min(3600, Math.max(15, Number(this.project.duration) || 30)) / 5));
      this.scenes = [
        { id: createId('scene'), title: 'Meet the world', duration: sceneLength, character: 'Lead character', location: 'Home world', action: `Introduce the cast and the situation: ${subject}`, dialogue: '', expression: 'curious', camera: 'Wide establishing shot', audioMode: 'Narration', changeScope: 'Keep everything', continuity: '' },
        { id: createId('scene'), title: 'Make a plan', duration: sceneLength, character: 'Lead and friend', location: 'Meeting place', action: 'The characters choose a funny solution and commit to it.', dialogue: '', expression: 'confident', camera: 'Two-shot with inserts', audioMode: 'Dialogue', changeScope: 'Keep everything', continuity: '' },
        { id: createId('scene'), title: 'Oops! It grows', duration: sceneLength, character: 'Full cast', location: 'Across the story world', action: 'The plan creates bigger and funnier visual consequences.', dialogue: '', expression: 'panicked', camera: 'Fast montage and tracking shot', audioMode: 'Dialogue', changeScope: 'Keep everything', continuity: '' },
        { id: createId('scene'), title: 'The heart moment', duration: sceneLength, character: 'Lead and family', location: 'Quiet corner of the world', action: 'The characters understand what actually matters.', dialogue: '', expression: 'warm', camera: 'Close reactions', audioMode: 'Narration', changeScope: 'Keep everything', continuity: '' },
        { id: createId('scene'), title: 'Final laugh', duration: sceneLength, character: 'Full cast', location: 'Opening location', action: 'Resolve the story with an original visual callback.', dialogue: '', expression: 'joyful', camera: 'Reveal and pull back', audioMode: 'Music and action only', changeScope: 'Keep everything', continuity: '' },
      ];
      this.persist();
    },
  },
});
