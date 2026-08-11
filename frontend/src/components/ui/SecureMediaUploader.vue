<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';
import Uppy from '@uppy/core';
import { Dropzone, UppyContextProvider } from '@uppy/vue';
import { nextUiId } from './id';

const props = defineProps({
  modelValue: { type: Object, default: null },
  kind: { type: String, required: true },
  title: { type: String, required: true },
  note: { type: String, default: '' },
  allowedFileTypes: { type: Array, required: true },
  maxSize: { type: Number, required: true },
  previewUrl: { type: String, default: '' },
  disabled: Boolean,
});
const emit = defineEmits(['update:modelValue', 'error']);
const progress = ref(0);
const controlId = nextUiId(`uppy-${props.kind}`);
const uppy = new Uppy({
  id: controlId,
  autoProceed: false,
  restrictions: {
    maxNumberOfFiles: 1,
    maxFileSize: props.maxSize,
    allowedFileTypes: props.allowedFileTypes,
  },
});

uppy.on('file-added', (file) => {
  const existing = uppy.getFiles().filter((item) => item.id !== file.id);
  existing.forEach((item) => uppy.removeFile(item.id));
  progress.value = 0;
  emit('update:modelValue', file.data);
});
uppy.on('restriction-failed', (_file, error) => emit('error', error.message));
uppy.on('upload-progress', (_file, data) => {
  progress.value = data.bytesTotal ? Math.round((data.bytesUploaded / data.bytesTotal) * 100) : 0;
});

watch(
  () => props.modelValue,
  (file) => {
    if (!file && uppy.getFiles().length) uppy.cancelAll();
  },
);
onBeforeUnmount(() => uppy.destroy());
</script>

<template>
  <div class="media-uploader" :class="{ disabled }">
    <UppyContextProvider :uppy="uppy">
      <Dropzone width="100%" height="148px" :note="note" :no-click="disabled" />
    </UppyContextProvider>
    <div class="upload-overlay" aria-hidden="true">
      <img v-if="kind === 'photo' && previewUrl" :src="previewUrl" alt="" />
      <span v-else class="upload-glyph">{{ kind === 'photo' ? '↥' : '♪' }}</span>
      <span
        ><b>{{ modelValue ? modelValue.name : title }}</b
        ><small>{{
          modelValue ? 'Ready locally · upload starts only after consent' : note
        }}</small></span
      >
    </div>
    <div v-if="progress" class="upload-progress">
      <i :style="{ width: `${progress}%` }"></i><span>{{ progress }}%</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/tokens' as *;
.media-uploader {
  position: relative;
  min-width: 0;
  border-radius: 18px;
}
.media-uploader.disabled {
  opacity: 0.55;
}
:deep([data-uppy-element='dropzone'] > div) {
  min-height: 148px;
  padding: 18px !important;
  border: 2px dashed color-mix(in srgb, #{$violet} 55%, #{$line}) !important;
  border-radius: 18px !important;
  background: color-mix(in srgb, #{$violet} 5%, white) !important;
  cursor: pointer;
}
:deep([data-uppy-element='dropzone'] > input) {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  overflow: hidden !important;
  clip: rect(0 0 0 0) !important;
  white-space: nowrap !important;
}
:deep([data-uppy-element='dropzone'] > div > div) {
  display: grid;
  height: 100%;
  place-items: center;
}
:deep([data-uppy-element='dropzone'] > div:hover),
:deep([data-uppy-element='dropzone'] > div:focus-visible) {
  border-style: solid !important;
  border-color: $violet !important;
  background: color-mix(in srgb, #{$violet} 9%, white) !important;
  outline: 3px solid color-mix(in srgb, #{$violet} 18%, transparent);
  outline-offset: 3px;
}
:deep([data-uppy-element='dropzone'] p),
:deep([data-uppy-element='dropzone'] > div > div:last-child) {
  opacity: 0;
}
.upload-overlay {
  pointer-events: none;
  position: absolute;
  inset: 16px;
  display: grid;
  grid-template-columns: 78px 1fr;
  gap: 16px;
  align-items: center;
}
.upload-overlay > img,
.upload-glyph {
  width: 78px;
  height: 78px;
  border: 2px solid $ink;
  border-radius: 16px;
  background: $gold;
  object-fit: cover;
}
.upload-glyph {
  display: grid;
  place-items: center;
  font-size: 1.85rem;
  font-weight: 900;
}
.upload-overlay > span:last-child {
  display: grid;
  gap: 6px;
  min-width: 0;
}
.upload-overlay b {
  overflow: hidden;
  font-size: 1rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.upload-overlay small {
  color: $muted;
  font-size: 0.78rem;
  line-height: 1.4;
}
.upload-progress {
  position: absolute;
  right: 14px;
  bottom: 12px;
  left: 14px;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: white;
  box-shadow: inset 0 0 0 1px $line;
}
.upload-progress i {
  display: block;
  height: 100%;
  background: $mint;
  transition: width 0.15s ease;
}
.upload-progress span {
  position: absolute;
  right: 0;
  bottom: 11px;
  font-size: 0.7rem;
  font-weight: 900;
}
@media (max-width: 520px) {
  .upload-overlay {
    grid-template-columns: 58px 1fr;
  }
  .upload-overlay > img,
  .upload-glyph {
    width: 58px;
    height: 58px;
  }
}
</style>
