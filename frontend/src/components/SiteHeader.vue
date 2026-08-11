<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppButton from './ui/AppButton.vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { apiRoot } from '../lib/api';

const menuOpen = ref(false);
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const accountOpen = ref(false);

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
  accountOpen.value = false;
}

async function signOut() {
  await auth.logout().catch(() => null);
  closeMenu();
  router.push('/');
}

watch(() => route.fullPath, closeMenu);
</script>

<template>
  <header class="site-header">
    <div class="header-inner platform-header-inner">
      <RouterLink class="brand" to="/" aria-label="ToonSwap home" @click="closeMenu">
        <img class="brand-mark brand-mark-image" src="/favicon.svg" alt="" aria-hidden="true" />
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
        <template v-if="auth.signedIn">
          <div class="account-menu">
            <button
              class="account-trigger"
              type="button"
              :aria-expanded="accountOpen"
              @click="accountOpen = !accountOpen"
            >
              <img v-if="auth.user?.avatarUrl" :src="`${apiRoot}/users/me/avatar`" alt="" />
              <span v-else>{{
                (auth.user?.name || auth.user?.email || 'T').slice(0, 1).toUpperCase()
              }}</span>
              <b>{{ auth.user?.name?.split(' ')[0] || 'Account' }}</b
              ><i aria-hidden="true">⌄</i>
            </button>
            <div v-if="accountOpen" class="account-popover">
              <small>{{ auth.user?.email }}</small>
              <RouterLink to="/profile" @click="closeMenu">Profile & safety</RouterLink>
              <RouterLink v-if="auth.isAdmin" to="/admin" @click="closeMenu"
                >Admin dashboard</RouterLink
              >
              <button type="button" @click="signOut">Sign out</button>
            </div>
          </div>
          <AppButton class="header-cta" to="/story-studio" variant="primary" size="sm"
            >Build a story</AppButton
          >
        </template>
        <template v-else>
          <RouterLink class="login-link" to="/login">Sign in</RouterLink>
          <AppButton class="header-cta" to="/signup" variant="primary" size="sm"
            >Create account</AppButton
          >
        </template>
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
        <RouterLink v-if="!auth.signedIn" to="/login" @click="closeMenu">Sign in</RouterLink>
        <RouterLink v-if="!auth.signedIn" to="/signup" @click="closeMenu"
          >Create account</RouterLink
        >
        <RouterLink v-if="auth.signedIn" to="/profile" @click="closeMenu"
          >Profile & safety</RouterLink
        >
        <RouterLink v-if="auth.isAdmin" to="/admin" @click="closeMenu">Admin dashboard</RouterLink>
        <button v-if="auth.signedIn" type="button" @click="signOut">Sign out</button>
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
.brand-mark-image {
  object-fit: contain;
}
.login-link {
  color: $ink;
  font-size: 0.86rem;
  font-weight: 900;
  text-decoration: none;
  white-space: nowrap;
}
.account-menu {
  position: relative;
}
.account-trigger {
  min-height: 42px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 5px;
  border: 1.5px solid $line;
  border-radius: 13px;
  color: $ink;
  background: white;
  font: inherit;
  cursor: pointer;
}
.account-trigger img,
.account-trigger > span {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  object-fit: cover;
  background: $gold;
  font-weight: 900;
}
.account-trigger b {
  max-width: 95px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.account-trigger i {
  font-style: normal;
}
.account-popover {
  position: absolute;
  z-index: 20;
  top: calc(100% + 12px);
  right: 0;
  min-width: 220px;
  display: grid;
  padding: 10px;
  border: 1.5px solid $line;
  border-radius: 16px;
  background: white;
  box-shadow: $shadow-lift;
}
.account-popover::before {
  content: '';
  position: absolute;
  right: 22px;
  top: -7px;
  width: 12px;
  height: 12px;
  transform: rotate(45deg);
  border-left: 1.5px solid $line;
  border-top: 1.5px solid $line;
  background: white;
}
.account-popover small {
  padding: 9px 10px;
  overflow: hidden;
  color: $muted;
  text-overflow: ellipsis;
}
.account-popover a,
.account-popover button {
  min-height: 42px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border: 0;
  border-radius: 10px;
  color: $ink;
  background: transparent;
  font: inherit;
  font-weight: 800;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}
.account-popover a:hover,
.account-popover button:hover {
  background: $soft;
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
.mobile-nav button {
  min-height: 48px;
  padding: 0;
  border: 0;
  color: $ink;
  background: transparent;
  font: inherit;
  font-weight: 800;
  text-align: left;
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

  .account-menu,
  .login-link {
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
