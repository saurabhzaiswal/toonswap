<script setup>
import { useMemeStore } from '../stores/memeStore';
import AppButton from './ui/AppButton.vue';

const store = useMemeStore();

const characters = [
  { id: 'chulbul-the-naughty-kid', name: 'Chulbul', tagline: 'Mischief captain', mark: 'C', tone: 'coral' },
  { id: 'robo-guru', name: 'Robo Guru', tagline: 'Gadget philosopher', mark: 'R', tone: 'violet' },
  { id: 'ninja-chotu', name: 'Ninja Chotu', tagline: 'Tiny thunder', mark: 'N', tone: 'teal' },
];
</script>

<template>
  <section class="form-block" aria-labelledby="character-label">
    <div class="form-label-row">
      <div><span class="step-number">1</span><h3 id="character-label">Choose your character</h3></div>
      <small>3 originals</small>
    </div>
    <div class="character-options">
      <AppButton
        v-for="character in characters"
        :key="character.id"
        variant="bare"
        class="character-option"
        :class="[`option-${character.tone}`, { selected: store.selectedCharacter === character.id }]"
        :aria-pressed="store.selectedCharacter === character.id"
        @click="store.selectCharacter(character.id)"
      >
        <span class="option-art" aria-hidden="true"><b>{{ character.mark }}</b><i></i></span>
        <span class="option-copy"><strong>{{ character.name }}</strong><small>{{ character.tagline }}</small></span>
        <span class="option-check" aria-hidden="true">✓</span>
      </AppButton>
    </div>
  </section>
</template>
