<script setup>
import { ref } from 'vue';
import { useMemeStore } from '../stores/memeStore';

const store = useMemeStore();
const isDragging = ref(false);
const fileInput = ref(null);
const fileError = ref('');
const maxFileBytes = 15 * 1024 * 1024;

function handleFiles(fileList) {
  const file = fileList?.[0];
  if (!file) return;
  fileError.value = '';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    fileError.value = 'Choose a JPG, PNG, or WEBP image.';
    return;
  }
  if (file.size > maxFileBytes) {
    fileError.value = 'That image is larger than 15 MB.';
    return;
  }
  store.setSelfie(file);
}

function onDrop(event) {
  isDragging.value = false;
  handleFiles(event.dataTransfer.files);
}

function onFileInputChange(event) {
  handleFiles(event.target.files);
}

function openFileDialog() {
  fileInput.value?.click();
}
</script>

<template>
  <section class="form-block" aria-labelledby="selfie-label">
    <div class="form-label-row">
      <div><span class="step-number">2</span><h3 id="selfie-label">Add a clear selfie</h3></div>
      <small>JPG, PNG or WEBP</small>
    </div>
    <div
      class="upload-zone"
      :class="{ dragging: isDragging, filled: store.selfiePreviewUrl }"
      role="button"
      tabindex="0"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      @click="openFileDialog"
      @keydown.enter.prevent="openFileDialog"
      @keydown.space.prevent="openFileDialog"
    >
      <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" @change="onFileInputChange" />
      <img v-if="store.selfiePreviewUrl" :src="store.selfiePreviewUrl" alt="Selected selfie preview" />
      <div v-if="store.selfiePreviewUrl" class="upload-replace"><b>Photo ready</b><span>Click to replace</span></div>
      <div v-else class="upload-empty">
        <span class="upload-icon" aria-hidden="true"><i></i></span>
        <div><b>Drop your selfie here</b><span>or click to browse · front-facing works best</span></div>
        <small>MAX 15 MB</small>
      </div>
    </div>
    <p v-if="fileError" class="field-error" role="alert">{{ fileError }}</p>
    <p class="privacy-line"><span aria-hidden="true">●</span> Use your own photo or one you have permission to use.</p>
  </section>
</template>
