<script setup>
import { computed, ref } from 'vue';
import { useMemeStore } from './stores/memeStore';
import SiteHeader from './components/SiteHeader.vue';
import SiteFooter from './components/SiteFooter.vue';
import CharacterSelector from './components/CharacterSelector.vue';
import UploadZone from './components/UploadZone.vue';
import VoiceInput from './components/VoiceInput.vue';
import LanguageVoiceSelector from './components/LanguageVoiceSelector.vue';
import VideoPreview from './components/VideoPreview.vue';

const store = useMemeStore();
const voiceFilter = ref('all');

const voiceRegions = [
  { name: 'Bhojpuri Mischief', place: 'Purvanchal, India', sample: 'Warm · witty · live', mark: 'भो', status: 'live', group: 'india', voiceStyle: 'bhojpuri-comedy-uncle' },
  { name: 'Kannada Punchlines', place: 'Karnataka, India', sample: 'Bright · playful · live', mark: 'ಕ', status: 'live', group: 'india', voiceStyle: 'kannada-funny-boy' },
  { name: 'Mumbai Tapori', place: 'Maharashtra, India', sample: 'Street-smart · roadmap', mark: 'मुं', status: 'roadmap', group: 'india' },
  { name: 'Tamil Storyteller', place: 'Tamil Nadu, India', sample: 'Expressive · roadmap', mark: 'த', status: 'roadmap', group: 'india' },
  { name: 'Nigerian Pidgin Joy', place: 'Lagos, Nigeria', sample: 'Bouncy · roadmap', mark: 'NG', status: 'roadmap', group: 'world' },
  { name: 'Brazilian Banter', place: 'São Paulo, Brazil', sample: 'Sunny · roadmap', mark: 'BR', status: 'roadmap', group: 'world' },
];

const characterStories = [
  { name: 'Chulbul', role: 'Mischief captain', mark: 'C', color: 'coral', actions: ['Eye rolls', 'Snack dance', 'Big reactions'] },
  { name: 'Robo Guru', role: 'Overthinking genius', mark: 'R', color: 'violet', actions: ['Glitch groove', 'Laser focus', 'Robot shrug'] },
  { name: 'Ninja Chotu', role: 'Pocket-size hero', mark: 'N', color: 'teal', actions: ['Sneaky entrance', 'Victory spin', 'Tiny thunder'] },
];

const filteredVoices = computed(() => (
  voiceFilter.value === 'all'
    ? voiceRegions
    : voiceRegions.filter((voice) => voice.group === voiceFilter.value)
));

const completion = computed(() => {
  let steps = 0;
  if (store.selectedCharacter) steps += 1;
  if (store.selfieFile) steps += 1;
  if ((store.inputMode === 'text' && store.scriptText.trim()) || (store.inputMode === 'voice' && store.voiceFile)) steps += 1;
  return steps;
});

function jumpToStudio() {
  document.querySelector('#studio')?.scrollIntoView({ behavior: 'smooth' });
}

function chooseVoice(voice) {
  if (voice.status !== 'live' || !voice.voiceStyle) return;
  store.inputMode = 'text';
  store.voiceStyle = voice.voiceStyle;
  jumpToStudio();
}
</script>

<template>
  <div id="top" class="site-shell">
    <SiteHeader />

    <main>
      <section class="hero section-pad" aria-labelledby="hero-title">
        <div class="hero-copy">
          <p class="eyebrow"><span>New</span> Local laughter, made by you</p>
          <h1 id="hero-title">Your face.<br />Their world.<br /><em>Every laugh feels local.</em></h1>
          <p class="hero-lede">
            Turn one selfie into a share-ready cartoon moment with original characters and
            culturally directed comedy voices—without copying anyone else's identity.
          </p>
          <div class="hero-actions">
            <button class="primary-button" type="button" @click="jumpToStudio">
              Create my toon <span aria-hidden="true">→</span>
            </button>
            <a class="text-button" href="#how-it-works"><span aria-hidden="true">▶</span> See how it works</a>
          </div>
          <div class="hero-proof" aria-label="Product benefits">
            <span><b>30 sec</b> to start</span>
            <span><b>Private</b> by design</span>
            <span><b>No account</b> needed</span>
          </div>
        </div>

        <div class="hero-visual" aria-label="ToonSwap original character world">
          <div class="hero-scribble hero-scribble-one" aria-hidden="true"></div>
          <div class="hero-scribble hero-scribble-two" aria-hidden="true"></div>
          <div class="speech-card speech-card-left">
            <span class="sound-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
            <div><strong>Bhojpuri mischief</strong><small>Original comedy voice</small></div>
          </div>
          <div class="speech-card speech-card-right">
            <b>200+</b><span>language<br />roadmap</span>
          </div>
          <div class="hero-stage">
            <span class="star star-one">✦</span><span class="star star-two">✦</span>
            <div class="toon toon-chulbul"><span class="toon-hair"></span><b>C</b><small>CHULBUL</small></div>
            <div class="toon toon-robo"><span class="toon-antenna"></span><b>R</b><small>ROBO GURU</small></div>
            <div class="toon toon-ninja"><span class="toon-band"></span><b>N</b><small>NINJA CHOTU</small></div>
          </div>
          <div class="floating-note">Made with <b>original characters</b> only</div>
        </div>
      </section>

      <section class="ticker" aria-label="ToonSwap product principles">
        <div>
          <span>ORIGINAL CHARACTERS</span><b>✦</b><span>NATIVE-FIRST COMEDY</span><b>✦</b>
          <span>YOUR FACE, YOUR VOICE</span><b>✦</b><span>MADE TO SHARE JOY</span><b>✦</b>
          <span>ORIGINAL CHARACTERS</span><b>✦</b><span>NATIVE-FIRST COMEDY</span>
        </div>
      </section>

      <section id="studio" class="studio-section section-pad" aria-labelledby="studio-title">
        <div class="section-heading centered-heading">
          <p class="kicker">The ToonSwap Studio</p>
          <h2 id="studio-title">One selfie. Three tiny steps.<br /><span>A whole new punchline.</span></h2>
          <p>No editing timeline. No complicated prompt. Just pick, add, and play.</p>
        </div>

        <div class="creator-shell">
          <div class="creator-progress" aria-label="Creation progress">
            <div v-for="step in 3" :key="step" :class="{ complete: completion >= step }">
              <span>{{ completion > step ? '✓' : step }}</span>
              <small>{{ ['Choose a character', 'Add your selfie', 'Give them a voice'][step - 1] }}</small>
            </div>
            <i :style="{ width: `${Math.max(0, (completion - 1) * 50)}%` }"></i>
          </div>

          <div class="creator-grid">
            <div class="creator-form">
              <CharacterSelector />
              <UploadZone />
              <VoiceInput />
              <LanguageVoiceSelector />
            </div>

            <aside class="creator-preview" aria-label="Creation preview">
              <div class="preview-topline">
                <span>LIVE PREVIEW</span>
                <small><i></i> Ready when you are</small>
              </div>
              <div class="phone-preview">
                <div class="phone-speaker"></div>
                <img v-if="store.selfiePreviewUrl" :src="store.selfiePreviewUrl" alt="Your selected selfie" />
                <div v-else class="preview-character" aria-hidden="true">
                  <div class="preview-face">{{ store.selectedCharacter ? 'YOU' : '?' }}</div>
                  <p>{{ store.selectedCharacter ? 'Your face goes here' : 'Pick a character to begin' }}</p>
                </div>
                <div class="preview-caption">
                  <span>ToonSwap original</span>
                  <strong>{{ store.scriptText || 'Your punchline will appear here.' }}</strong>
                </div>
                <div class="preview-watermark">TOONSWAP</div>
              </div>
              <div class="selection-summary">
                <span><small>Character</small><b>{{ store.selectedCharacter ? store.selectedCharacter.split('-')[0] : 'Not selected' }}</b></span>
                <span><small>Voice</small><b>{{ store.inputMode === 'voice' ? 'Your recording' : store.voiceStyle.split('-').slice(0, 2).join(' ') }}</b></span>
              </div>
              <button
                class="generate-button"
                type="button"
                :disabled="!store.canGenerate || store.isProcessing"
                @click="store.generate()"
              >
                <span>{{ store.isProcessing ? 'Making your toon…' : 'Make my toon' }}</span>
                <b aria-hidden="true">{{ store.isProcessing ? '•••' : '→' }}</b>
              </button>
              <p class="consent-note">By creating, you confirm you have permission to use the uploaded media.</p>
            </aside>
          </div>

          <VideoPreview />
        </div>
      </section>

      <section id="voices" class="voices-section section-pad" aria-labelledby="voices-title">
        <div class="section-heading split-heading">
          <div>
            <p class="kicker light-kicker">Voices with a sense of place</p>
            <h2 id="voices-title">Comedy has an accent.<br /><span>We celebrate it.</span></h2>
          </div>
          <p>
            Built around rhythm, warmth, and local expression—not impressions of real people.
            Four original profiles are live now; a global native-led library is the roadmap.
          </p>
        </div>

        <div class="voice-toolbar">
          <div class="filter-pills" aria-label="Filter voice regions">
            <button v-for="filter in [{id:'all',label:'All voices'}, {id:'india',label:'Across India'}, {id:'world',label:'Around the world'}]" :key="filter.id" type="button" :class="{ active: voiceFilter === filter.id }" @click="voiceFilter = filter.id">{{ filter.label }}</button>
          </div>
          <span class="roadmap-label">100+ voice profiles · roadmap</span>
        </div>

        <div class="voice-grid">
          <article v-for="voice in filteredVoices" :key="voice.name" class="voice-card" :class="{ live: voice.status === 'live' }">
            <div class="voice-card-top">
              <span class="voice-mark">{{ voice.mark }}</span>
              <span class="voice-status">{{ voice.status === 'live' ? 'Live' : 'Roadmap' }}</span>
            </div>
            <h3>{{ voice.name }}</h3>
            <p>{{ voice.place }}</p>
            <div class="voice-card-bottom">
              <span class="mini-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
              <small>{{ voice.sample }}</small>
              <button v-if="voice.status === 'live'" type="button" :aria-label="`Use ${voice.name}`" @click="chooseVoice(voice)">Use <span>→</span></button>
            </div>
          </article>
        </div>

        <div class="language-banner">
          <div class="language-orbit" aria-hidden="true"><span>न</span><span>A</span><span>ಕ</span><span>ع</span></div>
          <div>
            <p class="kicker">Language without borders</p>
            <h3>Speak naturally. Share globally.</h3>
            <p>Our goal is 200+ languages and dialects, with clear labels for what is live, in testing, and coming next.</p>
          </div>
          <a href="#studio">Try the live voices <span>→</span></a>
        </div>
      </section>

      <section id="characters" class="characters-section section-pad" aria-labelledby="characters-title">
        <div class="section-heading centered-heading">
          <p class="kicker">Meet the originals</p>
          <h2 id="characters-title">Big personality.<br /><span>Zero borrowed identity.</span></h2>
          <p>Every ToonSwap character has their own silhouette, movement language, and comedy rhythm.</p>
        </div>

        <div class="character-showcase">
          <article v-for="character in characterStories" :key="character.name" class="character-story" :class="`story-${character.color}`">
            <div class="character-art" aria-hidden="true">
              <span class="character-shadow"></span>
              <div class="character-head"><b>{{ character.mark }}</b></div>
              <i class="motion-line one"></i><i class="motion-line two"></i>
            </div>
            <div class="character-copy">
              <span>ORIGINAL CHARACTER</span>
              <h3>{{ character.name }}</h3>
              <p>{{ character.role }}</p>
              <ul>
                <li v-for="action in character.actions" :key="action">{{ action }}</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section id="how-it-works" class="steps-section section-pad" aria-labelledby="steps-title">
        <div class="section-heading split-heading dark-copy">
          <div><p class="kicker">Simple on purpose</p><h2 id="steps-title">From selfie to smile<br /><span>in three moves.</span></h2></div>
          <p>We handle the technical choreography so the experience stays human, fast, and fun.</p>
        </div>
        <div class="steps-grid">
          <article><span>01</span><div class="step-icon">+</div><h3>Choose your world</h3><p>Pick an original character whose energy matches your moment.</p></article>
          <article><span>02</span><div class="step-icon">◉</div><h3>Add your performance</h3><p>Upload a clear selfie, then type a line or record your own voice.</p></article>
          <article><span>03</span><div class="step-icon">↗</div><h3>Share the joy</h3><p>Preview the result, download it, and send it to someone who needs a laugh.</p></article>
        </div>
      </section>

      <section id="promise" class="promise-section section-pad">
        <div class="promise-card">
          <div>
            <p class="kicker light-kicker">The ToonSwap promise</p>
            <h2>Technology should make people <em>more human</em>, not less.</h2>
          </div>
          <div class="promise-list">
            <p><span>01</span><b>Original by design</b><small>No celebrity clones. No copied cartoon worlds.</small></p>
            <p><span>02</span><b>Culture with context</b><small>Native direction over stereotypes and shortcuts.</small></p>
            <p><span>03</span><b>Your media, respected</b><small>Consent, clear controls, and responsible retention.</small></p>
          </div>
        </div>
      </section>

      <section class="final-cta section-pad">
        <span class="cta-burst burst-left" aria-hidden="true">HA!</span>
        <span class="cta-burst burst-right" aria-hidden="true">LOL</span>
        <p class="kicker">Your group chat is waiting</p>
        <h2>Make someone's day<br />a little more <em>toon.</em></h2>
        <button class="primary-button dark-button" type="button" @click="jumpToStudio">Create my first toon <span>→</span></button>
        <small>Free preview · No account · Original characters</small>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>
