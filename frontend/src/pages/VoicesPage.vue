<script setup>
import { computed, reactive, ref, watch } from 'vue';
import PlatformPageShell from '../components/PlatformPageShell.vue';
import AppButton from '../components/ui/AppButton.vue';
import UiCheckbox from '../components/ui/UiCheckbox.vue';
import UiInput from '../components/ui/UiInput.vue';
import UiRange from '../components/ui/UiRange.vue';
import UiSelect from '../components/ui/UiSelect.vue';
import {
  languageSamples,
  voiceCatalog,
  voiceDirections,
  voiceRegions,
} from '../data/platformCatalog';
import { useProjectStore } from '../stores/projectStore';

const projectStore = useProjectStore();
const query = ref('');
const regionFilter = ref('all');
const statusFilter = ref('live');
const expressionFilter = ref('all');
const visibleCount = ref(12);
const consent = ref(false);
const message = ref('');
const previewingVoiceId = ref('');
const expression = reactive({ energy: 60, warmth: 70, pace: 50, pitch: 50, emotion: 'Joyful' });
const statusOptions = [
  { value: 'live', label: 'Ready to preview' },
  { value: 'all', label: 'All 220 profiles' },
  { value: 'planned', label: 'Planned' },
  { value: 'research', label: 'Native-review research' },
];
const languageOptions = [
  { value: 'all', label: 'All listed languages' },
  ...voiceRegions.map((region) => ({ value: region[1], label: `${region[1]} · ${region[2]}` })),
];
const expressionOptions = [
  {
    value: 'all',
    label: 'Every expression',
    description: 'Warm, funny, calm, heroic, mysterious…',
  },
  ...voiceDirections.map((direction, index) => ({
    value: direction[2],
    label: direction[1],
    description: direction[3],
    avatarStyle: voiceStyle(index),
  })),
];

const filteredVoices = computed(() =>
  voiceCatalog.filter((voice) => {
    const matchesRegion = regionFilter.value === 'all' || voice.language === regionFilter.value;
    const matchesStatus = statusFilter.value === 'all' || voice.status === statusFilter.value;
    const matchesExpression =
      expressionFilter.value === 'all' || voice.direction === expressionFilter.value;
    const haystack =
      `${voice.name} ${voice.language} ${voice.region} ${voice.direction}`.toLowerCase();
    return (
      matchesRegion &&
      matchesStatus &&
      matchesExpression &&
      haystack.includes(query.value.toLowerCase())
    );
  }),
);
watch([query, regionFilter, statusFilter, expressionFilter], () => {
  visibleCount.value = 12;
});

function voiceStyle(index) {
  const safeIndex = Math.max(0, Number(index) || 0);
  return {
    backgroundImage: "url('/art/voice-atlas.png')",
    backgroundSize: '400% 300%',
    backgroundPosition: `${(safeIndex % 4) * 33.333}% ${Math.floor(safeIndex / 4) * 50}%`,
  };
}

function flash(text) {
  message.value = text;
  window.setTimeout(() => {
    message.value = '';
  }, 2600);
}

function previewVoice(voice) {
  previewingVoiceId.value = previewingVoiceId.value === voice.id ? '' : voice.id;
}

function selectVoice(voice) {
  projectStore.selectVoice({ ...voice, expression: { ...expression } });
  flash(`${voice.name} saved as your project voice direction.`);
}

function saveOwnVoiceBrief() {
  if (!consent.value) return;
  projectStore.selectVoice({
    id: 'creator-owned-voice',
    name: 'My consented voice',
    language: projectStore.project.language,
    status: 'personal',
    expression: { ...expression },
  });
  flash('Your consented voice direction is saved locally.');
}
</script>

<template>
  <PlatformPageShell
    eyebrow="Voice direction for every story"
    title="Hear the personality before you choose the language."
    description="Browse visual performance personas, then pair the feeling with a native or shared language. The 200+ language goal is a reviewed roadmap—not a fake claim that every voice is live today."
    accent="#48b9a7"
    stat="220 profiles"
    status="4 live directions · native review required before public language launch"
  >
    <template #hero-media>
      <div class="voice-hero" aria-label="Original ToonSwap voice personas">
        <span v-for="index in [0, 1, 7]" :key="index" :style="voiceStyle(index)"
          ><i v-for="bar in 5" :key="bar"></i
        ></span>
      </div>
    </template>

    <section class="voice-library section-pad">
      <div class="safety-note">
        <span>Consent-first voice rule</span>
        <p>
          Use your voice, a licensed voice, or a fictional system voice. Real-person imitation,
          celebrity cloning, deceptive impersonation, and copied cartoon performances are blocked.
        </p>
      </div>
      <header class="section-heading">
        <div>
          <p class="kicker">Visual voice library</p>
          <h2>Choose a feeling, not a tiny text row.</h2>
          <p>
            Each card pairs an expressive performer image with rhythm, warmth, energy, language,
            region, and honest availability.
          </p>
        </div>
        <div class="availability">
          <b>4</b><span>working directions now</span><b>216</b><span>review roadmap</span>
        </div>
      </header>

      <div class="filters">
        <UiInput
          v-model="query"
          type="search"
          label="Search by feeling or language"
          placeholder="Warm, funny, Tamil, elder…"
        />
        <UiSelect v-model="regionFilter" label="Language / region" :options="languageOptions" />
        <UiSelect v-model="statusFilter" label="Availability" :options="statusOptions" />
        <UiSelect v-model="expressionFilter" label="Face & feeling" :options="expressionOptions" />
      </div>

      <div class="language-strip">
        <span>Popular starting points</span
        ><AppButton
          v-for="language in languageSamples.slice(0, 16)"
          :key="language"
          variant="bare"
          @click="
            query = language;
            statusFilter = 'all';
          "
          >{{ language }}</AppButton
        >
      </div>

      <div v-if="filteredVoices.length" class="voice-grid">
        <article
          v-for="voice in filteredVoices.slice(0, visibleCount)"
          :key="voice.id"
          class="voice-card"
          :class="[`status-${voice.status}`, { playing: previewingVoiceId === voice.id }]"
        >
          <div class="voice-art" :style="voiceStyle(voice.artIndex)">
            <span class="status">{{
              voice.status === 'research' ? 'native review' : voice.status
            }}</span>
            <AppButton
              variant="bare"
              icon-only
              :aria-label="`${previewingVoiceId === voice.id ? 'Stop' : 'Preview'} ${voice.name} performance direction`"
              @click="previewVoice(voice)"
              >{{ previewingVoiceId === voice.id ? '■' : '▶' }}</AppButton
            >
          </div>
          <div class="voice-copy">
            <small>{{ voice.language }} · {{ voice.region }}</small>
            <h3>{{ voice.name }}</h3>
            <p>{{ voice.direction }}</p>
            <div class="expression-tags">
              <span>{{ voice.expressionCue }}</span
              ><span>{{ voice.energy }} energy</span><span>{{ voice.ageFeel }}</span>
            </div>
            <div class="wave" aria-hidden="true">
              <i v-for="bar in 18" :key="bar" :style="{ height: `${9 + ((bar * 11) % 32)}px` }"></i>
            </div>
            <p class="preview-note">
              {{
                previewingVoiceId === voice.id
                  ? 'Visual direction preview playing. Connect provider audio in the backend to hear a sample.'
                  : 'Tap preview to see this performance rhythm.'
              }}
            </p>
            <AppButton
              :variant="voice.status === 'live' ? 'primary' : 'outline'"
              block
              arrow
              @click="selectVoice(voice)"
              >{{
                voice.status === 'live' ? 'Use this voice direction' : 'Save to project roadmap'
              }}</AppButton
            >
          </div>
        </article>
      </div>
      <div v-else class="empty-state">
        <b>No matching voice yet.</b>
        <p>Try a feeling such as “warm” or set availability to All 220 profiles.</p>
      </div>
      <AppButton
        v-if="visibleCount < filteredVoices.length"
        variant="outline"
        class="load-more"
        arrow
        @click="visibleCount += 12"
        >Show 12 more profiles</AppButton
      >
    </section>

    <section class="own-voice section-pad">
      <header>
        <p class="kicker">Your voice, your feeling</p>
        <h2>Direct the performance with four simple sliders.</h2>
        <p>
          This stores direction only. When secure speech-to-speech is connected, the backend must
          verify consent before processing or retaining source audio.
        </p>
      </header>
      <div class="expression-shell">
        <div class="expression-controls">
          <div class="range-grid">
            <UiRange v-model="expression.energy" label="Energy" /><UiRange
              v-model="expression.warmth"
              label="Warmth"
            /><UiRange v-model="expression.pace" label="Pace" /><UiRange
              v-model="expression.pitch"
              label="Pitch direction"
            />
          </div>
          <UiSelect
            v-model="expression.emotion"
            label="Primary emotion"
            :options="[
              'Joyful',
              'Curious',
              'Deadpan',
              'Excited',
              'Gentle',
              'Suspenseful',
              'Heartfelt',
            ]"
          />
          <UiCheckbox
            v-model="consent"
            label="I own this voice or have explicit permission."
            hint="Guardian permission is required where applicable. Permission can be withdrawn before publishing."
          />
          <AppButton variant="primary" arrow :disabled="!consent" @click="saveOwnVoiceBrief"
            >Save my voice direction</AppButton
          >
        </div>
        <aside class="expression-preview">
          <div
            class="persona"
            :style="
              voiceStyle(
                [
                  'Joyful',
                  'Curious',
                  'Deadpan',
                  'Excited',
                  'Gentle',
                  'Suspenseful',
                  'Heartfelt',
                ].indexOf(expression.emotion) % 12,
              )
            "
          ></div>
          <div>
            <small>Your current direction</small>
            <h3>{{ expression.emotion }}</h3>
            <p>
              {{ expression.energy }} energy · {{ expression.warmth }} warmth ·
              {{ expression.pace }} pace
            </p>
            <div class="big-wave" aria-hidden="true">
              <i
                v-for="bar in 24"
                :key="bar"
                :style="{
                  height: `${12 + ((bar * expression.energy) % 54)}px`,
                  opacity: 0.35 + expression.warmth / 160,
                }"
              ></i>
            </div>
            <span>Saved direction only · no audio uploaded</span>
          </div>
        </aside>
      </div>
    </section>
    <div v-if="message" class="voice-toast" role="status">{{ message }}</div>
  </PlatformPageShell>
</template>

<style scoped lang="scss">
@use '../styles/tokens' as *;
.voice-hero {
  display: flex;
  align-items: center;
  padding-right: 25px;
}
.voice-hero > span {
  position: relative;
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 4px;
  width: 128px;
  aspect-ratio: 0.82;
  margin-right: -25px;
  border: 5px solid $canvas;
  border-radius: 24px;
  background-repeat: no-repeat;
  box-shadow: $shadow-soft;
  overflow: hidden;
}
.voice-hero > span:nth-child(2) {
  z-index: 2;
  transform: translateY(-22px);
}
.voice-hero > span:nth-child(3) {
  z-index: 1;
}
.voice-hero i {
  position: relative;
  z-index: 2;
  width: 5px;
  height: 24px;
  margin-bottom: 10px;
  border-radius: 10px;
  background: white;
  box-shadow: 0 1px 4px #000;
  animation: pulse 0.7s ease-in-out infinite alternate;
}
.voice-hero i:nth-child(2n) {
  height: 40px;
  animation-delay: -0.3s;
}
.voice-library,
.own-voice {
  max-width: 1540px;
  margin: 0 auto;
  padding-top: clamp(70px, 8vw, 120px);
  padding-bottom: clamp(70px, 8vw, 120px);
}
.safety-note {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 20px;
  align-items: center;
  margin-bottom: 70px;
  padding: 22px;
  border: 1px solid #9eddd3;
  border-radius: $radius-md;
  background: #e9faf7;
}
.safety-note span {
  font-weight: 950;
}
.safety-note p {
  margin: 0;
  color: #42665f;
  font-size: var(--type-body);
  line-height: 1.55;
}
.section-heading {
  display: grid;
  grid-template-columns: 1fr 290px;
  gap: 45px;
  align-items: end;
  margin-bottom: 32px;
}
.section-heading h2,
.own-voice h2 {
  margin: 7px 0 15px;
  font-size: var(--type-h2);
  line-height: 1.02;
  letter-spacing: -0.045em;
}
.section-heading p,
.own-voice header > p {
  max-width: 780px;
  margin: 0;
  color: $muted;
  font-size: var(--type-body);
  line-height: 1.65;
}
.availability {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 5px 12px;
  align-items: center;
  padding: 20px;
  border-radius: $radius-md;
  color: white;
  background: linear-gradient(145deg, $violet, #4f35bb);
  box-shadow: 0 7px 0 color-mix(in srgb, #{$violet} 68%, #{$ink});
}
.availability b {
  color: $gold;
  font-size: 1.8rem;
}
.availability span {
  font-size: 0.86rem;
  font-weight: 750;
}
.filters {
  display: grid;
  grid-template-columns: 1.25fr 1fr 0.75fr 1fr;
  gap: 14px;
  padding: 18px;
  border-radius: $radius-md;
  background: #e8f5f2;
}
.language-strip {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 20px 0 34px;
  padding-bottom: 8px;
  overflow-x: auto;
}
.language-strip > span {
  flex: 0 0 auto;
  margin-right: 5px;
  color: $muted;
  font-size: 0.8rem;
  font-weight: 850;
}
.language-strip button {
  flex: 0 0 auto;
  padding: 9px 13px;
  border: 1px solid $line;
  border-radius: 30px;
  color: $ink;
  background: white;
  font: inherit;
  font-size: 0.83rem;
  font-weight: 750;
  cursor: pointer;
}
.voice-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}
.voice-card {
  @include panel;
  overflow: hidden;
}
.voice-art {
  position: relative;
  aspect-ratio: 1 / 0.82;
  background-repeat: no-repeat;
}
.voice-art::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 35%;
  background: linear-gradient(transparent, rgba(23, 19, 33, 0.66));
}
.voice-art .status {
  position: absolute;
  z-index: 2;
  top: 12px;
  left: 12px;
  padding: 7px 9px;
  border-radius: 30px;
  color: $ink;
  background: rgba(255, 255, 255, 0.9);
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
}
.voice-art button {
  position: absolute;
  z-index: 3;
  right: 14px;
  bottom: 14px;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: 50%;
  color: $ink;
  background: $gold;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 7px 18px rgba(0, 0, 0, 0.24);
}
.voice-copy {
  display: grid;
  gap: 10px;
  padding: 20px;
}
.voice-copy > small {
  color: #088c78;
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.voice-copy h3 {
  margin: 0;
  font-size: 1.48rem;
  letter-spacing: -0.035em;
}
.voice-copy > p {
  margin: 0;
  color: $muted;
  line-height: 1.5;
}
.wave,
.big-wave {
  display: flex;
  gap: 3px;
  align-items: center;
  height: 44px;
  overflow: hidden;
}
.wave i,
.big-wave i {
  width: 4px;
  border-radius: 10px;
  background: $mint;
  transition: height 0.25s ease;
}
.playing .wave i {
  animation: pulse 0.42s ease-in-out infinite alternate;
}
.playing .wave i:nth-child(3n) {
  animation-delay: -0.2s;
}
.preview-note {
  min-height: 42px;
  font-size: 0.77rem !important;
}
.expression-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.expression-tags span {
  padding: 5px 8px;
  border-radius: 999px;
  color: $ink;
  background: var(--color-secondary-soft);
  font-size: 0.7rem;
  font-weight: 850;
}
.empty-state {
  padding: 60px 20px;
  text-align: center;
  border: 1px dashed $line;
  border-radius: $radius-md;
}
.empty-state b {
  font-size: 1.4rem;
}
.empty-state p {
  color: $muted;
}
.load-more {
  display: flex;
  margin: 28px auto 0;
}
.own-voice {
  border-top: 1px solid $line;
}
.own-voice header {
  margin-bottom: 34px;
}
.expression-shell {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}
.expression-controls {
  @include panel;
  display: grid;
  gap: 24px;
  padding: clamp(24px, 4vw, 42px);
}
.range-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px 25px;
}
.expression-preview {
  @include panel;
  display: grid;
  grid-template-columns: minmax(180px, 0.72fr) 1fr;
  overflow: hidden;
}
.persona {
  min-height: 430px;
  background-repeat: no-repeat;
}
.expression-preview > div:last-child {
  display: grid;
  align-content: center;
  gap: 10px;
  padding: clamp(25px, 4vw, 45px);
}
.expression-preview small {
  color: $mint;
  font-weight: 900;
  text-transform: uppercase;
}
.expression-preview h3 {
  margin: 0;
  font-size: 2.5rem;
}
.expression-preview p {
  margin: 0;
  color: $muted;
  line-height: 1.5;
}
.big-wave i {
  background: $violet;
}
.expression-preview span {
  color: $muted;
  font-size: 0.8rem;
  font-weight: 700;
}
.voice-toast {
  position: fixed;
  z-index: 50;
  right: 24px;
  bottom: 24px;
  max-width: 360px;
  padding: 16px 20px;
  border-radius: 15px;
  color: white;
  background: $ink;
  box-shadow: $shadow-lift;
  font-weight: 800;
}
.voice-art .status,
.voice-copy > small {
  font-size: 0.82rem !important;
}
.preview-note {
  font-size: 0.86rem !important;
}
.expression-tags span {
  font-size: 0.78rem;
}
@keyframes pulse {
  to {
    transform: scaleY(0.45);
  }
}
@media (max-width: 1180px) {
  .voice-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .expression-shell {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 880px) {
  .voice-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .filters,
  .section-heading {
    grid-template-columns: 1fr;
  }
  .availability {
    max-width: 340px;
  }
  .safety-note {
    grid-template-columns: 1fr;
  }
  .expression-preview {
    grid-template-columns: 280px 1fr;
  }
}
@media (max-width: 620px) {
  .voice-hero {
    padding-right: 0;
  }
  .voice-hero > span {
    width: 96px;
    justify-self: center;
  }
  .voice-grid,
  .range-grid,
  .expression-preview {
    grid-template-columns: 1fr;
  }
  .voice-art {
    aspect-ratio: 1 / 0.78;
  }
  .persona {
    min-height: 300px;
  }
  .expression-controls {
    padding: 20px;
  }
  .filters {
    padding: 16px;
  }
  .availability {
    max-width: none;
  }
  .safety-note {
    margin-bottom: 50px;
  }
  .voice-toast {
    right: 12px;
    bottom: 12px;
    left: 12px;
    max-width: none;
  }
}
</style>
