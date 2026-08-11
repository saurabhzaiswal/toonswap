<script setup>
import { computed, reactive, ref } from 'vue';
import PlatformPageShell from '../components/PlatformPageShell.vue';
import { archetypes, characterCatalog, worlds } from '../data/platformCatalog';
import { useProjectStore } from '../stores/projectStore';

const projectStore = useProjectStore();
const query = ref('');
const worldFilter = ref('all');
const visibleCount = ref(18);
const savedMessage = ref('');
const builder = reactive({
  name: '', worldId: worlds[0].id, archetypeId: archetypes[0].id,
  personality: 'Curious, kind, chaotic under pressure', silhouette: 'Small body, oversized hands, triangular hair',
  movement: 'Quick tiptoe, huge reaction, proud recovery', palette: '#ff624d', prompt: '',
});

const filteredCharacters = computed(() => characterCatalog.filter((character) => {
  const matchesWorld = worldFilter.value === 'all' || character.worldId === worldFilter.value;
  const haystack = `${character.name} ${character.world} ${character.role} ${character.personality}`.toLowerCase();
  return matchesWorld && haystack.includes(query.value.toLowerCase());
}));
const shownCharacters = computed(() => filteredCharacters.value.slice(0, visibleCount.value));
const selectedWorld = computed(() => worlds.find((world) => world.id === builder.worldId));
const selectedArchetype = computed(() => archetypes.find((item) => item.id === builder.archetypeId));

function saveCharacter() {
  const name = builder.name.trim() || `${selectedWorld.value.prefix}${selectedArchetype.value.suffix}`;
  projectStore.saveCharacter({ ...builder, name, world: selectedWorld.value.name, role: selectedArchetype.value.name });
  savedMessage.value = `${name} saved to this device.`;
  window.setTimeout(() => { savedMessage.value = ''; }, 2800);
}

function addToCast(character) {
  if (!projectStore.project.cast.some((item) => item.id === character.id)) {
    projectStore.updateProject({ cast: [...projectStore.project.cast, character] });
  }
  savedMessage.value = `${character.name} added to your story cast.`;
  window.setTimeout(() => { savedMessage.value = ''; }, 2200);
}
</script>

<template>
  <PlatformPageShell eyebrow="Original character universe" title="108 starting points. Infinite original people." description="Explore distinct worlds from stone-age mischief to deep-space family comedy, then design a character with their own silhouette, personality, movement rules, and story role." stat="108 original concepts" status="3 live · 105 concept blueprints">
    <section class="catalog-section section-pad">
      <div class="catalog-toolbar">
        <label class="catalog-search"><span>Search characters</span><input v-model="query" type="search" placeholder="Try detective, village, future…" /></label>
        <label><span>World</span><select v-model="worldFilter"><option value="all">All 12 worlds</option><option v-for="world in worlds" :key="world.id" :value="world.id">{{ world.name }}</option></select></label>
        <div class="catalog-count"><b>{{ filteredCharacters.length }}</b><span>matching originals</span></div>
      </div>

      <div class="world-strip" aria-label="Original story worlds">
        <button v-for="world in worlds" :key="world.id" type="button" :class="{ active: worldFilter === world.id }" :style="{ '--world-color': world.color }" @click="worldFilter = world.id">
          <span>{{ world.mark }}</span><b>{{ world.name }}</b><small>{{ world.era }}</small>
        </button>
      </div>

      <div class="catalog-grid character-catalog-grid">
        <article v-for="character in shownCharacters" :key="character.id" class="catalog-card character-catalog-card" :style="{ '--card-color': character.color }">
          <div class="catalog-art"><span>{{ character.mark }}</span><i></i><b>{{ character.status }}</b></div>
          <div class="catalog-card-copy"><small>{{ character.era }} · {{ character.role }}</small><h2>{{ character.name }}</h2><p>{{ character.personality }}</p><div class="motion-rule"><b>Moves like</b>{{ character.movement }}</div><button type="button" @click="addToCast(character)">Add to story cast <span>→</span></button></div>
        </article>
      </div>
      <button v-if="visibleCount < filteredCharacters.length" class="load-more" type="button" @click="visibleCount += 18">Show 18 more characters</button>
    </section>

    <section class="builder-section section-pad">
      <div class="builder-heading"><p class="kicker">Custom character lab</p><h2>Design someone only your world could create.</h2><p>Build from storytelling principles—not from a protected character reference. Your saved draft stays on this device.</p></div>
      <div class="builder-grid">
        <div class="builder-form">
          <label><span>Character name</span><input v-model="builder.name" placeholder="Leave blank for an original suggestion" /></label>
          <div class="builder-two"><label><span>Story world</span><select v-model="builder.worldId"><option v-for="world in worlds" :key="world.id" :value="world.id">{{ world.name }}</option></select></label><label><span>Story role</span><select v-model="builder.archetypeId"><option v-for="item in archetypes" :key="item.id" :value="item.id">{{ item.name }}</option></select></label></div>
          <label><span>Personality</span><input v-model="builder.personality" /></label>
          <label><span>Original silhouette</span><textarea v-model="builder.silhouette" rows="2"></textarea></label>
          <label><span>Movement signature</span><textarea v-model="builder.movement" rows="2"></textarea></label>
          <label><span>Character brief for the future design model</span><textarea v-model="builder.prompt" rows="4" placeholder="Describe clothing materials, proportions, props, habits, relationships, and what makes this character emotionally memorable. Do not name an existing character."></textarea></label>
          <div class="builder-action"><label class="color-input"><span>Key color</span><input v-model="builder.palette" type="color" /></label><button type="button" @click="saveCharacter">Save character draft</button></div>
          <p v-if="savedMessage" class="save-message" role="status">{{ savedMessage }}</p>
        </div>
        <aside class="builder-preview" :style="{ '--preview-color': builder.palette }">
          <div class="custom-character"><span>{{ (builder.name || selectedWorld.prefix).slice(0, 2).toUpperCase() }}</span><i></i></div>
          <p>{{ selectedWorld.era }}</p><h3>{{ builder.name || `${selectedWorld.prefix}${selectedArchetype.suffix}` }}</h3><strong>{{ selectedArchetype.name }} · {{ selectedWorld.name }}</strong><small>{{ builder.personality }}</small>
          <div class="originality-check"><span>✓</span><div><b>Originality brief</b><small>Define silhouette, world role, movement, relationships, and props independently.</small></div></div>
        </aside>
      </div>
    </section>

    <div v-if="savedMessage" class="toast-message">{{ savedMessage }}</div>
  </PlatformPageShell>
</template>
