<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
  siteKey: { type: String, required: true },
  action: { type: String, required: true },
});
const emit = defineEmits(['update:token', 'error', 'expired']);
const host = ref(null);
let widgetId;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-toonswap-turnstile]');
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.toonswapTurnstile = 'true';
    script.addEventListener('load', resolve, { once: true });
    script.addEventListener('error', reject, { once: true });
    document.head.appendChild(script);
  });
}

async function renderWidget() {
  if (!props.siteKey || !host.value) return;
  try {
    await loadTurnstile();
    await nextTick();
    if (widgetId !== undefined) window.turnstile.remove(widgetId);
    widgetId = window.turnstile.render(host.value, {
      sitekey: props.siteKey,
      action: props.action,
      theme: 'light',
      size: 'flexible',
      appearance: 'interaction-only',
      callback(token) {
        emit('update:token', token);
      },
      'expired-callback'() {
        emit('update:token', '');
        emit('expired');
      },
      'error-callback'(code) {
        emit('update:token', '');
        emit('error', code);
      },
    });
  } catch {
    emit('error', 'widget-load-failed');
  }
}

function reset() {
  emit('update:token', '');
  if (widgetId !== undefined && window.turnstile) window.turnstile.reset(widgetId);
}

watch(() => props.action, renderWidget);
onMounted(renderWidget);
onBeforeUnmount(() => {
  if (widgetId !== undefined && window.turnstile) window.turnstile.remove(widgetId);
});
defineExpose({ reset });
</script>

<template>
  <div ref="host" class="turnstile-host" aria-label="Security verification"></div>
</template>

<style scoped>
.turnstile-host {
  min-height: 65px;
  width: 100%;
  display: grid;
  place-items: center;
}
</style>
