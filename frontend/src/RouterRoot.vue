<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Analytics } from '@vercel/analytics/vue';
import { useProjectStore } from './stores/projectStore';
import { useAuthStore } from './stores/authStore';

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
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <Transition name="route-fade" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
  <Transition name="notice-pop">
    <div v-if="mediaNotice" class="media-notice" role="status">{{ mediaNotice }}</div>
  </Transition>
  <Analytics />
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
