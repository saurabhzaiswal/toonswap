import { defineStore } from 'pinia';

const storageKey = 'toonswap-project-studio-v1';
const defaultScenes = [
  { id: 'scene-1', title: 'The setup', duration: 8, character: 'Lead character', location: 'Opening location', action: 'Establish the world and the main want.', dialogue: '', expression: 'curious', camera: 'Wide establishing shot' },
  { id: 'scene-2', title: 'The surprise', duration: 10, character: 'Full cast', location: 'Main location', action: 'A funny problem changes the plan.', dialogue: '', expression: 'surprised', camera: 'Medium action shot' },
  { id: 'scene-3', title: 'The payoff', duration: 7, character: 'Lead character', location: 'Closing location', action: 'Resolve with a visual punchline.', dialogue: '', expression: 'joyful', camera: 'Close reaction and pull back' },
];

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useProjectStore = defineStore('projectStudio', {
  state: () => ({
    hydrated: false,
    characterDrafts: [],
    selectedVoice: null,
    project: {
      title: 'Untitled ToonSwap story',
      prompt: '',
      era: 'stone-spark',
      genre: 'Comedy adventure',
      duration: 30,
      language: 'Hindi',
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
        if (Array.isArray(saved?.scenes)) this.scenes = saved.scenes;
        if (Array.isArray(saved?.characterDrafts)) this.characterDrafts = saved.characterDrafts;
        if (saved?.selectedVoice) this.selectedVoice = saved.selectedVoice;
      } catch {
        // A corrupt local draft should not block the studio.
      }
      this.hydrated = true;
    },
    persist() {
      localStorage.setItem(storageKey, JSON.stringify({
        project: this.project,
        scenes: this.scenes,
        characterDrafts: this.characterDrafts,
        selectedVoice: this.selectedVoice,
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
    updateProject(updates) {
      this.project = { ...this.project, ...updates };
      this.persist();
    },
    addScene() {
      this.scenes.push({ id: createId('scene'), title: `Scene ${this.scenes.length + 1}`, duration: 8, character: 'Full cast', location: 'New location', action: 'Describe what happens.', dialogue: '', expression: 'neutral', camera: 'Medium shot' });
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
      this.scenes = [
        { id: createId('scene'), title: 'A normal day', duration: 8, character: 'Lead character', location: 'Home world', action: `Introduce the cast and the situation: ${subject}`, dialogue: '', expression: 'curious', camera: 'Wide establishing shot' },
        { id: createId('scene'), title: 'The plan', duration: 10, character: 'Lead and friend', location: 'Workshop or meeting place', action: 'The characters choose a funny solution and commit to it.', dialogue: '', expression: 'confident', camera: 'Two-shot with inserts' },
        { id: createId('scene'), title: 'Everything moves', duration: 12, character: 'Full cast', location: 'Across the story world', action: 'The plan creates escalating visual consequences.', dialogue: '', expression: 'panicked', camera: 'Fast montage and tracking shot' },
        { id: createId('scene'), title: 'The human moment', duration: 9, character: 'Lead and family', location: 'Quiet corner of the world', action: 'The characters understand what actually matters.', dialogue: '', expression: 'warm', camera: 'Close reactions' },
        { id: createId('scene'), title: 'The final laugh', duration: 6, character: 'Full cast', location: 'Return to opening location', action: 'Resolve the story with an original visual callback.', dialogue: '', expression: 'joyful', camera: 'Reveal and pull back' },
      ];
      this.persist();
    },
  },
});
