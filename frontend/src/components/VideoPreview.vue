<script setup>
import { useMemeStore } from '../stores/memeStore';

const store = useMemeStore();

const loadingLines = {
  PENDING: ['Waiting for the spotlight', 'Your toon is next in the studio queue.'],
  PROCESSING: ['Bringing your toon to life', 'Matching the motion, voice, and punchline.'],
  uploading: ['Sending your ingredients', 'Keeping your files safe on the way.'],
};
</script>

<template>
  <section v-if="store.status !== 'idle'" class="result-panel" aria-live="polite">
    <div v-if="store.isProcessing" class="result-loading">
      <div class="loading-orbit" aria-hidden="true"><span>T</span></div>
      <div><h3>{{ (loadingLines[store.status] || ['Making magic'])[0] }}</h3><p>{{ (loadingLines[store.status] || ['', 'This can take a moment.'])[1] }}</p></div>
      <span class="loading-dots" aria-hidden="true"><i></i><i></i><i></i></span>
    </div>

    <div v-else-if="store.status === 'DONE'" class="result-ready">
      <div><p class="kicker">Ready to make someone smile</p><h3>Your toon has arrived.</h3></div>
      <video :src="store.outputUrl" controls autoplay loop playsinline />
      <div class="result-actions"><a :href="store.outputUrl" download class="generate-button">Download preview <span>↓</span></a><button type="button" @click="store.reset()">Make another</button></div>
    </div>

    <div v-else-if="store.status === 'FAILED'" class="result-error">
      <span aria-hidden="true">!</span><div><h3>That take did not land.</h3><p>{{ store.errorMessage }}</p></div><button type="button" @click="store.reset()">Try again</button>
    </div>
  </section>
</template>
