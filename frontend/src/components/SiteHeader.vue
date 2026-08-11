<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const menuOpen = ref(false);
const route = useRoute();

const links = [
  { label: 'Create', to: '/#studio' },
  { label: 'Characters', to: '/characters' },
  { label: 'Voices', to: '/voices' },
  { label: 'Story Studio', to: '/story-studio' },
  { label: 'Roadmap', to: '/roadmap' },
  { label: 'Blog', to: '/blog' },
];

function closeMenu() {
  menuOpen.value = false;
}
</script>

<template>
  <header class="site-header">
    <div class="header-inner platform-header-inner">
      <RouterLink class="brand" to="/" aria-label="ToonSwap home" @click="closeMenu">
        <span class="brand-mark" aria-hidden="true"><i></i><i></i><b></b></span>
        <span class="brand-name">Toon<span>Swap</span></span>
        <small>beta</small>
      </RouterLink>

      <nav class="desktop-nav platform-nav" aria-label="Main navigation">
        <RouterLink v-for="link in links" :key="link.to" :to="link.to" :class="{ active: route.path === link.to }">{{ link.label }}</RouterLink>
      </nav>

      <div class="header-actions">
        <span class="original-pill"><span></span> Original IP only</span>
        <RouterLink class="small-cta" to="/story-studio">Build a story</RouterLink>
        <button class="menu-button" type="button" :aria-expanded="menuOpen" aria-label="Toggle navigation" @click="menuOpen = !menuOpen">
          <span></span><span></span>
        </button>
      </div>
    </div>
    <nav v-if="menuOpen" class="mobile-nav platform-mobile-nav" aria-label="Mobile navigation">
      <RouterLink v-for="link in links" :key="link.to" :to="link.to" @click="closeMenu">{{ link.label }}</RouterLink>
      <RouterLink to="/privacy" @click="closeMenu">Privacy & safety</RouterLink>
    </nav>
  </header>
</template>
