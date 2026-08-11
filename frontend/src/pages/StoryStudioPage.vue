<script setup>
import { computed, ref } from 'vue';
import PlatformPageShell from '../components/PlatformPageShell.vue';
import { characterCatalog, languageSamples, worlds } from '../data/platformCatalog';
import { useProjectStore } from '../stores/projectStore';

const store = useProjectStore();
const castQuery = ref('');
const showCastPicker = ref(false);
const briefReady = ref(false);
const mediaConsent = ref(false);
const identityFileName = ref('');

const durationLabel = computed(() => {
  const seconds = Number(store.project.duration);
  if (seconds < 60) return `${seconds} seconds`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder ? `${minutes}m ${remainder}s` : `${minutes} minutes`;
});
const filteredCast = computed(() => characterCatalog.filter((character) => `${character.name} ${character.world} ${character.role}`.toLowerCase().includes(castQuery.value.toLowerCase())).slice(0, 36));

function toggleCast(character) {
  const exists = store.project.cast.some((item) => item.id === character.id);
  const cast = exists ? store.project.cast.filter((item) => item.id !== character.id) : [...store.project.cast, character];
  store.updateProject({ cast });
}

function onIdentityFile(event) {
  identityFileName.value = event.target.files?.[0]?.name || '';
}

function prepareBrief() {
  store.persist();
  briefReady.value = true;
}
</script>

<template>
  <PlatformPageShell eyebrow="Multi-character production" title="Plan the whole story. Change any scene." description="Describe the situation, cast original characters, direct dialogue or songs, set movement and camera notes, then revise one scene without losing the rest of your film." accent="#7152f3" stat="15 sec → 60 min" status="Interactive storyboard prototype · rendering backend not connected">
    <section class="story-workspace section-pad">
      <aside class="studio-sidebar">
        <div class="studio-panel-title"><span>01</span><div><b>Story brief</b><small>What should happen?</small></div></div>
        <label><span>Project title</span><input v-model="store.project.title" @change="store.persist" /></label>
        <label><span>Prompt for the future AI story planner</span><textarea v-model="store.project.prompt" rows="7" placeholder="Example: In a moonlit village, a nervous seed-postman and a fearless grandmother investigate why every shadow has started singing. Keep it funny, warm, and suitable for families." @change="store.persist"></textarea></label>
        <div class="studio-two"><label><span>World / era</span><select v-model="store.project.era" @change="store.persist"><option v-for="world in worlds" :key="world.id" :value="world.id">{{ world.name }}</option></select></label><label><span>Genre</span><select v-model="store.project.genre" @change="store.persist"><option>Comedy adventure</option><option>Village mystery</option><option>Family slice of life</option><option>Friendly ghost story</option><option>Musical comedy</option><option>Science fantasy</option><option>Folklore quest</option></select></label></div>
        <label><span>Main language</span><select v-model="store.project.language" @change="store.persist"><option v-for="language in languageSamples" :key="language">{{ language }}</option></select></label>
        <label class="duration-control"><span>Target length <b>{{ durationLabel }}</b></span><input v-model.number="store.project.duration" type="range" min="15" max="3600" step="15" @change="store.persist" /><small>Minimum 15 seconds · maximum 1 hour</small></label>
        <button class="studio-primary" type="button" @click="store.planFromPrompt">Draft editable storyboard <span>→</span></button>
        <p class="prototype-note">This drafts a local scene structure from your brief. A production AI planner, moderation pass, translation, and render queue are later backend phases.</p>

        <div class="studio-panel-title cast-title"><span>02</span><div><b>Cast</b><small>{{ store.project.cast.length }} selected</small></div></div>
        <div class="selected-cast"><button v-for="character in store.project.cast" :key="character.id" type="button" :style="{ '--cast-color': character.color }" @click="toggleCast(character)"><span>{{ character.mark }}</span>{{ character.name }} <b>×</b></button><p v-if="!store.project.cast.length">Add original characters from the library.</p></div>
        <button class="studio-secondary" type="button" @click="showCastPicker = !showCastPicker">{{ showCastPicker ? 'Close cast picker' : 'Choose from 108 originals' }}</button>
        <div v-if="showCastPicker" class="cast-picker"><input v-model="castQuery" type="search" placeholder="Search cast…" /><button v-for="character in filteredCast" :key="character.id" type="button" :class="{ selected: store.project.cast.some((item) => item.id === character.id) }" @click="toggleCast(character)"><span :style="{ background: character.color }">{{ character.mark }}</span><b>{{ character.name }}</b><small>{{ character.role }}</small></button></div>

        <div class="identity-panel">
          <div class="studio-panel-title"><span>+</span><div><b>Consented family cameo</b><small>Optional production input</small></div></div>
          <p>Use only a photo or voice from somebody who understands and permits the transformation.</p>
          <label class="identity-upload"><input type="file" accept="image/jpeg,image/png,image/webp,audio/*" :disabled="!mediaConsent" @change="onIdentityFile" /><span>{{ identityFileName || 'Choose consented media' }}</span></label>
          <label class="consent-check"><input v-model="mediaConsent" type="checkbox" /><span>I have explicit permission, including guardian permission where legally required.</span></label>
        </div>
      </aside>

      <div class="timeline-workspace">
        <div class="timeline-header"><div><span>03</span><div><b>Scene timeline</b><small>{{ store.scenes.length }} scenes · {{ store.totalDuration }} planned seconds</small></div></div><button type="button" @click="store.addScene">+ Add scene</button></div>
        <div class="timeline-ruler"><span v-for="(scene, index) in store.scenes" :key="scene.id" :style="{ flex: Math.max(1, scene.duration) }"><b>{{ index + 1 }}</b>{{ scene.duration }}s</span></div>

        <article v-for="(scene, index) in store.scenes" :key="scene.id" class="scene-editor">
          <div class="scene-number"><span>{{ String(index + 1).padStart(2, '0') }}</span><i></i></div>
          <div class="scene-fields">
            <div class="scene-top"><input v-model="scene.title" aria-label="Scene title" @change="store.persist" /><div><button type="button" :disabled="index === 0" aria-label="Move scene up" @click="store.moveScene(index, -1)">↑</button><button type="button" :disabled="index === store.scenes.length - 1" aria-label="Move scene down" @click="store.moveScene(index, 1)">↓</button><button type="button" aria-label="Duplicate scene" @click="store.duplicateScene(index)">⧉</button><button type="button" aria-label="Delete scene" @click="store.removeScene(index)">×</button></div></div>
            <div class="scene-grid"><label><span>Cast in this scene</span><input v-model="scene.character" @change="store.persist" /></label><label><span>Location / set</span><input v-model="scene.location" @change="store.persist" /></label><label><span>Duration</span><input v-model.number="scene.duration" type="number" min="1" max="300" @change="store.persist" /></label><label><span>Expression</span><select v-model="scene.expression" @change="store.persist"><option>neutral</option><option>curious</option><option>joyful</option><option>surprised</option><option>confident</option><option>panicked</option><option>warm</option><option>sad</option><option>angry</option><option>singing</option></select></label></div>
            <label><span>Action and movement</span><textarea v-model="scene.action" rows="2" @change="store.persist"></textarea></label>
            <label><span>Dialogue, narration, or song lyrics</span><textarea v-model="scene.dialogue" rows="2" placeholder="Write original dialogue or lyrics. Do not paste copyrighted songs." @change="store.persist"></textarea></label>
            <div class="scene-grid"><label><span>Camera</span><select v-model="scene.camera" @change="store.persist"><option>Wide establishing shot</option><option>Medium action shot</option><option>Close reaction</option><option>Two-shot with inserts</option><option>Tracking shot</option><option>Overhead reveal</option><option>Handheld comedy</option></select></label><label><span>Audio mode</span><select v-model="scene.audioMode" @change="store.persist"><option>Dialogue</option><option>Narration</option><option>Original song</option><option>Music and action only</option></select></label><label><span>Regeneration scope</span><select v-model="scene.changeScope" @change="store.persist"><option>Keep everything</option><option>Change video only</option><option>Change voice only</option><option>Change background only</option><option>Change movement only</option></select></label><label><span>Continuity</span><input v-model="scene.continuity" placeholder="Props, clothing, story facts…" @change="store.persist" /></label></div>
          </div>
        </article>
        <button class="add-scene-large" type="button" @click="store.addScene">+ Add another editable scene</button>

        <div class="render-brief">
          <div><p class="kicker">Production handoff</p><h2>Lock a storyboard before spending on render calls.</h2><p>Every scene remains independently replaceable, so a voice, background, movement, or shot can change without rebuilding the entire film.</p></div>
          <button type="button" @click="prepareBrief">Prepare production brief</button>
        </div>
        <div v-if="briefReady" class="brief-ready" role="status"><span>✓</span><div><b>Project brief saved locally</b><p>{{ store.project.title }} · {{ store.scenes.length }} scenes · {{ store.totalDuration }} seconds · {{ store.project.cast.length }} cast members. Rendering remains disabled until secure backend storage, moderation, provider adapters, cost approval, and resumable queues are implemented.</p></div></div>
      </div>
    </section>
  </PlatformPageShell>
</template>
