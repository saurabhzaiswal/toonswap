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
      theme: 'auto',
      size: 'normal',
      appearance: 'execute',
      execution: 'execute',
      retry: 'auto',
      'refresh-expired': 'auto',
      'refresh-timeout': 'auto',
      language: 'auto',
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

async function execute() {
  emit('update:token', '');
  if (widgetId === undefined) await renderWidget();
  if (widgetId === undefined || !window.turnstile) {
    emit('error', 'widget-not-ready');
    return;
  }
  try {
    window.turnstile.execute(widgetId);
  } catch {
    emit('error', 'widget-execution-failed');
  }
}

watch(() => props.action, renderWidget);
onMounted(renderWidget);
onBeforeUnmount(() => {
  if (widgetId !== undefined && window.turnstile) window.turnstile.remove(widgetId);
});
defineExpose({ execute, reset });
</script>

<template>
  <div ref="host" class="turnstile-host" aria-hidden="true"></div>
</template>

<style scoped>
.turnstile-host {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
