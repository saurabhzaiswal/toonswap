<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppButton from './ui/AppButton.vue';

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

watch(() => route.fullPath, closeMenu);
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
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :class="{ active: route.path === link.to }"
          >{{ link.label }}</RouterLink
        >
      </nav>

      <div class="header-actions">
        <span class="original-pill"><span></span> Original IP only</span>
        <AppButton class="header-cta" to="/story-studio" variant="primary" size="sm"
          >Build a story</AppButton
        >
        <AppButton
          class="menu-button"
          variant="bare"
          icon-only
          :aria-expanded="menuOpen"
          aria-controls="mobile-site-navigation"
          aria-label="Toggle navigation"
          @click="menuOpen = !menuOpen"
        >
          <span></span><span></span>
        </AppButton>
      </div>
    </div>
    <Transition name="mobile-menu">
      <nav
        v-if="menuOpen"
        id="mobile-site-navigation"
        class="mobile-nav platform-mobile-nav"
        aria-label="Mobile navigation"
      >
        <RouterLink v-for="link in links" :key="link.to" :to="link.to" @click="closeMenu">{{
          link.label
        }}</RouterLink>
        <RouterLink to="/privacy" @click="closeMenu">Privacy & safety</RouterLink>
      </nav>
    </Transition>
  </header>
</template>

<style scoped lang="scss">
@use '../styles/tokens' as *;

.menu-button {
  display: none !important;
}

.menu-button span {
  width: 19px;
  height: 2px;
  margin: 0;
  border-radius: 999px;
  background: $ink;
  transition: transform 0.22s ease;
}

.menu-button span + span {
  margin-left: -19px;
  transform: translateY(6px);
}

.menu-button[aria-expanded='true'] span:first-child {
  transform: translateY(3px) rotate(45deg);
}

.menu-button[aria-expanded='true'] span + span {
  transform: translateY(3px) rotate(-45deg);
}

.mobile-nav {
  position: absolute;
  top: 100%;
  right: 14px;
  left: 14px;
  display: none;
  max-height: calc(100vh - 92px);
  padding: 10px 20px 20px;
  overflow-y: auto;
  border: 1px solid $line;
  border-top: 3px solid $coral;
  border-radius: 0 0 22px 22px;
  background: color-mix(in srgb, #{$canvas} 96%, transparent);
  box-shadow: $shadow-lift;
  backdrop-filter: blur(18px);
}

.mobile-nav a {
  min-height: 48px;
  display: flex;
  align-items: center;
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transform-origin: top center;
  transition:
    opacity 0.22s ease,
    transform 0.26s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-14px) scaleY(0.94);
}

@media (max-width: 1150px) {
  .site-header {
    position: fixed;
  }

  .menu-button {
    display: inline-flex !important;
  }

  .original-pill {
    display: none;
  }

  .mobile-nav {
    display: grid;
  }
}

@media (max-width: 600px) {
  .mobile-nav {
    right: 8px;
    left: 8px;
    padding-inline: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mobile-menu-enter-active,
  .mobile-menu-leave-active,
  .menu-button span {
    transition-duration: 0.01ms;
  }
}
</style>
