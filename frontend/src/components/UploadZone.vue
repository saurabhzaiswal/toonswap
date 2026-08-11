<script setup>
import { ref } from 'vue';
import { useMemeStore } from '../stores/memeStore';
import SecureMediaUploader from './ui/SecureMediaUploader.vue';

const store = useMemeStore();
const fileError = ref('');
function selectSelfie(file) {
  fileError.value = '';
  store.setSelfie(file);
}
</script>

<template>
  <section class="form-block" aria-labelledby="selfie-label">
    <div class="form-label-row">
      <div>
        <span class="step-number">2</span>
        <h3 id="selfie-label">Add a clear selfie</h3>
      </div>
      <small>UPPY · JPG, PNG OR WEBP</small>
    </div>
    <SecureMediaUploader
      :model-value="store.selfieFile"
      kind="photo"
      title="Drop or choose your selfie"
      note="Front-facing works best · maximum 15 MB"
      :allowed-file-types="['image/jpeg', 'image/png', 'image/webp']"
      :max-size="15 * 1024 * 1024"
      :preview-url="store.selfiePreviewUrl"
      @update:model-value="selectSelfie"
      @error="fileError = $event"
    />
    <p v-if="fileError" class="field-error" role="alert">{{ fileError }}</p>
    <p class="privacy-line">
      <span aria-hidden="true">●</span> Use your own photo or one you have permission to use. Upload
      begins only when you create.
    </p>
  </section>
</template>
