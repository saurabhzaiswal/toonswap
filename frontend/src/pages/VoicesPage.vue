<script setup>
import { computed, reactive, ref } from 'vue';
import PlatformPageShell from '../components/PlatformPageShell.vue';
import { languageSamples, voiceCatalog, voiceRegions } from '../data/platformCatalog';
import { useProjectStore } from '../stores/projectStore';

const projectStore = useProjectStore();
const query = ref('');
const regionFilter = ref('all');
const statusFilter = ref('all');
const visibleCount = ref(24);
const consent = ref(false);
const message = ref('');
const expression = reactive({ energy: 60, warmth: 70, pace: 50, pitch: 50, emotion: 'Joyful' });

const filteredVoices = computed(() => voiceCatalog.filter((voice) => {
  const matchesRegion = regionFilter.value === 'all' || voice.language === regionFilter.value;
  const matchesStatus = statusFilter.value === 'all' || voice.status === statusFilter.value;
  const haystack = `${voice.name} ${voice.language} ${voice.region} ${voice.direction}`.toLowerCase();
  return matchesRegion && matchesStatus && haystack.includes(query.value.toLowerCase());
}));

function selectVoice(voice) {
  projectStore.selectVoice({ ...voice, expression: { ...expression } });
  message.value = `${voice.name} selected for your project.`;
  window.setTimeout(() => { message.value = ''; }, 2200);
}

function saveOwnVoiceBrief() {
  if (!consent.value) return;
  projectStore.selectVoice({ id: 'creator-owned-voice', name: 'My consented voice', language: projectStore.project.language, status: 'personal', expression: { ...expression } });
  message.value = 'Your voice direction is saved locally. Audio processing remains a backend integration step.';
}
</script>

<template>
  <PlatformPageShell eyebrow="Global voice direction" title="220 voice profiles. 200+ language roadmap." description="Find an original performance direction by language, region, energy, age range, rhythm, and emotional intent—or direct your own consented voice without cloning somebody else." accent="#48b9a7" stat="4 live · 216 roadmap" status="Native review required before every public launch">
    <section class="voice-lab-section section-pad">
      <div class="voice-safety-banner"><span>Voice safety</span><p>Accents and languages are welcome. Real-person imitation, celebrity cloning, deceptive impersonation, and copied character performances are not.</p></div>
      <div class="catalog-toolbar voice-toolbar-light">
        <label class="catalog-search"><span>Search the library</span><input v-model="query" type="search" placeholder="Language, region, mood…" /></label>
        <label><span>Language family</span><select v-model="regionFilter"><option value="all">All listed regions</option><option v-for="region in voiceRegions" :key="region[0]" :value="region[1]">{{ region[1] }}</option></select></label>
        <label><span>Availability</span><select v-model="statusFilter"><option value="all">All statuses</option><option value="live">Live</option><option value="planned">Planned</option><option value="research">Research</option></select></label>
      </div>

      <div class="language-cloud"><span>200+ language goal</span><button v-for="language in languageSamples" :key="language" type="button" @click="query = language">{{ language }}</button></div>

      <div class="voice-library-grid">
        <article v-for="voice in filteredVoices.slice(0, visibleCount)" :key="voice.id" class="library-voice-card" :class="`status-${voice.status}`">
          <div><span class="voice-letter">{{ voice.language.slice(0, 2).toUpperCase() }}</span><b>{{ voice.status }}</b></div>
          <small>{{ voice.language }} · {{ voice.region }}</small><h2>{{ voice.name }}</h2><p>{{ voice.direction }}</p>
          <div class="library-wave" aria-hidden="true"><i v-for="bar in 12" :key="bar" :style="{ height: `${7 + ((bar * 7) % 22)}px` }"></i></div>
          <button type="button" @click="selectVoice(voice)">{{ voice.status === 'live' ? 'Use live voice' : 'Save to project brief' }} <span>→</span></button>
        </article>
      </div>
      <button v-if="visibleCount < filteredVoices.length" class="load-more" type="button" @click="visibleCount += 24">Show 24 more profiles</button>
    </section>

    <section class="own-voice-section section-pad">
      <div class="builder-heading"><p class="kicker">Your voice, your direction</p><h2>Keep the feeling. Shape the performance.</h2><p>Record your own voice in the quick studio, then save an expression brief here. Production speech-to-speech processing must use the speaker’s explicit permission.</p></div>
      <div class="expression-console">
        <div class="expression-controls">
          <label><span>Energy <b>{{ expression.energy }}%</b></span><input v-model="expression.energy" type="range" min="0" max="100" /></label>
          <label><span>Warmth <b>{{ expression.warmth }}%</b></span><input v-model="expression.warmth" type="range" min="0" max="100" /></label>
          <label><span>Pace <b>{{ expression.pace }}%</b></span><input v-model="expression.pace" type="range" min="0" max="100" /></label>
          <label><span>Pitch direction <b>{{ expression.pitch }}%</b></span><input v-model="expression.pitch" type="range" min="0" max="100" /></label>
          <label><span>Primary emotion</span><select v-model="expression.emotion"><option>Joyful</option><option>Curious</option><option>Deadpan</option><option>Excited</option><option>Gentle</option><option>Suspenseful</option><option>Heartfelt</option></select></label>
          <label class="consent-check"><input v-model="consent" type="checkbox" /><span>I confirm this is my voice or I have explicit permission from the speaker.</span></label>
          <button type="button" :disabled="!consent" @click="saveOwnVoiceBrief">Save voice direction</button>
        </div>
        <aside class="expression-preview"><span class="expression-orb">{{ expression.emotion.slice(0, 1) }}</span><h3>{{ expression.emotion }} performance</h3><p>Energy {{ expression.energy }} · Warmth {{ expression.warmth }} · Pace {{ expression.pace }} · Pitch {{ expression.pitch }}</p><small>This saves direction only. It does not upload or synthesize audio.</small></aside>
      </div>
    </section>
    <div v-if="message" class="toast-message">{{ message }}</div>
  </PlatformPageShell>
</template>
