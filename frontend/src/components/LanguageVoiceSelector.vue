<script setup>
import { useMemeStore } from '../stores/memeStore';

const store = useMemeStore();

const languages = [
  { id: 'hindi', label: 'Hindi / हिन्दी' },
  { id: 'bhojpuri', label: 'Bhojpuri / भोजपुरी' },
  { id: 'kannada', label: 'Kannada / ಕನ್ನಡ' },
  { id: 'english-india', label: 'English (India)' },
];

const voiceStyles = [
  { id: 'bhojpuri-comedy-uncle', label: 'Mast Uncle', region: 'Bhojpuri', tone: 'Warm & cheeky', mark: 'M' },
  { id: 'bhojpuri-funny-aunty', label: 'Fun Aunty', region: 'Bhojpuri', tone: 'Bold & bright', mark: 'F' },
  { id: 'kannada-funny-boy', label: 'Funny Huduga', region: 'Kannada', tone: 'Quick & playful', mark: 'H' },
  { id: 'kannada-comedy-thatha', label: 'Comedy Thatha', region: 'Kannada', tone: 'Dry & lovable', mark: 'T' },
];

const presetTemplates = [
  { label: 'Friendly roast', text: 'अरे भाई, तुमसे ना हो पाएगा!' },
  { label: 'Snack emergency', text: 'हमरा के परांठा चाहिए मम्मी!' },
  { label: 'Style check', text: 'ಲೇ ಮಗಾ, ಎಷ್ಟು ಸ್ಟೈಲ್ ಮಾಡ್ತೀಯ!' },
  { label: 'Photo moment', text: 'रुक जा भाई, फोटो तो खिंचवा ले!' },
];
</script>

<template>
  <section v-if="store.inputMode === 'text'" class="voice-settings" aria-label="Voice and language settings">
    <div class="select-row">
      <label for="script-language"><span>Script language</span><small>Live choices</small></label>
      <select id="script-language" v-model="store.language">
        <option v-for="language in languages" :key="language.id" :value="language.id">{{ language.label }}</option>
      </select>
    </div>

    <div class="voice-label"><span>Comedy voice</span><small>Original voice designs only</small></div>
    <div class="voice-options">
      <button
        v-for="voice in voiceStyles"
        :key="voice.id"
        type="button"
        :class="{ selected: store.voiceStyle === voice.id }"
        :aria-pressed="store.voiceStyle === voice.id"
        @click="store.voiceStyle = voice.id"
      >
        <span class="voice-avatar">{{ voice.mark }}</span>
        <span><strong>{{ voice.label }}</strong><small>{{ voice.region }} · {{ voice.tone }}</small></span>
        <i aria-hidden="true">✓</i>
      </button>
    </div>

    <div class="prompt-chips">
      <span>Need a line?</span>
      <button v-for="template in presetTemplates" :key="template.label" type="button" @click="store.scriptText = template.text">{{ template.label }}</button>
    </div>
  </section>
</template>
