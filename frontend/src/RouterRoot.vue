<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Analytics } from '@vercel/analytics/vue';
import { useProjectStore } from './stores/projectStore';
import { useAuthStore } from './stores/authStore';
import AppButton from './components/ui/AppButton.vue';

const projectStore = useProjectStore();
const auth = useAuthStore();
const mediaNotice = ref('');
let noticeTimer;

function clearExpiredSession() {
  auth.clearExpiredSession();
}

function isVisualAsset(target) {
  return (
    target instanceof Element &&
    Boolean(target.closest('img, video, canvas, [data-protected-media]'))
  );
}

function deterMediaSave(event) {
  if (auth.isAdmin || !isVisualAsset(event.target)) return;
  event.preventDefault();
  mediaNotice.value =
    'Artwork saving is limited in this preview. Private delivery and watermarks provide the real protection.';
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => (mediaNotice.value = ''), 3200);
}

watch(
  () => auth.isAdmin,
  (isAdmin) => document.body.classList.toggle('media-deterrents', !isAdmin),
  { immediate: true },
);

onMounted(() => {
  projectStore.hydrate();
  window.addEventListener('toonswap:session-expired', clearExpiredSession);
  document.addEventListener('contextmenu', deterMediaSave);
  document.addEventListener('dragstart', deterMediaSave);
});
onBeforeUnmount(() => {
  clearTimeout(noticeTimer);
  window.removeEventListener('toonswap:session-expired', clearExpiredSession);
  document.removeEventListener('contextmenu', deterMediaSave);
  document.removeEventListener('dragstart', deterMediaSave);
  document.body.classList.remove('media-deterrents');
});



//  temparay work 

const isProduction = import.meta.env.VITE_PRODUCTION === 'true'
const gatePassword = import.meta.env.VITE_GATE_PASSWORD || ''
const isUnlocked = ref(!isProduction)
const enteredPassword = ref('')
const errorMsg = ref('')

function checkPassword() {
  if (enteredPassword.value === gatePassword) {
    isUnlocked.value = true
    errorMsg.value = ''
    enteredPassword.value = ''
  } else {
    isUnlocked.value = false
    errorMsg.value = 'Wrong password, try again'
  }
}
</script>

<template>
   <!-- Production + locked -->
  <div
    v-if="isProduction && !isUnlocked"
    style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#f4efe8;
      padding:20px;
    "
  >
    <div
      style="
        background:#fff;
        padding:32px;
        border-radius:16px;
        box-shadow:0 2px 10px rgba(0,0,0,0.08);
        text-align:center;
        width:100%;
        max-width:320px;
      "
    >
      <RouterLink class="brand" to="/" aria-label="ToonSwap home" @click="closeMenu">
        <img class="brand-mark brand-mark-image" src="/favicon.svg" alt="" aria-hidden="true" />
        <span class="brand-name">Toon<span>Swap</span></span>
        <small>beta</small>
      </RouterLink>

      <p style="color:#5b5766;font-size:14px;margin-bottom:16px;" class="pt-2">
        Enter password to continue
      </p>

      <input
        v-model="enteredPassword"
        type="password"
        placeholder="Password"
        autocomplete="off"
        @keyup.enter="checkPassword"
        style="
          box-sizing:border-box;
          width:100%;
          padding:10px;
          border:1px solid #dddddd;
          border-radius:8px;
          margin-bottom:12px;
        "
        class="focus:outline-none"
      />
      <AppButton @click="checkPassword" class="header-cta w-full" variant="primary" size="sm"
            >Enter</AppButton
          >

      <p
        v-if="errorMsg"
        style="color:#e04444;font-size:13px;margin-top:10px;"
      >
        {{ errorMsg }}
      </p>
    </div>
  </div>

  <!-- Actual application -->
  <div v-else>

    <RouterView v-slot="{ Component, route }">
      <Transition name="route-fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
    <Transition name="notice-pop">
      <div v-if="mediaNotice" class="media-notice" role="status">{{ mediaNotice }}</div>
    </Transition>
    <Analytics />
  </div>
</template>

<style>
.media-deterrents img,
.media-deterrents video,
.media-deterrents canvas,
.media-deterrents [data-protected-media] {
  -webkit-user-select: none;
  user-select: none;
  -webkit-user-drag: none;
}
.media-notice {
  position: fixed;
  z-index: 10000;
  right: 18px;
  bottom: 18px;
  width: min(390px, calc(100vw - 28px));
  padding: 14px 17px;
  border: 1.5px solid var(--color-ink);
  border-radius: 15px;
  color: var(--color-ink);
  background: var(--color-secondary);
  box-shadow:
    0 6px 0 var(--color-ink),
    0 15px 34px rgba(24, 21, 29, 0.18);
  font-weight: 800;
  line-height: 1.45;
}
.notice-pop-enter-active,
.notice-pop-leave-active {
  transition: 0.2s ease;
}
.notice-pop-enter-from,
.notice-pop-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
@media (max-width: 520px) {
  .media-notice {
    right: 14px;
    bottom: 14px;
  }
}
</style>
