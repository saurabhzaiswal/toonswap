<script setup>
import SiteHeader from './SiteHeader.vue';
import SiteFooter from './SiteFooter.vue';

defineProps({
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  accent: { type: String, default: '#ff624d' },
  stat: { type: String, default: '' },
  status: { type: String, default: 'Product prototype' },
});
</script>

<template>
  <div class="site-shell platform-shell" :style="{ '--page-accent': accent }">
    <SiteHeader />
    <main class="platform-main">
      <section class="platform-hero section-pad">
        <div>
          <p class="kicker">{{ eyebrow }}</p>
          <h1>{{ title }}</h1>
          <p>{{ description }}</p>
          <div class="platform-status"><span></span>{{ status }}</div>
        </div>
        <slot name="hero-media"><strong v-if="stat">{{ stat }}</strong></slot>
      </section>
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
