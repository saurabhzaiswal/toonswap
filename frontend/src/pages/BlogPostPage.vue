<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import SiteHeader from '../components/SiteHeader.vue';
import SiteFooter from '../components/SiteFooter.vue';
import { blogPosts } from '../data/platformCatalog';

const route = useRoute();
const post = computed(() => blogPosts.find((item) => item.slug === route.params.slug) || blogPosts[0]);
</script>

<template>
  <div class="site-shell article-shell" :style="{ '--article-color': post.color }">
    <SiteHeader />
    <main class="article-main section-pad">
      <RouterLink class="article-back" to="/blog">← All field notes</RouterLink>
      <header><span>{{ post.category }}</span><h1>{{ post.title }}</h1><p>{{ post.excerpt }}</p><small>{{ post.readTime }} · ToonSwap editorial · Updated August 2026</small></header>
      <div class="article-layout"><article><section v-for="section in post.sections" :key="section[0]"><h2>{{ section[0] }}</h2><p>{{ section[1] }}</p></section><div class="article-callout"><b>ToonSwap’s non-negotiable rule</b><p>Broad genres, eras, and human experiences are creative starting points. Protected character designs, franchise lore, recognisable voices, names, costumes, symbols, and “almost the same” substitutes are not.</p></div></article><aside><b>Build your original world</b><p>Use these principles in the character lab, then plan every scene in Story Studio.</p><RouterLink to="/characters">Open character lab →</RouterLink><RouterLink to="/story-studio">Open Story Studio →</RouterLink></aside></div>
    </main>
    <SiteFooter />
  </div>
</template>
