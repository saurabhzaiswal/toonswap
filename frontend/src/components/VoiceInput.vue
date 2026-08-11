<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import { useMemeStore } from '../stores/memeStore';
import AppButton from './ui/AppButton.vue';
import SecureMediaUploader from './ui/SecureMediaUploader.vue';
import UiSegmented from './ui/UiSegmented.vue';
import UiTextarea from './ui/UiTextarea.vue';

const store = useMemeStore();
const isRecording = ref(false);
const recordingError = ref('');
let mediaRecorder = null;
let activeStream = null;
let chunks = [];

const charactersLeft = computed(() => 200 - store.scriptText.length);

async function startRecording() {
  recordingError.value = '';
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    recordingError.value = 'Voice recording is not supported in this browser.';
    return;
  }
  try {
    activeStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(activeStream);
    chunks = [];
    mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
    mediaRecorder.onstop = () => {
      const type = mediaRecorder?.mimeType || 'audio/webm';
      const blob = new Blob(chunks, { type });
      store.setVoiceFile(new File([blob], 'toonswap-recording.webm', { type }));
      activeStream?.getTracks().forEach((track) => track.stop());
      activeStream = null;
    };
    mediaRecorder.start();
    isRecording.value = true;
  } catch {
    recordingError.value = 'Microphone access was not available. Check your browser permission.';
  }
}

function stopRecording() {
  mediaRecorder?.stop();
  isRecording.value = false;
}

onBeforeUnmount(() => activeStream?.getTracks().forEach((track) => track.stop()));
</script>

<template>
  <section class="form-block" aria-labelledby="voice-label">
    <div class="form-label-row">
      <div>
        <span class="step-number">3</span>
        <h3 id="voice-label">Give them a voice</h3>
      </div>
      <small>Type or record</small>
    </div>

    <UiSegmented
      v-model="store.inputMode"
      class="voice-mode-control"
      label="How do you want to add the voice?"
      :options="[
        { value: 'text', label: 'Type a line' },
        { value: 'voice', label: 'Record or upload' },
      ]"
    />

    <div v-if="store.inputMode === 'text'" class="script-field">
      <UiTextarea
        v-model="store.scriptText"
        label="What should they say?"
        :rows="4"
        :maxlength="200"
        placeholder="Type a short line in the language you naturally speak…"
        :hint="`${charactersLeft} characters left · You can tune the voice below`"
      />
    </div>

    <div v-else class="record-panel" :class="{ recording: isRecording, captured: store.voiceFile }">
      <span class="record-dot" aria-hidden="true"></span>
      <div>
        <b>{{
          isRecording
            ? 'Listening…'
            : store.voiceFile
              ? 'Voice clip ready'
              : 'Record up to 15 seconds'
        }}</b>
        <small>{{
          isRecording
            ? 'Say your line naturally'
            : store.voiceFile
              ? 'Record again whenever you like'
              : 'A quiet room sounds best'
        }}</small>
      </div>
      <AppButton
        variant="primary"
        size="sm"
        @click="isRecording ? stopRecording() : startRecording()"
        >{{ isRecording ? 'Stop' : store.voiceFile ? 'Redo' : 'Record' }}</AppButton
      >
    </div>
    <SecureMediaUploader
      v-if="store.inputMode === 'voice'"
      :model-value="store.voiceFile"
      kind="voice"
      title="Or drop a voice recording"
      note="MP3, M4A, WAV, or WebM · maximum 15 MB"
      :allowed-file-types="['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/x-m4a']"
      :max-size="15 * 1024 * 1024"
      @update:model-value="store.setVoiceFile"
      @error="recordingError = $event"
    />
    <p v-if="recordingError" class="field-error" role="alert">{{ recordingError }}</p>
  </section>
</template>
