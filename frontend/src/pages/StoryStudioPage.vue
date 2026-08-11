<script setup>
import { computed, ref } from 'vue';
import PlatformPageShell from '../components/PlatformPageShell.vue';
import UiButton from '../components/ui/UiButton.vue';
import UiCheckbox from '../components/ui/UiCheckbox.vue';
import UiInput from '../components/ui/UiInput.vue';
import UiRange from '../components/ui/UiRange.vue';
import UiSegmented from '../components/ui/UiSegmented.vue';
import UiSelect from '../components/ui/UiSelect.vue';
import UiTextarea from '../components/ui/UiTextarea.vue';
import { characterCatalog, languageSamples, voiceCatalog, worlds } from '../data/platformCatalog';
import { useProjectStore } from '../stores/projectStore';

const store = useProjectStore();
const currentStep = ref(0);
const activeSceneIndex = ref(0);
const message = ref('');
const steps = [
  { short: 'Idea', title: 'Tell us your idea', helper: 'One or two sentences is enough' },
  { short: 'World', title: 'Pick the look', helper: 'From stone paths to future cities' },
  { short: 'Cast', title: 'Choose the characters', helper: 'Start with one, add more anytime' },
  { short: 'Voice', title: 'Choose how it sounds', helper: 'Language plus performance feeling' },
  { short: 'Scenes', title: 'Check the story beats', helper: 'Edit one scene without losing the rest' },
  { short: 'Ready', title: 'Review your cartoon plan', helper: 'Nothing renders until you approve it' },
];
const artReadyCharacters = characterCatalog.filter((character) => character.status === 'art-ready');
const liveVoices = voiceCatalog.filter((voice) => voice.status === 'live');
const genreOptions = ['Comedy adventure', 'Village mystery', 'Family slice of life', 'Friendly ghost story', 'Musical comedy', 'Science fantasy', 'Folklore quest'];
const audienceOptions = ['Family', 'Children 7–12', 'Teens', 'Adults', 'Everyone'];
const styleOptions = ['Warm 2D adventure', 'Paper-cut folk tale', 'Soft bedtime illustration', 'Chunky prehistoric comedy', 'Retro future toon', 'Playful 3D clay look'];
const emotionOptions = ['curious', 'joyful', 'surprised', 'confident', 'panicked', 'warm', 'sad', 'angry', 'singing'];
const cameraOptions = ['Wide establishing shot', 'Medium action shot', 'Close reaction', 'Two-shot with inserts', 'Tracking shot', 'Overhead reveal'];
const durationPresets = [15, 30, 60, 180, 600, 1800, 3600];
const selectedWorld = computed(() => worlds.find((world) => world.id === store.project.era) || worlds[0]);
const activeScene = computed(() => store.scenes[activeSceneIndex.value] || store.scenes[0]);
const durationLabel = computed(() => formatDuration(store.project.duration));
const progress = computed(() => `${((currentStep.value + 1) / steps.length) * 100}%`);

function artStyle(index) {
  return { backgroundImage: "url('/art/character-atlas.png')", backgroundSize: '600% 400%', backgroundPosition: `${(index % 6) * 20}% ${Math.floor(index / 6) * 33.333}%` };
}
function voiceStyle(index) {
  return { backgroundImage: "url('/art/voice-atlas.png')", backgroundSize: '400% 300%', backgroundPosition: `${(index % 4) * 33.333}% ${Math.floor(index / 4) * 50}%` };
}
function formatDuration(seconds) {
  const value = Number(seconds) || 0;
  if (value < 60) return `${value} seconds`;
  const minutes = Math.floor(value / 60);
  const remainder = value % 60;
  return remainder ? `${minutes}m ${remainder}s` : `${minutes} minute${minutes === 1 ? '' : 's'}`;
}
function persist() { store.persist(); }
function flash(text) { message.value = text; window.setTimeout(() => { message.value = ''; }, 2600); }
function goToStep(index) { currentStep.value = index; window.scrollTo({ top: 240, behavior: 'smooth' }); }
function nextStep() {
  if (currentStep.value === 0 && store.project.prompt.trim().length < 12) { flash('Add one clear sentence about what should happen first.'); return; }
  if (currentStep.value === 2 && !store.project.cast.length) { flash('Choose at least one character for your cast.'); return; }
  if (currentStep.value === 0) store.planFromPrompt();
  goToStep(Math.min(steps.length - 1, currentStep.value + 1));
}
function previousStep() { goToStep(Math.max(0, currentStep.value - 1)); }
function selectWorld(world) { store.updateProject({ era: world.id }); }
function toggleCast(character) {
  const exists = store.project.cast.some((item) => item.id === character.id);
  const cast = exists ? store.project.cast.filter((item) => item.id !== character.id) : [...store.project.cast, character];
  store.updateProject({ cast });
}
function selectVoice(voice) { store.selectVoice(voice); }
function setDuration(value) { store.updateProject({ duration: value }); store.planFromPrompt(); }
function duplicateScene() { store.duplicateScene(activeSceneIndex.value); activeSceneIndex.value += 1; }
function removeScene() { store.removeScene(activeSceneIndex.value); activeSceneIndex.value = Math.min(activeSceneIndex.value, store.scenes.length - 1); }
function prepareBrief() { store.persist(); flash('Production brief saved on this device. Rendering remains locked until backend providers are configured.'); }
</script>

<template>
  <PlatformPageShell eyebrow="A story studio for everyone" title="Make a cartoon one friendly step at a time." description="Type or speak an idea in any language, pick original characters and voices, review simple scenes, then change one part without rebuilding the whole story." accent="#7152f3" stat="15 sec → 60 min" status="Guided local prototype · scalable project API added separately · rendering not connected">
    <template #hero-media><div class="studio-hero-art"><img src="/art/video-journey.png" alt="A child and older adult making an original cartoon together in six clear steps" /></div></template>

    <section class="studio-shell section-pad">
      <header class="studio-topbar">
        <div><span>Studio mode</span><h2>{{ store.project.mode === 'simple' ? 'Simple and guided' : 'Creator controls' }}</h2><p>{{ store.project.mode === 'simple' ? 'Only the choices you need right now.' : 'Camera, audio, continuity, and partial regeneration controls are visible.' }}</p></div>
        <UiSegmented v-model="store.project.mode" label="Choose interface detail" :options="[{ value: 'simple', label: 'Simple mode' }, { value: 'creator', label: 'Creator mode' }]" @update:model-value="persist" />
      </header>

      <nav class="step-nav" aria-label="Story creation steps">
        <button v-for="(step, index) in steps" :key="step.short" type="button" :class="{ active: currentStep === index, done: currentStep > index }" :aria-current="currentStep === index ? 'step' : undefined" @click="goToStep(index)"><span>{{ currentStep > index ? '✓' : index + 1 }}</span><b>{{ step.short }}</b></button>
        <i :style="{ width: progress }" aria-hidden="true"></i>
      </nav>

      <main class="step-panel">
        <header class="step-heading"><span>Step {{ currentStep + 1 }} of {{ steps.length }}</span><h2>{{ steps[currentStep].title }}</h2><p>{{ steps[currentStep].helper }}</p></header>

        <section v-if="currentStep === 0" class="step-content idea-step">
          <div class="form-stack">
            <UiInput v-model="store.project.title" label="Give your cartoon a name" placeholder="The Moonlight Mango Mystery" @change="persist" />
            <UiTextarea v-model="store.project.prompt" label="What should happen?" :rows="6" placeholder="Example: A shy village postman discovers that every shadow has started singing. His brave grandmother helps him solve the mystery before the moon festival." hint="Use any language you are comfortable with. Keep character names and ideas original." @change="persist" />
            <div class="two-up"><UiSelect v-model="store.project.genre" label="Story type" :options="genreOptions" @change="persist" /><UiSelect v-model="store.project.audience" label="Who is it for?" :options="audienceOptions" @change="persist" /></div>
            <div class="two-up"><UiSelect v-model="store.project.language" label="Main spoken language" :options="languageSamples" hint="The backend roadmap expands this into 200+ language records with native review." @change="persist" /><UiSelect v-model="store.project.visualStyle" label="Visual feeling" :options="styleOptions" @change="persist" /></div>
          </div>
          <aside class="duration-card"><span>Target length</span><h3>{{ durationLabel }}</h3><div class="duration-presets"><button v-for="seconds in durationPresets" :key="seconds" type="button" :class="{ active: store.project.duration === seconds }" @click="setDuration(seconds)">{{ formatDuration(seconds) }}</button></div><UiRange v-model="store.project.duration" label="Fine tune duration" :min="15" :max="3600" :step="15" suffix="s" @change="persist" /><small>Minimum 15 seconds · maximum 60 minutes. Long projects are rendered as short, retryable shots.</small></aside>
        </section>

        <section v-else-if="currentStep === 1" class="step-content world-step">
          <div class="world-grid"><button v-for="(world, index) in worlds" :key="world.id" type="button" :class="{ selected: store.project.era === world.id }" :style="{ '--world': world.color }" @click="selectWorld(world)"><span :style="artStyle(index * 2)"></span><div><small>{{ world.era }}</small><h3>{{ world.name }}</h3><p>{{ world.setting }}</p><b>{{ store.project.era === world.id ? '✓ Selected' : 'Choose world' }}</b></div></button></div>
        </section>

        <section v-else-if="currentStep === 2" class="step-content cast-step">
          <div class="selected-summary"><span>{{ store.project.cast.length }}</span><div><b>characters in your cast</b><p>One lead is enough. Add friends, family, narrators, or rivals when the story needs them.</p></div><RouterLink to="/characters">Design my own →</RouterLink></div>
          <div class="cast-grid"><button v-for="character in artReadyCharacters" :key="character.id" type="button" :class="{ selected: store.project.cast.some((item) => item.id === character.id) }" @click="toggleCast(character)"><span :style="artStyle(character.artIndex)"><i>{{ store.project.cast.some((item) => item.id === character.id) ? '✓' : '+' }}</i></span><div><small>{{ character.world }}</small><h3>{{ character.name }}</h3><p>{{ character.role }} · {{ character.personality }}</p></div></button></div>
        </section>

        <section v-else-if="currentStep === 3" class="step-content voice-step">
          <div class="language-banner"><span>🌍</span><div><b>{{ store.project.language }} is your main language</b><p>You can change it now or later. Per-character dubbing, captions, and translation stay separate so one voice can change without replacing the video.</p></div><UiSelect v-model="store.project.language" label="Spoken language" :options="languageSamples" @change="persist" /></div>
          <div class="voice-choice-grid"><button v-for="voice in liveVoices" :key="voice.id" type="button" :class="{ selected: store.selectedVoice?.id === voice.id }" @click="selectVoice(voice)"><span :style="voiceStyle(voice.artIndex)"><i>▶</i></span><div><small>{{ voice.language }} · {{ voice.region }}</small><h3>{{ voice.name }}</h3><p>{{ voice.direction }}</p><b>{{ store.selectedVoice?.id === voice.id ? '✓ Selected' : 'Choose direction' }}</b></div></button><RouterLink class="browse-voices" to="/voices"><span>220</span><h3>Explore the full voice roadmap</h3><p>Filter by language, region, age feel, rhythm, energy, and reviewed availability.</p><b>Open voice library →</b></RouterLink></div>
        </section>

        <section v-else-if="currentStep === 4" class="step-content scenes-step">
          <div class="scene-strip"><button v-for="(scene, index) in store.scenes" :key="scene.id" type="button" :class="{ active: activeSceneIndex === index }" @click="activeSceneIndex = index"><span>{{ index + 1 }}</span><b>{{ scene.title }}</b><small>{{ formatDuration(scene.duration) }}</small></button><button class="add-scene" type="button" @click="store.addScene(); activeSceneIndex = store.scenes.length - 1"><span>+</span><b>Add scene</b></button></div>
          <div v-if="activeScene" class="scene-editor">
            <aside><span>Scene {{ activeSceneIndex + 1 }}</span><h3>{{ activeScene.title }}</h3><p>{{ activeScene.action }}</p><div class="scene-actions"><UiButton variant="secondary" @click="duplicateScene">Duplicate</UiButton><UiButton variant="danger" :disabled="store.scenes.length === 1" @click="removeScene">Delete</UiButton></div></aside>
            <div class="scene-fields"><UiInput v-model="activeScene.title" label="Scene name" @change="persist" /><UiTextarea v-model="activeScene.action" label="What happens in this scene?" :rows="4" placeholder="Describe the action in simple words." @change="persist" /><div class="two-up"><UiInput v-model="activeScene.character" label="Who is here?" @change="persist" /><UiInput v-model="activeScene.location" label="Where are they?" @change="persist" /></div><div class="two-up"><UiRange v-model="activeScene.duration" label="Scene length" :min="1" :max="900" :step="1" suffix="s" @change="persist" /><UiSelect v-model="activeScene.expression" label="Main feeling" :options="emotionOptions" @change="persist" /></div><UiTextarea v-model="activeScene.dialogue" label="Dialogue, narration, or original song words" :rows="3" placeholder="Optional. Do not paste copyrighted songs." @change="persist" />
              <div v-if="store.project.mode === 'creator'" class="creator-controls"><div class="creator-label"><span>Creator controls</span><p>These stay hidden in Simple mode.</p></div><div class="two-up"><UiSelect v-model="activeScene.camera" label="Camera" :options="cameraOptions" @change="persist" /><UiSelect v-model="activeScene.audioMode" label="Audio mode" :options="['Dialogue', 'Narration', 'Original song', 'Music and action only']" @change="persist" /></div><div class="two-up"><UiSelect v-model="activeScene.changeScope" label="When regenerating" :options="['Keep everything', 'Change video only', 'Change voice only', 'Change background only', 'Change movement only']" @change="persist" /><UiInput v-model="activeScene.continuity" label="Continuity notes" placeholder="Props, clothes, story facts…" @change="persist" /></div></div>
            </div>
          </div>
        </section>

        <section v-else class="step-content review-step">
          <div class="review-card"><div class="review-poster" :style="artStyle((worlds.findIndex((world) => world.id === store.project.era) * 2 + 1) % 24)"><span>{{ formatDuration(store.project.duration) }}</span></div><div><small>Ready for production planning</small><h2>{{ store.project.title || 'Untitled ToonSwap story' }}</h2><p>{{ store.project.prompt }}</p><dl><div><dt>World</dt><dd>{{ selectedWorld.name }}</dd></div><div><dt>Cast</dt><dd>{{ store.project.cast.length }} original{{ store.project.cast.length === 1 ? '' : 's' }}</dd></div><div><dt>Voice</dt><dd>{{ store.selectedVoice?.name || 'Choose later' }}</dd></div><div><dt>Language</dt><dd>{{ store.project.language }}</dd></div><div><dt>Scenes</dt><dd>{{ store.scenes.length }} editable beats</dd></div><div><dt>Captions</dt><dd>{{ store.project.captions ? 'On' : 'Off' }}</dd></div></dl><UiCheckbox v-model="store.project.captions" label="Create captions in the main language" hint="Translation tracks remain separate and editable." @update:model-value="persist" /></div></div>
          <div class="production-gates"><article><span>1</span><div><b>Plan saved locally</b><p>Project, cast, voice direction, scenes, and change scope are versionable records.</p></div><i>ready</i></article><article><span>2</span><div><b>Safety + originality review</b><p>Required before any provider receives prompts or consented media.</p></div><i>backend gate</i></article><article><span>3</span><div><b>Cost estimate + approval</b><p>Long videos are split into shots. The creator approves spend before rendering.</p></div><i>backend gate</i></article><article><span>4</span><div><b>Render, dub, caption, export</b><p>Each layer stays replaceable so voice or video can change independently.</p></div><i>provider setup</i></article></div>
          <UiButton variant="primary" @click="prepareBrief">Save production brief <template #icon>✓</template></UiButton>
        </section>

        <footer class="step-actions"><UiButton variant="secondary" :disabled="currentStep === 0" @click="previousStep">← Back</UiButton><span>Your draft saves on this device.</span><UiButton v-if="currentStep < steps.length - 1" variant="accent" @click="nextStep">Continue: {{ steps[currentStep + 1].short }} <template #icon>→</template></UiButton><UiButton v-else variant="secondary" @click="goToStep(0)">Start another idea</UiButton></footer>
      </main>
    </section>
    <div v-if="message" class="studio-toast" role="status">{{ message }}</div>
  </PlatformPageShell>
</template>

<style scoped lang="scss">
@use '../styles/tokens' as *;
.studio-hero-art { width: min(480px, 36vw); overflow: hidden; border: 7px solid white; border-radius: 28px; box-shadow: $shadow-lift; transform: rotate(1.5deg); }.studio-hero-art img { display: block; width: 100%; aspect-ratio: 1.5; object-fit: cover; object-position: left top; }
.studio-shell { max-width: 1540px; margin: 0 auto; padding-top: 70px; padding-bottom: 120px; }
.studio-topbar { display: grid; grid-template-columns: 1fr 380px; gap: 30px; align-items: center; margin-bottom: 26px; padding: 24px 28px; border: 1px solid $line; border-radius: $radius-md; background: #f2ede6; }.studio-topbar span { color: $violet; font-size: .8rem; font-weight: 900; text-transform: uppercase; letter-spacing: .06em; }.studio-topbar h2 { margin: 4px 0; font-size: 1.5rem; }.studio-topbar p { margin: 0; color: $muted; line-height: 1.5; }
.step-nav { position: relative; display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 18px; padding: 9px; border: 1px solid $line; border-radius: 20px; background: white; overflow: hidden; }.step-nav::before, .step-nav > i { content: ''; position: absolute; z-index: 0; left: 0; bottom: 0; height: 4px; }.step-nav::before { width: 100%; background: #eee7df; }.step-nav > i { background: $violet; transition: width .35s ease; }.step-nav button { position: relative; z-index: 1; display: flex; gap: 9px; align-items: center; justify-content: center; min-height: 52px; padding: 9px; border: 0; border-radius: 14px; color: $muted; background: transparent; font: inherit; cursor: pointer; }.step-nav button span { display: grid; place-items: center; width: 27px; height: 27px; border-radius: 50%; background: #eee8f9; font-size: .78rem; font-weight: 900; }.step-nav button.active { color: white; background: $ink; }.step-nav button.active span { color: $ink; background: $gold; }.step-nav button.done { color: $ink; }.step-nav button.done span { color: white; background: $mint; }
.step-panel { @include panel; overflow: hidden; }.step-heading { padding: clamp(25px, 4vw, 46px) clamp(22px, 5vw, 60px) 25px; border-bottom: 1px solid $line; }.step-heading > span { color: $violet; font-size: .8rem; font-weight: 900; text-transform: uppercase; letter-spacing: .07em; }.step-heading h2 { margin: 6px 0 4px; font-size: clamp(2rem, 3vw, 3.2rem); line-height: 1.02; letter-spacing: -.045em; }.step-heading p { margin: 0; color: $muted; font-size: var(--type-body); }
.step-content { min-height: 520px; padding: clamp(24px, 5vw, 60px); }.idea-step { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(320px, .7fr); gap: 32px; }.form-stack { display: grid; gap: 20px; }.two-up { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.duration-card { display: grid; align-content: start; gap: 18px; padding: 26px; border-radius: $radius-md; background: #f2edff; }.duration-card > span { color: $violet; font-size: .8rem; font-weight: 900; text-transform: uppercase; }.duration-card h3 { margin: -8px 0 2px; font-size: 2.1rem; }.duration-card small { color: $muted; line-height: 1.5; }.duration-presets { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }.duration-presets button { min-height: 44px; padding: 8px; border: 1px solid #d7ccef; border-radius: 12px; color: $ink; background: white; font: inherit; font-size: .82rem; font-weight: 800; cursor: pointer; }.duration-presets button.active { color: white; background: $violet; border-color: $violet; }
.world-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }.world-grid > button { display: grid; grid-template-columns: 130px 1fr; min-height: 180px; padding: 0; overflow: hidden; text-align: left; border: 2px solid $line; border-radius: 20px; color: $ink; background: white; cursor: pointer; }.world-grid > button.selected { border-color: var(--world); box-shadow: 0 0 0 4px color-mix(in srgb, var(--world) 20%, transparent); }.world-grid > button > span { background-repeat: no-repeat; }.world-grid > button div { display: grid; align-content: center; gap: 5px; padding: 18px; }.world-grid small { color: var(--world); font-size: .7rem; font-weight: 900; text-transform: uppercase; }.world-grid h3 { margin: 0; font-size: 1.2rem; }.world-grid p { margin: 0; color: $muted; font-size: .82rem; line-height: 1.45; }.world-grid b { margin-top: 7px; font-size: .78rem; }
.selected-summary { display: grid; grid-template-columns: 70px 1fr auto; gap: 18px; align-items: center; margin-bottom: 24px; padding: 18px 20px; border-radius: 18px; background: #f2edff; }.selected-summary > span { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 18px; color: white; background: $violet; font-size: 1.8rem; font-weight: 900; }.selected-summary b { font-size: 1.08rem; }.selected-summary p { margin: 3px 0 0; color: $muted; }.selected-summary a { color: $violet; font-weight: 900; }
.cast-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 13px; }.cast-grid button { padding: 0; overflow: hidden; text-align: left; border: 2px solid $line; border-radius: 17px; color: $ink; background: white; cursor: pointer; }.cast-grid button.selected { border-color: $violet; box-shadow: 0 0 0 3px rgba($violet,.17); }.cast-grid button > span { position: relative; display: block; aspect-ratio: 1; background-repeat: no-repeat; }.cast-grid button > span i { position: absolute; right: 8px; bottom: 8px; display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; color: white; background: $ink; font-style: normal; font-weight: 900; }.cast-grid button.selected > span i { background: $violet; }.cast-grid button div { padding: 13px; }.cast-grid small { color: $violet; font-size: .65rem; font-weight: 850; }.cast-grid h3 { margin: 3px 0 4px; font-size: 1.05rem; }.cast-grid p { margin: 0; color: $muted; font-size: .72rem; line-height: 1.4; }
.language-banner { display: grid; grid-template-columns: 54px 1fr 300px; gap: 18px; align-items: center; margin-bottom: 25px; padding: 18px; border-radius: 18px; background: #e9faf7; }.language-banner > span { font-size: 2rem; }.language-banner p { margin: 4px 0 0; color: $muted; line-height: 1.45; }.voice-choice-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }.voice-choice-grid > button, .browse-voices { padding: 0; overflow: hidden; text-align: left; text-decoration: none; border: 2px solid $line; border-radius: 19px; color: $ink; background: white; cursor: pointer; }.voice-choice-grid > button.selected { border-color: $mint; box-shadow: 0 0 0 3px rgba($mint,.22); }.voice-choice-grid > button > span { position: relative; display: block; aspect-ratio: .9; background-repeat: no-repeat; }.voice-choice-grid > button > span i { position: absolute; right: 10px; bottom: 10px; display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; color: $ink; background: $gold; font-style: normal; }.voice-choice-grid > button div, .browse-voices { padding: 16px; }.voice-choice-grid small { color: #088c78; font-size: .68rem; font-weight: 900; }.voice-choice-grid h3 { margin: 5px 0; font-size: 1.15rem; }.voice-choice-grid p { margin: 0 0 12px; color: $muted; font-size: .78rem; line-height: 1.45; }.voice-choice-grid b { font-size: .76rem; }.browse-voices { display: grid; align-content: center; background: $ink; color: white; }.browse-voices > span { color: $gold; font-size: 3rem; font-weight: 950; }.browse-voices p { color: #cfc9d6; }
.scene-strip { display: flex; gap: 10px; margin-bottom: 22px; padding-bottom: 8px; overflow-x: auto; }.scene-strip button { flex: 0 0 180px; display: grid; grid-template-columns: 34px 1fr; gap: 4px 9px; align-items: center; min-height: 72px; padding: 11px; text-align: left; border: 1.5px solid $line; border-radius: 15px; color: $ink; background: white; font: inherit; cursor: pointer; }.scene-strip button.active { color: white; background: $violet; border-color: $violet; }.scene-strip span { grid-row: 1 / 3; display: grid; place-items: center; width: 32px; height: 32px; border-radius: 10px; background: #eee8ff; color: $violet; font-weight: 900; }.scene-strip button.active span { background: white; }.scene-strip b { font-size: .86rem; }.scene-strip small { opacity: .72; font-size: .72rem; }.scene-strip .add-scene { grid-template-columns: 34px 1fr; border-style: dashed; }
.scene-editor { display: grid; grid-template-columns: 290px 1fr; border: 1px solid $line; border-radius: 20px; overflow: hidden; }.scene-editor > aside { display: grid; align-content: start; gap: 10px; padding: 28px; color: white; background: $ink; }.scene-editor > aside > span { color: $gold; font-size: .78rem; font-weight: 900; text-transform: uppercase; }.scene-editor aside h3 { margin: 0; font-size: 1.65rem; }.scene-editor aside p { margin: 0; color: #cfc9d6; line-height: 1.55; }.scene-actions { display: flex; gap: 8px; margin-top: 18px; }.scene-fields { display: grid; gap: 20px; padding: 28px; background: #fdfbf7; }.creator-controls { display: grid; gap: 18px; padding: 20px; border-radius: 17px; background: #f2edff; }.creator-label span { color: $violet; font-size: .78rem; font-weight: 900; text-transform: uppercase; }.creator-label p { margin: 3px 0 0; color: $muted; font-size: .82rem; }
.review-card { display: grid; grid-template-columns: 360px 1fr; overflow: hidden; border: 1px solid $line; border-radius: $radius-md; background: white; }.review-poster { position: relative; min-height: 420px; background-repeat: no-repeat; }.review-poster::after { content: ''; position: absolute; inset: auto 0 0; height: 40%; background: linear-gradient(transparent, rgba(23,19,33,.8)); }.review-poster span { position: absolute; z-index: 1; left: 20px; bottom: 20px; padding: 9px 12px; border-radius: 30px; color: $ink; background: $gold; font-weight: 900; }.review-card > div:last-child { display: grid; align-content: center; gap: 13px; padding: clamp(28px, 5vw, 55px); }.review-card small { color: $violet; font-weight: 900; text-transform: uppercase; }.review-card h2 { margin: 0; font-size: clamp(2rem, 4vw, 4rem); line-height: .98; }.review-card p { margin: 0; color: $muted; font-size: var(--type-body); line-height: 1.6; }.review-card dl { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 10px 0; }.review-card dl div { padding: 13px; border-radius: 13px; background: #f4efe8; }.review-card dt { color: $muted; font-size: .72rem; }.review-card dd { margin: 4px 0 0; font-size: .88rem; font-weight: 850; }
.production-gates { display: grid; gap: 10px; margin: 22px 0; }.production-gates article { display: grid; grid-template-columns: 38px 1fr auto; gap: 14px; align-items: center; padding: 15px; border: 1px solid $line; border-radius: 15px; }.production-gates article > span { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 11px; color: white; background: $ink; font-weight: 900; }.production-gates p { margin: 3px 0 0; color: $muted; font-size: .82rem; }.production-gates i { padding: 7px 9px; border-radius: 20px; color: $violet; background: #f0ebff; font-style: normal; font-size: .68rem; font-weight: 900; text-transform: uppercase; }
.step-actions { display: grid; grid-template-columns: auto 1fr auto; gap: 18px; align-items: center; padding: 20px clamp(22px, 5vw, 60px); border-top: 1px solid $line; background: #f7f2eb; }.step-actions > span { color: $muted; font-size: .78rem; text-align: center; }
.studio-toast { position: fixed; z-index: 50; right: 24px; bottom: 24px; max-width: 390px; padding: 17px 20px; border-radius: 15px; color: white; background: $ink; box-shadow: $shadow-lift; font-weight: 800; }
.world-grid small, .cast-grid small, .cast-grid p, .voice-choice-grid small, .voice-choice-grid b, .scene-strip small, .review-card dt, .production-gates i { font-size: .8rem; }
@media (max-width: 1180px) { .world-grid { grid-template-columns: repeat(2, 1fr); }.cast-grid { grid-template-columns: repeat(4, 1fr); }.voice-choice-grid { grid-template-columns: repeat(3, 1fr); }.studio-hero-art { width: 360px; }.idea-step { grid-template-columns: 1fr; } }
@media (max-width: 850px) { .studio-topbar { grid-template-columns: 1fr; }.step-nav { display: flex; overflow-x: auto; }.step-nav button { flex: 0 0 120px; }.scene-editor, .review-card { grid-template-columns: 1fr; }.scene-editor > aside { min-height: 240px; }.review-poster { min-height: 330px; }.language-banner { grid-template-columns: 50px 1fr; }.language-banner > :last-child { grid-column: 1 / -1; }.cast-grid { grid-template-columns: repeat(3, 1fr); }.step-actions { grid-template-columns: 1fr 1fr; }.step-actions > span { display: none; } }
@media (max-width: 620px) { .studio-hero-art { width: 100%; }.two-up, .world-grid, .voice-choice-grid { grid-template-columns: 1fr; }.world-grid > button { grid-template-columns: 120px 1fr; }.cast-grid { grid-template-columns: repeat(2, 1fr); }.selected-summary { grid-template-columns: 58px 1fr; }.selected-summary a { grid-column: 1 / -1; }.review-card dl { grid-template-columns: repeat(2, 1fr); }.production-gates article { grid-template-columns: 38px 1fr; }.production-gates i { grid-column: 2; justify-self: start; }.step-actions { gap: 8px; padding: 15px; }.step-actions :deep(button) { padding-inline: 12px; font-size: .82rem; }.step-content { padding: 20px; }.scene-fields { padding: 20px; } }
</style>
