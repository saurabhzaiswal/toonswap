<script setup>
import { useMemeStore } from '../stores/memeStore';
import AppButton from './ui/AppButton.vue';
import UiSelect from './ui/UiSelect.vue';

const store = useMemeStore();
const avatarStyle = (index) => ({
  backgroundImage: "url('/art/voice-atlas.png')",
  backgroundSize: '400% 300%',
  backgroundPosition: `${(index % 4) * 33.333}% ${Math.floor(index / 4) * 50}%`,
});

const languages = [
  { value: 'hindi', label: 'Hindi / हिन्दी', description: 'Devanagari · India' },
  { value: 'bhojpuri', label: 'Bhojpuri / भोजपुरी', description: 'Purvanchal · India' },
  { value: 'kannada', label: 'Kannada / ಕನ್ನಡ', description: 'Karnataka · India' },
  { value: 'english-india', label: 'English (India)', description: 'Indian English' },
];

const voiceStyles = [
  {
    id: 'bhojpuri-comedy-uncle',
    label: 'Mast Uncle',
    region: 'Bhojpuri',
    tone: 'Warm & cheeky',
    expression: 'Knowing grin',
    artIndex: 0,
  },
  {
    id: 'bhojpuri-funny-aunty',
    label: 'Fun Aunty',
    region: 'Bhojpuri',
    tone: 'Bold & bright',
    expression: 'Welcoming laugh',
    artIndex: 1,
  },
  {
    id: 'kannada-funny-boy',
    label: 'Funny Huduga',
    region: 'Kannada',
    tone: 'Quick & playful',
    expression: 'Delighted surprise',
    artIndex: 2,
  },
  {
    id: 'kannada-comedy-thatha',
    label: 'Comedy Thatha',
    region: 'Kannada',
    tone: 'Dry & lovable',
    expression: 'Tiny side-eye',
    artIndex: 3,
  },
];

const presetTemplates = [
  { label: 'Friendly roast', text: 'अरे भाई, तुमसे ना हो पाएगा!' },
  { label: 'Snack emergency', text: 'हमरा के परांठा चाहिए मम्मी!' },
  { label: 'Style check', text: 'ಲೇ ಮಗಾ, ಎಷ್ಟು ಸ್ಟೈಲ್ ಮಾಡ್ತೀಯ!' },
  { label: 'Photo moment', text: 'रुक जा भाई, फोटो तो खिंचवा ले!' },
];
</script>

<template>
  <section
    v-if="store.inputMode === 'text'"
    class="voice-settings"
    aria-label="Voice and language settings"
  >
    <UiSelect
      v-model="store.language"
      label="Script language"
      hint="Choose the language your line is written in."
      :options="languages"
    />

    <div class="voice-label">
      <span>Comedy voice</span><small>Choose by face, feeling, and performance direction</small>
    </div>
    <div class="voice-options">
      <AppButton
        v-for="voice in voiceStyles"
        :key="voice.id"
        variant="outline"
        size="sm"
        class="voice-choice"
        :class="{ selected: store.voiceStyle === voice.id }"
        :aria-pressed="store.voiceStyle === voice.id"
        @click="store.voiceStyle = voice.id"
      >
        <span
          class="voice-avatar expressive-avatar"
          :style="avatarStyle(voice.artIndex)"
          aria-hidden="true"
        ></span>
        <span
          ><strong>{{ voice.label }}</strong
          ><small>{{ voice.region }} · {{ voice.tone }}</small
          ><em>{{ voice.expression }}</em></span
        >
        <i aria-hidden="true">✓</i>
      </AppButton>
    </div>

    <div class="prompt-chips">
      <span>Try a starter</span>
      <AppButton
        v-for="template in presetTemplates"
        :key="template.label"
        variant="outline"
        size="sm"
        @click="store.scriptText = template.text"
        >{{ template.label }}</AppButton
      >
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '../styles/tokens' as *;

.expressive-avatar {
  width: 58px;
  height: 58px;
  flex: 0 0 58px;
  border: 2px solid var(--color-ink);
  border-radius: 16px;
  background-color: var(--color-soft);
}
.voice-choice {
  justify-content: flex-start;
}
.voice-options {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
:deep(.voice-choice.app-button) {
  min-height: 94px;
  padding: 12px 14px;
  border-color: $line;
  border-radius: 16px;
  background: white;
  box-shadow: 0 4px 0 color-mix(in srgb, #{$line} 72%, #{$ink});
}
:deep(.voice-choice.app-button:hover) {
  border-color: $violet;
}
:deep(.voice-choice.app-button.selected) {
  border-color: $violet;
  background: color-mix(in srgb, #{$violet} 8%, white);
  box-shadow: 0 5px 0 color-mix(in srgb, #{$violet} 66%, #{$ink});
}
.prompt-chips :deep(.app-button) {
  min-height: 36px;
  padding-inline: 12px;
  border-color: color-mix(in srgb, #{$coral} 35%, #{$line});
  border-radius: 999px;
  font-size: 0.76rem;
}
.voice-options em {
  display: block;
  margin-top: 3px;
  color: var(--color-primary-strong);
  font-size: 0.72rem;
  font-style: normal;
  font-weight: 800;
}

@media (max-width: 760px) {
  .voice-options {
    grid-template-columns: 1fr;
  }
  .expressive-avatar {
    width: 64px;
    height: 64px;
    flex-basis: 64px;
  }
}
</style>
