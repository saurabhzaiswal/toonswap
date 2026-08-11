<script setup>
import { computed, ref } from 'vue';
import AppButton from './ui/AppButton.vue';
import UiRange from './ui/UiRange.vue';
import UiSegmented from './ui/UiSegmented.vue';
import UiSelect from './ui/UiSelect.vue';

const props = defineProps({
  scene: { type: Object, required: true },
  index: { type: Number, required: true },
  count: { type: Number, required: true },
});
const emit = defineEmits(['change', 'move', 'regenerate-line']);
const panel = ref('audio');
const maxTrim = computed(() => Math.max(0, Number(props.scene.duration || 1) - 1));
const usableDuration = computed(() =>
  Math.max(
    1,
    Number(props.scene.duration || 1) -
      Number(props.scene.trimStart || 0) -
      Number(props.scene.trimEnd || 0),
  ),
);
const musicOptions = [
  { value: 'None', label: 'No background music', description: 'Dialogue and natural sound only' },
  {
    value: 'Morning Mischief',
    label: 'Morning Mischief',
    description: 'Original light marimba and hand percussion',
  },
  {
    value: 'Village Lanterns',
    label: 'Village Lanterns',
    description: 'Original warm flute and gentle strings',
  },
  { value: 'Neon Rickshaw', label: 'Neon Rickshaw', description: 'Original playful future groove' },
  {
    value: 'Moonlit Footsteps',
    label: 'Moonlit Footsteps',
    description: 'Original soft mystery pulse',
  },
];
const transitionOptions = [
  { value: 'Cut', label: 'Clean cut', description: 'Fast and direct' },
  { value: 'Fade', label: 'Soft fade', description: 'Gentle passage of time' },
  { value: 'Dip to color', label: 'Dip to story color', description: 'A short branded transition' },
];
</script>

<template>
  <section class="media-lab">
    <header>
      <div>
        <small>Creator mode · edit without rebuilding</small>
        <h3>Scene media lab</h3>
        <p>
          These settings become renderer instructions. They do not trigger paid generation until
          final approval.
        </p>
      </div>
      <UiSegmented
        v-model="panel"
        label="Customize"
        :options="[
          { value: 'audio', label: 'Audio mix' },
          { value: 'video', label: 'Video cut' },
        ]"
      />
    </header>

    <div v-if="panel === 'audio'" class="control-grid">
      <div class="control-card">
        <span class="control-number">A</span>
        <h4>Character voice</h4>
        <UiRange
          v-model="scene.voiceVolume"
          label="Voice volume"
          :min="0"
          :max="150"
          suffix="%"
          @change="emit('change')"
        /><UiRange
          v-model="scene.voiceSpeed"
          label="Voice speed"
          :min="0.75"
          :max="1.25"
          :step="0.05"
          suffix="×"
          @change="emit('change')"
        /><UiRange
          v-model="scene.voicePitch"
          label="Voice pitch"
          :min="-4"
          :max="4"
          suffix=" st"
          @change="emit('change')"
        /><AppButton
          variant="secondary"
          size="sm"
          :disabled="!scene.dialogue"
          @click="emit('regenerate-line')"
          >Regenerate this line only · v{{ scene.audioRevision || 1 }}</AppButton
        >
      </div>
      <div class="control-card">
        <span class="control-number">B</span>
        <h4>Original music bed</h4>
        <UiSelect
          v-model="scene.musicTrack"
          label="Royalty-safe ToonSwap track"
          :options="musicOptions"
          @change="emit('change')"
        /><UiRange
          v-model="scene.musicVolume"
          label="Music volume"
          :min="0"
          :max="100"
          suffix="%"
          @change="emit('change')"
        />
        <p class="safe-note">
          Only ToonSwap-owned or commercially licensed tracks belong here - no copied songs or
          user-uploaded copyrighted music.
        </p>
      </div>
    </div>

    <div v-else class="video-panel">
      <div class="preview-rail">
        <div class="rail-frame">
          <span>Scene {{ index + 1 }}</span
          ><b>{{ scene.title }}</b
          ><small>{{ usableDuration }}s usable after trim</small>
        </div>
        <UiRange
          v-model="scene.previewPosition"
          label="Preview scrubber"
          :min="0"
          :max="Number(scene.duration || 1)"
          suffix="s"
          @change="emit('change')"
        />
      </div>
      <div class="control-grid">
        <div class="control-card">
          <span class="control-number">C</span>
          <h4>Trim the scene</h4>
          <UiRange
            v-model="scene.trimStart"
            label="Trim from start"
            :min="0"
            :max="maxTrim"
            suffix="s"
            @change="emit('change')"
          /><UiRange
            v-model="scene.trimEnd"
            label="Trim from end"
            :min="0"
            :max="maxTrim"
            suffix="s"
            @change="emit('change')"
          />
        </div>
        <div class="control-card">
          <span class="control-number">D</span>
          <h4>Order and transition</h4>
          <UiSelect
            v-model="scene.transition"
            label="Transition after this scene"
            :options="transitionOptions"
            @change="emit('change')"
          />
          <div class="move-actions">
            <AppButton variant="outline" size="sm" :disabled="index === 0" @click="emit('move', -1)"
              >← Move earlier</AppButton
            ><AppButton
              variant="outline"
              size="sm"
              :disabled="index === count - 1"
              @click="emit('move', 1)"
              >Move later →</AppButton
            >
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '../styles/tokens' as *;
.media-lab {
  display: grid;
  gap: 20px;
  padding: clamp(20px, 3vw, 28px);
  border: 1.5px solid color-mix(in srgb, #{$violet} 42%, #{$line});
  border-radius: 20px;
  background: color-mix(in srgb, #{$violet} 6%, white);
}
.media-lab > header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  gap: 22px;
  align-items: end;
}
.media-lab header small {
  color: $violet;
  font-weight: 900;
  text-transform: uppercase;
}
.media-lab h3 {
  margin: 5px 0;
  font-size: 1.55rem;
}
.media-lab header p {
  max-width: 620px;
  margin: 0;
  color: $muted;
  line-height: 1.5;
}
.control-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.control-card {
  display: grid;
  align-content: start;
  gap: 19px;
  min-width: 0;
  padding: 20px;
  border: 1px solid $line;
  border-radius: 16px;
  background: $paper;
}
.control-card h4 {
  margin: -34px 0 3px 42px;
  font-size: 1.08rem;
}
.control-number {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 9px;
  color: white;
  background: $violet;
  font-weight: 900;
}
.safe-note {
  margin: 0;
  padding: 12px;
  border-radius: 12px;
  color: #65551f;
  background: #fff3c7;
  font-size: 0.8rem;
  line-height: 1.45;
}
.video-panel {
  display: grid;
  gap: 14px;
}
.preview-rail {
  display: grid;
  grid-template-columns: minmax(240px, 0.7fr) 1.3fr;
  gap: 20px;
  align-items: center;
  padding: 18px;
  border-radius: 16px;
  color: white;
  background: $ink;
}
.rail-frame {
  display: grid;
  gap: 3px;
}
.rail-frame span {
  color: $gold;
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
}
.rail-frame b {
  font-size: 1.12rem;
}
.rail-frame small {
  color: #cfc9d6;
}
.move-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
@media (max-width: 850px) {
  .media-lab > header,
  .control-grid,
  .preview-rail {
    grid-template-columns: 1fr;
  }
}
</style>
