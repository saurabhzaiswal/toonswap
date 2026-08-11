<script setup>
import { computed, reactive, ref, watch } from 'vue';
import PlatformPageShell from '../components/PlatformPageShell.vue';
import AppButton from '../components/ui/AppButton.vue';
import UiInput from '../components/ui/UiInput.vue';
import UiSegmented from '../components/ui/UiSegmented.vue';
import UiSelect from '../components/ui/UiSelect.vue';
import UiTextarea from '../components/ui/UiTextarea.vue';
import { archetypes, characterCatalog, worlds } from '../data/platformCatalog';
import { useProjectStore } from '../stores/projectStore';

const projectStore = useProjectStore();
const query = ref('');
const worldFilter = ref('all');
const libraryMode = ref('art-ready');
const visibleCount = ref(12);
const savedMessage = ref('');
const palettes = ['#ff624d', '#55cdbd', '#7152f3', '#ffc94a', '#e259bb', '#258bb9'];
const builder = reactive({
  name: '',
  worldId: worlds[0].id,
  archetypeId: archetypes[0].id,
  personality: 'Curious, kind, chaotic under pressure',
  silhouette: 'Compact body, oversized hands, triangular hair',
  movement: 'Quick tiptoe, huge reaction, proud recovery',
  palette: palettes[0],
  prompt: '',
});

const worldOptions = computed(() => [
  { value: 'all', label: 'All 12 story worlds' },
  ...worlds.map((world) => ({ value: world.id, label: world.name })),
]);
const builderWorldOptions = worlds.map((world) => ({
  value: world.id,
  label: `${world.name} · ${world.era}`,
}));
const roleOptions = archetypes.map((item) => ({ value: item.id, label: item.name }));
const catalogCounts = {
  total: characterCatalog.length,
  illustrated: characterCatalog.filter((item) => item.status === 'art-ready').length,
  blueprints: characterCatalog.filter((item) => item.status === 'concept').length,
};
const filteredCharacters = computed(() =>
  characterCatalog.filter((character) => {
    const matchesWorld = worldFilter.value === 'all' || character.worldId === worldFilter.value;
    const matchesMode =
      libraryMode.value === 'all' ||
      (libraryMode.value === 'art-ready'
        ? character.status === 'art-ready'
        : character.status === 'concept');
    const haystack =
      `${character.name} ${character.world} ${character.role} ${character.personality}`.toLowerCase();
    return matchesWorld && matchesMode && haystack.includes(query.value.toLowerCase());
  }),
);
const shownCharacters = computed(() => filteredCharacters.value.slice(0, visibleCount.value));
const selectedWorld = computed(() => worlds.find((world) => world.id === builder.worldId));
const selectedArchetype = computed(() =>
  archetypes.find((item) => item.id === builder.archetypeId),
);

watch([worldFilter, libraryMode, query], () => {
  visibleCount.value = 12;
});

function artStyle(index) {
  if (index === null || index === undefined) return {};
  return {
    backgroundImage: "url('/art/character-atlas.png')",
    backgroundSize: '600% 400%',
    backgroundPosition: `${(index % 6) * 20}% ${Math.floor(index / 6) * 33.333}%`,
  };
}

function flash(message) {
  savedMessage.value = message;
  window.setTimeout(() => {
    savedMessage.value = '';
  }, 2600);
}

function saveCharacter() {
  const name =
    builder.name.trim() || `${selectedWorld.value.prefix}${selectedArchetype.value.suffix}`;
  projectStore.saveCharacter({
    ...builder,
    name,
    world: selectedWorld.value.name,
    role: selectedArchetype.value.name,
  });
  flash(`${name} saved to this device.`);
}

function addToCast(character) {
  if (!projectStore.project.cast.some((item) => item.id === character.id)) {
    projectStore.updateProject({ cast: [...projectStore.project.cast, character] });
  }
  flash(`${character.name} added to your story cast.`);
}
</script>

<template>
  <PlatformPageShell
    eyebrow="Original character universe"
    title="Meet characters you have never seen before."
    description="Start with 24 art-ready ToonSwap originals across twelve worlds, then explore 216 structured character blueprints - or design someone completely your own."
    stat="216 originals"
    status="Original IP only · 24 illustrated · 192 production blueprints"
  >
    <template #hero-media>
      <div class="hero-character-stack" aria-label="A collage of original ToonSwap characters">
        <span v-for="index in [0, 7, 12, 17]" :key="index" :style="artStyle(index)"></span>
        <strong>24</strong>
      </div>
    </template>

    <section class="character-library section-pad">
      <div class="coverage-banner">
        <div class="coverage-number">
          <strong>{{ catalogCounts.total }}</strong
          ><span>original characters designed</span>
        </div>
        <div class="coverage-copy">
          <b>Why are there 24 finished pictures?</b>
          <p>
            <strong>{{ catalogCounts.illustrated }} characters are illustrated now.</strong> The
            other {{ catalogCounts.blueprints }} already have an original name, world, personality,
            movement, and production brief, but their final art is still coming. We label them
            clearly instead of showing repeated fake pictures.
          </p>
          <div class="coverage-meter">
            <i
              :style="{ width: `${(catalogCounts.illustrated / catalogCounts.total) * 100}%` }"
            ></i>
          </div>
          <small
            >{{ catalogCounts.illustrated }} illustrated · {{ catalogCounts.blueprints }} production
            blueprints waiting for reviewed generation</small
          >
        </div>
      </div>
      <header class="section-heading">
        <div>
          <p class="kicker">Choose your cast</p>
          <h2>Faces first. Details when you need them.</h2>
          <p>
            Every illustrated character has a distinct world, role, personality, and movement
            language. The remaining blueprints are the scale-up path - not fake finished assets.
          </p>
        </div>
        <UiSegmented
          v-model="libraryMode"
          label="Library view"
          :options="[
            { value: 'art-ready', label: '24 illustrated now' },
            { value: 'concept', label: '192 art coming soon' },
            { value: 'all', label: 'All 216' },
          ]"
        />
      </header>

      <div class="filters">
        <UiInput
          v-model="query"
          type="search"
          label="Find a character"
          placeholder="Try detective, village, musician…"
        />
        <UiSelect v-model="worldFilter" label="Story world" :options="worldOptions" />
        <div class="result-count">
          <b>{{ filteredCharacters.length }}</b
          ><span>matching originals</span>
        </div>
      </div>

      <div class="world-pills" aria-label="Filter by story world">
        <AppButton
          v-for="world in worlds"
          :key="world.id"
          variant="bare"
          :class="{ active: worldFilter === world.id }"
          :style="{ '--world': world.color }"
          @click="worldFilter = world.id"
          ><i>{{ world.mark }}</i
          ><span
            ><b>{{ world.name }}</b
            ><small>{{ world.era }}</small></span
          ></AppButton
        >
      </div>

      <div class="character-grid">
        <article
          v-for="character in shownCharacters"
          :key="character.id"
          class="character-card"
          :style="{ '--card-color': character.color }"
        >
          <div
            v-if="character.artIndex !== null"
            class="character-art"
            :style="artStyle(character.artIndex)"
          >
            <span>Illustrated original</span>
          </div>
          <div v-else class="blueprint-art" :class="`shape-${character.blueprintIndex % 6}`">
            <i aria-hidden="true"></i><b>{{ character.mark }}</b
            ><span>Art coming soon · blueprint ready</span>
          </div>
          <div class="character-copy">
            <small>{{ character.era }} · {{ character.role }}</small>
            <h3>{{ character.name }}</h3>
            <p>{{ character.personality }}</p>
            <div class="movement">
              <i aria-hidden="true">↝</i
              ><span><b>Movement signature</b>{{ character.movement }}</span>
            </div>
            <AppButton variant="outline" block @click="addToCast(character)"
              >Add {{ character.name }} to cast <template #icon>＋</template></AppButton
            >
          </div>
        </article>
      </div>
      <AppButton
        v-if="visibleCount < filteredCharacters.length"
        variant="outline"
        class="load-more"
        arrow
        @click="visibleCount += 12"
        >Show 12 more</AppButton
      >
    </section>

    <section class="character-builder section-pad">
      <div class="builder-intro">
        <p class="kicker">Custom character lab</p>
        <h2>Build somebody only your story could invent.</h2>
        <p>
          Describe what makes them emotionally memorable. ToonSwap uses world rules, silhouette,
          movement, relationships, and props - not copied cartoon names or lookalikes.
        </p>
        <div class="builder-rule">
          <span>✓</span> New silhouette <span>✓</span> New story role <span>✓</span> New movement
        </div>
      </div>
      <div class="builder-shell">
        <div class="builder-form">
          <UiInput
            v-model="builder.name"
            label="Character name"
            placeholder="Leave blank for an original suggestion"
          />
          <div class="two-up">
            <UiSelect
              v-model="builder.worldId"
              label="Story world"
              :options="builderWorldOptions"
            /><UiSelect v-model="builder.archetypeId" label="Story role" :options="roleOptions" />
          </div>
          <UiInput v-model="builder.personality" label="Personality in one sentence" />
          <div class="two-up">
            <UiTextarea
              v-model="builder.silhouette"
              label="Original silhouette"
              :rows="3"
            /><UiTextarea v-model="builder.movement" label="Movement signature" :rows="3" />
          </div>
          <UiTextarea
            v-model="builder.prompt"
            label="Character design brief"
            :rows="4"
            placeholder="Clothing materials, proportions, habits, relationships, props, fears, hopes… Never name an existing character."
            hint="This brief is saved locally. Image generation becomes available after a moderated backend provider is connected."
          />
          <fieldset class="palette">
            <legend>Key color</legend>
            <AppButton
              v-for="color in palettes"
              :key="color"
              variant="bare"
              icon-only
              :class="{ active: builder.palette === color }"
              :style="{ background: color }"
              :aria-label="`Use ${color}`"
              :aria-pressed="builder.palette === color"
              @click="builder.palette = color"
            ></AppButton>
          </fieldset>
          <AppButton variant="primary" arrow @click="saveCharacter"
            >Save original character draft</AppButton
          >
        </div>
        <aside class="builder-preview" :style="{ '--preview': builder.palette }">
          <div
            class="preview-art"
            :style="artStyle(worlds.findIndex((world) => world.id === builder.worldId) * 2)"
          >
            <span>Visual direction</span>
          </div>
          <div>
            <small>{{ selectedWorld.era }}</small>
            <h3>{{ builder.name || `${selectedWorld.prefix}${selectedArchetype.suffix}` }}</h3>
            <b>{{ selectedArchetype.name }} · {{ selectedWorld.name }}</b>
            <p>{{ builder.personality }}</p>
          </div>
          <div class="original-note">
            <span>Originality check</span>
            <p>
              Use this as mood direction only. The final design must get a new silhouette, features,
              clothing, props, and movement pass.
            </p>
          </div>
        </aside>
      </div>
    </section>
    <div v-if="savedMessage" class="character-toast" role="status">{{ savedMessage }}</div>
  </PlatformPageShell>
</template>

<style scoped lang="scss">
@use '../styles/tokens' as *;
.hero-character-stack {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 120px);
  width: 250px;
  transform: rotate(2deg);
}
.hero-character-stack > span {
  aspect-ratio: 1;
  border: 5px solid $canvas;
  border-radius: 22px;
  background-repeat: no-repeat;
  box-shadow: $shadow-soft;
}
.hero-character-stack > span:nth-child(2),
.hero-character-stack > span:nth-child(4) {
  transform: translateY(18px);
}
.hero-character-stack strong {
  position: absolute;
  right: -18px;
  bottom: -20px;
  display: grid;
  place-items: center;
  width: 76px;
  height: 76px;
  border: 4px solid $ink;
  border-radius: 50%;
  color: $ink;
  background: $gold;
  font-size: 1.8rem;
}
.character-library,
.character-builder {
  max-width: 1540px;
  margin: 0 auto;
  padding-top: clamp(70px, 8vw, 120px);
  padding-bottom: clamp(70px, 8vw, 120px);
}
.section-heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 350px;
  gap: 50px;
  align-items: end;
  margin-bottom: 34px;
}
.section-heading h2,
.builder-intro h2 {
  max-width: 850px;
  margin: 7px 0 16px;
  font-size: var(--type-h2);
  line-height: 1.02;
  letter-spacing: -0.045em;
}
.section-heading p,
.builder-intro > p {
  max-width: 780px;
  margin: 0;
  color: $muted;
  font-size: var(--type-body);
  line-height: 1.65;
}
.filters {
  display: grid;
  grid-template-columns: minmax(260px, 1.4fr) minmax(240px, 0.8fr) 170px;
  gap: 14px;
  align-items: end;
  padding: 18px;
  border: 1px solid $line;
  border-radius: $radius-md;
  background: #f4eee5;
}
.result-count {
  display: grid;
  place-items: center;
  min-height: 78px;
  border: 1.5px solid color-mix(in srgb, #{$violet} 55%, #{$line});
  border-radius: 15px;
  color: white;
  background: linear-gradient(145deg, $violet, #4f35bb);
  box-shadow: 0 7px 0 color-mix(in srgb, #{$violet} 68%, #{$ink});
}
.result-count b {
  color: $gold;
  font-size: 1.8rem;
  line-height: 1;
}
.result-count span {
  font-size: 0.82rem;
  font-weight: 700;
}
.world-pills {
  display: flex;
  gap: 10px;
  margin: 22px 0 34px;
  padding-bottom: 10px;
  overflow-x: auto;
  scrollbar-width: thin;
}
.world-pills button {
  flex: 0 0 220px;
  display: grid;
  grid-template-columns: 46px 1fr;
  gap: 11px;
  align-items: center;
  min-height: 72px;
  padding: 10px;
  text-align: left;
  border: 1.5px solid $line;
  border-radius: 16px;
  color: $ink;
  background: white;
  cursor: pointer;
}
.world-pills button.active {
  border-color: var(--world);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--world) 22%, transparent);
}
.world-pills i {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  color: white;
  background: var(--world);
  font-style: normal;
  font-size: 0.8rem;
  font-weight: 900;
}
.world-pills span {
  display: grid;
  gap: 2px;
}
.world-pills b {
  font-size: 0.9rem;
}
.world-pills small {
  color: $muted;
  font-size: 0.74rem;
}
.coverage-banner {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 32px;
  align-items: center;
  margin-bottom: 62px;
  padding: clamp(24px, 4vw, 42px);
  border: 2px solid $ink;
  border-radius: $radius-lg;
  background: color-mix(in srgb, #{$gold} 34%, #{$paper});
  box-shadow: 8px 9px 0 $ink;
}
.coverage-number {
  display: grid;
  text-align: center;
}
.coverage-number strong {
  color: $coral;
  font-size: clamp(3.8rem, 7vw, 6.8rem);
  line-height: 0.88;
  letter-spacing: -0.07em;
}
.coverage-number span {
  margin-top: 10px;
  font-weight: 900;
}
.coverage-copy b {
  font-size: clamp(1.25rem, 2vw, 1.75rem);
}
.coverage-copy p {
  max-width: 900px;
  margin: 9px 0 16px;
  color: $muted;
  line-height: 1.65;
}
.coverage-copy p strong {
  color: $ink;
}
.coverage-meter {
  height: 11px;
  overflow: hidden;
  border: 1.5px solid $ink;
  border-radius: 999px;
  background: white;
}
.coverage-meter i {
  display: block;
  height: 100%;
  min-width: 14px;
  background: $coral;
}
.coverage-copy small {
  display: block;
  margin-top: 8px;
  color: $muted;
  font-weight: 800;
}
.character-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}
.character-card {
  @include panel;
  overflow: hidden;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease;
}
.character-card:hover {
  transform: translateY(-5px);
  box-shadow: $shadow-lift;
}
.character-art,
.blueprint-art {
  position: relative;
  aspect-ratio: 16 / 10;
  background-color: color-mix(in srgb, var(--card-color) 26%, #fff);
  background-repeat: no-repeat;
}
.character-art span,
.blueprint-art span {
  position: absolute;
  left: 14px;
  bottom: 14px;
  padding: 7px 10px;
  border-radius: 30px;
  color: $ink;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  font-size: 0.74rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.blueprint-art {
  display: grid;
  place-items: center;
  isolation: isolate;
  overflow: hidden;
  background: repeating-linear-gradient(45deg, #f0e9df, #f0e9df 16px, #f8f3eb 16px, #f8f3eb 32px);
}
.blueprint-art::after {
  content: '';
  position: absolute;
  inset: 12px;
  border: 1px dashed color-mix(in srgb, var(--card-color) 65%, $ink);
  border-radius: 18px;
}
.blueprint-art i {
  position: absolute;
  z-index: -1;
  width: 120px;
  height: 145px;
  border: 3px solid $ink;
  border-radius: 46% 46% 28% 28%;
  background: color-mix(in srgb, var(--card-color) 68%, white);
  box-shadow: 8px 9px 0 $ink;
  transform: rotate(-4deg);
}
.blueprint-art b {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border: 2px solid $ink;
  border-radius: 50%;
  color: $ink;
  background: white;
  font-size: 1.25rem;
}
.blueprint-art.shape-1 i {
  width: 150px;
  height: 112px;
  border-radius: 50% 45% 35% 50%;
  transform: rotate(5deg);
}
.blueprint-art.shape-2 i {
  width: 105px;
  height: 155px;
  border-radius: 35px 35px 48% 48%;
  transform: rotate(2deg);
}
.blueprint-art.shape-3 i {
  width: 148px;
  height: 140px;
  border-radius: 30% 60% 28% 52%;
  transform: rotate(-7deg);
}
.blueprint-art.shape-4 i {
  width: 88px;
  height: 158px;
  border-radius: 45% 45% 22px 22px;
  transform: rotate(7deg);
}
.blueprint-art.shape-5 i {
  width: 160px;
  height: 105px;
  border-radius: 52% 35% 50% 32%;
  transform: rotate(-2deg);
}
.character-copy {
  display: grid;
  gap: 12px;
  padding: 22px;
}
.character-copy > small {
  color: var(--card-color);
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.character-copy h3 {
  margin: 0;
  font-size: 1.8rem;
  letter-spacing: -0.04em;
}
.character-copy > p {
  min-height: 48px;
  margin: 0;
  color: $muted;
  line-height: 1.5;
}
.movement {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 10px;
  align-items: start;
  padding: 13px;
  border-radius: 14px;
  background: #f5efe7;
}
.movement i {
  color: var(--card-color);
  font-size: 1.5rem;
}
.movement span {
  display: grid;
  color: $muted;
  font-size: 0.83rem;
  line-height: 1.45;
}
.movement b {
  color: $ink;
  font-size: 0.78rem;
}
.load-more {
  display: flex;
  margin: 28px auto 0;
}
.character-builder {
  border-top: 1px solid $line;
}
.builder-intro {
  display: grid;
  justify-items: start;
  margin-bottom: 38px;
}
.builder-rule {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin-top: 22px;
  color: $ink;
  font-weight: 800;
}
.builder-rule span {
  color: #0b9d83;
}
.builder-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(340px, 0.65fr);
  gap: 22px;
  align-items: start;
}
.builder-form {
  @include panel;
  display: grid;
  gap: 20px;
  padding: clamp(24px, 4vw, 42px);
}
.two-up {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px;
}
.palette {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 0;
  border: 0;
}
.palette legend {
  @include readable-label;
  margin-bottom: 10px;
}
.palette button {
  width: 38px;
  height: 38px;
  border: 4px solid white;
  border-radius: 50%;
  box-shadow: 0 0 0 1px $line;
  cursor: pointer;
}
.palette button.active {
  box-shadow: 0 0 0 3px $ink;
}
.builder-preview {
  @include panel;
  position: sticky;
  top: 100px;
  overflow: hidden;
}
.preview-art {
  position: relative;
  aspect-ratio: 1 / 0.8;
  background-repeat: no-repeat;
}
.preview-art::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 42%;
  background: linear-gradient(transparent, rgba(23, 19, 33, 0.72));
}
.preview-art span {
  position: absolute;
  z-index: 1;
  left: 20px;
  bottom: 18px;
  color: white;
  font-weight: 900;
}
.builder-preview > div:not(.preview-art):not(.original-note) {
  display: grid;
  gap: 8px;
  padding: 24px;
}
.builder-preview small {
  color: var(--preview);
  font-weight: 900;
  text-transform: uppercase;
}
.builder-preview h3 {
  margin: 0;
  font-size: 2rem;
}
.builder-preview p {
  margin: 5px 0 0;
  color: $muted;
  line-height: 1.55;
}
.original-note {
  margin: 0 20px 20px;
  padding: 16px;
  border-radius: 15px;
  background: color-mix(in srgb, var(--preview) 12%, white);
}
.original-note span {
  font-weight: 900;
}
.original-note p {
  margin: 5px 0 0;
  font-size: 0.86rem;
}
.character-toast {
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
.world-pills small,
.character-art span,
.blueprint-art span,
.character-copy > small,
.movement b {
  font-size: 0.8rem;
}
@media (max-width: 1080px) {
  .character-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .builder-shell {
    grid-template-columns: 1fr;
  }
  .builder-preview {
    position: static;
    display: grid;
    grid-template-columns: 340px 1fr;
  }
  .section-heading {
    grid-template-columns: 1fr;
  }
  .section-heading > :last-child {
    max-width: 420px;
  }
}
@media (max-width: 700px) {
  .coverage-banner {
    grid-template-columns: 1fr;
    text-align: left;
  }
  .coverage-number {
    text-align: left;
  }
  .hero-character-stack {
    grid-template-columns: repeat(2, 92px);
    width: 190px;
  }
  .filters,
  .character-grid,
  .two-up,
  .builder-preview {
    grid-template-columns: 1fr;
  }
  .result-count {
    min-height: 65px;
  }
  .character-copy h3 {
    font-size: 1.55rem;
  }
  .section-heading > :last-child {
    width: 100%;
  }
  .builder-form {
    padding: 20px;
  }
  .builder-preview .preview-art {
    aspect-ratio: 16 / 11;
  }
}
@media (max-width: 460px) {
  .hero-character-stack {
    margin-inline: auto;
  }
  .world-pills {
    flex-wrap: nowrap;
  }
  .world-pills button {
    flex-basis: 190px;
  }
  .palette {
    flex-wrap: wrap;
  }
  .character-art,
  .blueprint-art {
    aspect-ratio: 4 / 3;
  }
  .character-toast {
    right: 12px;
    bottom: 12px;
    left: 12px;
    max-width: none;
  }
}
</style>
