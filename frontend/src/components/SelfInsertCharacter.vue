<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import { useProjectStore } from '../stores/projectStore';
import AppButton from './ui/AppButton.vue';
import UiCheckbox from './ui/UiCheckbox.vue';
import UiInput from './ui/UiInput.vue';
import UiSelect from './ui/UiSelect.vue';

const store = useProjectStore();
const photoInput = ref(null);
const audioInput = ref(null);
const recording = ref(false);
const saving = ref(false);
const error = ref('');
let recorder;
let stream;
let chunks = [];

const voiceModeOptions = [
  { value: 'as-is', label: 'Keep my real recorded voice', description: 'Use the performance as recorded across this character’s scenes' },
  { value: 'convert', label: 'Convert my performance safely', description: 'Keep timing and emotion, apply an original fictional voice style' },
];
const voiceStyleOptions = [
  { value: 'warm-story', label: 'Warm storyteller', description: 'Gentle, close, reassuring' },
  { value: 'comic-spark', label: 'Comic spark', description: 'Quick, bright, playful' },
  { value: 'brave-adventure', label: 'Brave adventure', description: 'Clear, sincere, energetic' },
  { value: 'mystery-soft', label: 'Mystery soft', description: 'Textured, quiet, suspenseful' },
];
const canAdd = computed(() => Boolean((store.selfInsert.photoFile || store.selfInsert.voiceFile) && store.selfInsert.consentIdentity && store.selfInsert.consentRetention));

function choosePhoto(event) {
  error.value = '';
  const file = event.target.files?.[0];
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) { error.value = 'Choose a JPG, PNG, or WebP selfie under 10 MB.'; return; }
  store.setSelfInsertPhoto(file);
}
function chooseAudio(event) {
  error.value = '';
  const file = event.target.files?.[0];
  if (!file) return;
  if (!['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/x-m4a'].includes(file.type) || file.size > 15 * 1024 * 1024) { error.value = 'Choose MP3, M4A, WAV, or WebM audio under 15 MB.'; return; }
  store.setSelfInsertVoice(file);
}
async function toggleRecording() {
  error.value = '';
  if (recording.value) {
    recorder?.stop();
    recording.value = false;
    return;
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream);
    chunks = [];
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = () => {
      const type = recorder.mimeType || 'audio/webm';
      store.setSelfInsertVoice(new File([new Blob(chunks, { type })], 'my-character-voice.webm', { type }));
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;
    };
    recorder.start();
    recording.value = true;
  } catch { error.value = 'Microphone permission was not available. Upload an audio file or continue with photo only.'; }
}
async function addToCast() {
  const character = store.addSelfInsertToCast();
  if (!character) { error.value = 'Add a photo or voice and confirm both consent choices first.'; return; }
  saving.value = true;
  const result = await store.uploadSelfInsertReference();
  saving.value = false;
  if (result.error) error.value = result.error;
}
onBeforeUnmount(() => { if (recorder?.state === 'recording') recorder.stop(); stream?.getTracks().forEach((track) => track.stop()); });
</script>

<template>
  <section class="self-insert-shell">
    <header><div><span>Third cast option · consent-first</span><h2>Put yourself in the whole cartoon.</h2><p>Add your photo, your voice, or both. ToonSwap creates one reusable character reference for the story so your look and voice do not randomly change between scenes.</p></div><span class="private-pill">Sensitive media · local draft</span></header>

    <div class="self-insert-grid">
      <section class="identity-panel">
        <div class="panel-heading"><span>01</span><div><h3>Your cartoon look</h3><p>Use one clear, front-facing photo.</p></div></div>
        <AppButton class="photo-drop" variant="bare" @click="photoInput?.click()">
          <img v-if="store.selfInsert.photoPreviewUrl" :src="store.selfInsert.photoPreviewUrl" alt="Preview of your selected selfie" />
          <span v-else aria-hidden="true">＋</span><div><b>{{ store.selfInsert.photoFile ? 'Change my selfie' : 'Choose my selfie' }}</b><small>JPG, PNG, or WebP · maximum 10 MB</small></div>
        </AppButton>
        <input ref="photoInput" class="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" @change="choosePhoto" />
        <UiInput v-model="store.selfInsert.displayName" label="Character name in this story" placeholder="Me, Mum, Dadaji…" />
      </section>

      <section class="identity-panel">
        <div class="panel-heading"><span>02</span><div><h3>Your character voice</h3><p>Use the recording as-is or convert it into an original style.</p></div></div>
        <div class="voice-actions"><AppButton :variant="recording ? 'secondary' : 'primary'" @click="toggleRecording"><template #icon>{{ recording ? '■' : '●' }}</template>{{ recording ? 'Stop recording' : 'Record my voice' }}</AppButton><AppButton variant="outline" @click="audioInput?.click()">Upload audio</AppButton></div>
        <input ref="audioInput" class="visually-hidden" type="file" accept="audio/mpeg,audio/mp4,audio/wav,audio/webm,audio/x-m4a" @change="chooseAudio" />
        <p class="voice-file" :class="{ ready: store.selfInsert.voiceFile }"><span>{{ recording ? '●' : store.selfInsert.voiceFile ? '✓' : '○' }}</span>{{ recording ? 'Recording your performance…' : store.selfInsert.voiceFile ? `${store.selfInsert.voiceName} is ready in this tab` : 'No voice recording added yet' }}</p>
        <UiSelect v-model="store.selfInsert.voiceMode" label="How should this character sound?" :options="voiceModeOptions" />
        <UiSelect v-if="store.selfInsert.voiceMode === 'convert'" v-model="store.selfInsert.voiceStyle" label="Original voice style" :options="voiceStyleOptions" />
      </section>
    </div>

    <section class="consent-card">
      <div><span>03</span><div><h3>Permission before processing</h3><p>The current UI keeps selected files only in this open tab. Production upload and reusable face/voice generation remain blocked until secure storage, moderation, automatic deletion, and provider credentials are configured.</p></div></div>
      <UiCheckbox v-model="store.selfInsert.consentIdentity" label="This is my own photo/voice, or the person gave me explicit permission." hint="Do not upload a celebrity, public figure, stranger, or child without verified guardian permission." />
      <UiCheckbox v-model="store.selfInsert.consentRetention" label="I understand the planned 24-hour source-media retention and can delete this draft now." hint="Generated references need a separate deletion control before public launch." />
      <div class="consent-actions"><AppButton variant="primary" arrow :disabled="!canAdd || saving" @click="addToCast">{{ saving ? 'Preparing secure reference…' : 'Add me to the whole story' }}</AppButton><AppButton v-if="store.selfInsert.photoFile || store.selfInsert.voiceFile" variant="ghost" @click="store.clearSelfInsert">Delete this local draft</AppButton></div>
      <p v-if="store.selfInsert.status === 'ready-for-consented-upload'" class="success" role="status">✓ Added to your cast. Secure provider upload is not configured, so files remain only in this tab.</p>
      <p v-else-if="['draft', 'queued', 'processing', 'ready'].includes(store.selfInsert.status)" class="success" role="status">✓ Reusable story-character record: {{ store.selfInsert.status }}. The same approved reference will be used across scenes.</p>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
    </section>
  </section>
</template>

<style scoped lang="scss">
@use '../styles/tokens' as *;
.self-insert-shell { margin-top: 36px; padding: clamp(24px, 4vw, 44px); border: 2px solid $ink; border-radius: $radius-lg; background: color-mix(in srgb, #{$violet} 7%, #{$paper}); box-shadow: 9px 10px 0 $ink; }.self-insert-shell > header { display: flex; justify-content: space-between; gap: 28px; margin-bottom: 28px; }.self-insert-shell header > div > span { color: $violet; font-size: .76rem; font-weight: 900; letter-spacing: .07em; text-transform: uppercase; }.self-insert-shell h2 { margin: 7px 0 9px; font-size: clamp(1.9rem, 3vw, 3.2rem); letter-spacing: -.045em; }.self-insert-shell header p { max-width: 760px; margin: 0; color: $muted; line-height: 1.6; }.private-pill { align-self: start; flex: 0 0 auto; padding: 9px 12px; border-radius: 999px; color: #075f54; background: var(--color-secondary-soft); font-size: .75rem; font-weight: 900; }.self-insert-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }.identity-panel { display: grid; align-content: start; gap: 20px; padding: 24px; border: 1.5px solid $line; border-radius: $radius-md; background: $paper; }.panel-heading, .consent-card > div:first-child { display: flex; gap: 13px; }.panel-heading > span, .consent-card > div:first-child > span { display: grid; flex: 0 0 38px; width: 38px; height: 38px; place-items: center; border-radius: 12px; color: white; background: $ink; font-weight: 900; }.panel-heading h3, .consent-card h3 { margin: 0; font-size: 1.25rem; }.panel-heading p, .consent-card p { margin: 4px 0 0; color: $muted; line-height: 1.5; }.photo-drop { display: grid; grid-template-columns: 100px 1fr; gap: 18px; align-items: center; min-height: 124px; padding: 14px; text-align: left; border: 2px dashed color-mix(in srgb, #{$violet} 52%, #{$line}); border-radius: 18px; color: $ink; background: color-mix(in srgb, #{$violet} 5%, white); cursor: pointer; transition: .16s ease; }.photo-drop:hover { border-style: solid; transform: translateY(-2px); }.photo-drop:active { transform: translateY(2px) scale(.995); }.photo-drop > img, .photo-drop > span { width: 96px; height: 96px; object-fit: cover; border: 2px solid $ink; border-radius: 16px; }.photo-drop > span { display: grid; place-items: center; background: $gold; font-size: 2rem; }.photo-drop div { display: grid; gap: 6px; }.photo-drop b { font-size: 1.05rem; }.photo-drop small { color: $muted; line-height: 1.45; }.voice-actions { display: flex; flex-wrap: wrap; gap: 12px; }.voice-file { display: flex; align-items: center; gap: 9px; margin: 0 !important; padding: 12px; border-radius: 12px; background: $soft; font-size: .85rem; font-weight: 800; }.voice-file.ready { color: #075f54; background: var(--color-secondary-soft); }.consent-card { display: grid; gap: 18px; margin-top: 18px; padding: 24px; border: 1.5px solid $line; border-radius: $radius-md; background: white; }.consent-actions { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; }.success, .error { margin: 0 !important; padding: 12px 14px; border-radius: 12px; font-weight: 800; }.success { color: #075f54 !important; background: var(--color-secondary-soft); }.error { color: var(--color-danger) !important; background: #fff0ed; }@media (max-width: 900px) { .self-insert-grid { grid-template-columns: 1fr; }.self-insert-shell > header { display: grid; }.private-pill { justify-self: start; } }@media (max-width: 560px) { .self-insert-shell { padding: 19px; box-shadow: 6px 7px 0 $ink; }.identity-panel, .consent-card { padding: 18px; }.photo-drop { grid-template-columns: 72px 1fr; }.photo-drop > img, .photo-drop > span { width: 70px; height: 70px; } }
</style>
