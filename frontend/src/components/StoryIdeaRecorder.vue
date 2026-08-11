<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import { useProjectStore } from '../stores/projectStore';
import AppButton from './ui/AppButton.vue';
import UiCheckbox from './ui/UiCheckbox.vue';

const store = useProjectStore();
const consent = ref(false);
const recording = ref(false);
const message = ref('');
const liveTranscript = ref('');
let recorder;
let stream;
let recognition;
let chunks = [];

const speechRecognitionAvailable = computed(() =>
  Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
);

async function start() {
  if (!consent.value || recording.value) return;
  message.value = '';
  liveTranscript.value = '';
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream);
    chunks = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    recorder.onstop = () => {
      const type = recorder.mimeType || 'audio/webm';
      const file = new File([new Blob(chunks, { type })], 'toonswap-story-idea.webm', { type });
      store.setStoryIdeaAudio(file);
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;
    };
    recorder.start();

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (Recognition) {
      recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = store.project.language === 'Hindi' ? 'hi-IN' : 'en-IN';
      recognition.onresult = (event) => {
        let finalText = '';
        let interimText = '';
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          if (event.results[index].isFinal) finalText += event.results[index][0].transcript;
          else interimText += event.results[index][0].transcript;
        }
        liveTranscript.value = interimText;
        if (finalText.trim())
          store.updateProject({
            prompt: `${store.project.prompt.trim()} ${finalText.trim()}`.trim(),
          });
      };
      recognition.onerror = () => {
        message.value =
          'Live transcription paused. Your recording is still attached for secure backend transcription.';
      };
      recognition.start();
    } else {
      message.value =
        'This browser cannot transcribe live. Record your idea and it will be attached for the future secure AI planner.';
    }
    recording.value = true;
  } catch {
    message.value = 'Microphone permission was not available. You can still type the story below.';
  }
}

function stop() {
  recognition?.stop();
  recognition = null;
  if (recorder?.state === 'recording') recorder.stop();
  recording.value = false;
  message.value = speechRecognitionAvailable.value
    ? 'Your spoken idea was added to the story prompt. Review it before creating scenes.'
    : 'Recording attached locally. Backend AI transcription remains a production integration.';
}

onBeforeUnmount(() => {
  recognition?.stop();
  if (recorder?.state === 'recording') recorder.stop();
  stream?.getTracks().forEach((track) => track.stop());
});
</script>

<template>
  <section class="idea-recorder" :class="{ recording }">
    <div class="recorder-icon" aria-hidden="true">
      <i></i><span v-for="bar in 5" :key="bar"></span>
    </div>
    <div class="recorder-copy">
      <small>Speak instead of typing</small>
      <h3>Tell ToonSwap your whole story idea.</h3>
      <p>
        Speak naturally in your chosen language. Supported browsers add a live transcript to the
        prompt; the audio stays in this tab for the future moderated story-planner upload.
      </p>
      <UiCheckbox
        v-model="consent"
        label="This is my voice, or I have clear permission to use it."
      />
    </div>
    <div class="recorder-action">
      <AppButton
        :variant="recording ? 'secondary' : 'primary'"
        :disabled="!consent"
        @click="recording ? stop() : start()"
        ><template #icon>{{ recording ? '■' : '●' }}</template
        >{{ recording ? 'Stop and add idea' : 'Speak my story' }}</AppButton
      ><span v-if="recording">Listening… {{ liveTranscript }}</span
      ><span v-else-if="store.storyIdeaAudio.file">✓ Voice idea attached in this tab</span>
    </div>
    <p v-if="message" class="recorder-message" role="status">{{ message }}</p>
  </section>
</template>

<style scoped lang="scss">
@use '../styles/tokens' as *;
.idea-recorder {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  gap: 22px;
  align-items: center;
  margin-bottom: 22px;
  padding: 24px;
  border: 1.5px solid $line;
  border-radius: $radius-md;
  background: color-mix(in srgb, #{$mint} 12%, #{$paper});
}
.recorder-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  width: 64px;
  height: 64px;
  border: 2px solid $ink;
  border-radius: 20px;
  background: $mint;
  box-shadow: 4px 5px 0 $ink;
}
.recorder-icon i {
  position: absolute;
  width: 17px;
  height: 25px;
  border: 2px solid $ink;
  border-radius: 12px;
}
.recorder-icon span {
  width: 3px;
  height: 7px;
  border-radius: 4px;
  background: $ink;
}
.recorder-icon span:nth-of-type(2),
.recorder-icon span:nth-of-type(4) {
  height: 16px;
}
.recorder-icon span:nth-of-type(3) {
  height: 28px;
}
.recording .recorder-icon span {
  animation: voice-pulse 0.48s ease-in-out infinite alternate;
}
.recorder-copy small {
  color: #087f70;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.recorder-copy h3 {
  margin: 5px 0 7px;
  font-size: 1.28rem;
}
.recorder-copy p {
  margin: 0 0 12px;
  color: $muted;
  line-height: 1.55;
}
.recorder-action {
  display: grid;
  justify-items: end;
  gap: 12px;
  max-width: 260px;
}
.recorder-action > span {
  color: $muted;
  font-size: 0.8rem;
  line-height: 1.45;
}
.recorder-message {
  grid-column: 2 / -1;
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  color: $ink;
  background: white;
  font-size: 0.86rem;
  line-height: 1.5;
}
@keyframes voice-pulse {
  to {
    transform: scaleY(0.42);
  }
}
@media (max-width: 850px) {
  .idea-recorder {
    grid-template-columns: 58px 1fr;
  }
  .recorder-action,
  .recorder-message {
    grid-column: 1 / -1;
    justify-items: stretch;
    max-width: none;
  }
  .recorder-icon {
    width: 54px;
    height: 54px;
  }
}
</style>
