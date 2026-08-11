<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import { useMemeStore } from '../stores/memeStore';
import AppButton from './ui/AppButton.vue';

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
      <div><span class="step-number">3</span><h3 id="voice-label">Give them a voice</h3></div>
      <small>Type or record</small>
    </div>

    <div class="mode-switch" aria-label="Choose voice input mode">
      <AppButton variant="bare" :class="{ active: store.inputMode === 'text' }" @click="store.inputMode = 'text'">Type a line</AppButton>
      <AppButton variant="bare" :class="{ active: store.inputMode === 'voice' }" @click="store.inputMode = 'voice'">Record my voice</AppButton>
    </div>

    <div v-if="store.inputMode === 'text'" class="script-field">
      <textarea v-model="store.scriptText" rows="4" maxlength="200" placeholder="Type something that will make your people laugh…" aria-label="Cartoon script"></textarea>
      <span>{{ charactersLeft }} characters left</span>
    </div>

    <div v-else class="record-panel" :class="{ recording: isRecording, captured: store.voiceFile }">
      <span class="record-dot" aria-hidden="true"></span>
      <div>
        <b>{{ isRecording ? 'Listening…' : store.voiceFile ? 'Voice clip ready' : 'Record up to 15 seconds' }}</b>
        <small>{{ isRecording ? 'Say your line naturally' : store.voiceFile ? 'Record again whenever you like' : 'A quiet room sounds best' }}</small>
      </div>
      <AppButton variant="bare" @click="isRecording ? stopRecording() : startRecording()">{{ isRecording ? 'Stop' : store.voiceFile ? 'Redo' : 'Record' }}</AppButton>
    </div>
    <p v-if="recordingError" class="field-error" role="alert">{{ recordingError }}</p>
  </section>
</template>
