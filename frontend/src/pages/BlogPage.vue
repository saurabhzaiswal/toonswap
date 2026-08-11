<script setup>
import PlatformPageShell from '../components/PlatformPageShell.vue';
import { blogPosts } from '../data/platformCatalog';
</script>

<template>
  <PlatformPageShell eyebrow="Ideas for original storytellers" title="The ToonSwap field guide." description="Practical notes on original character design, culturally aware voice direction, scene-based animation, consent, safety, and sustainable AI production." accent="#ffc94a" stat="6 field notes" status="Educational content · not legal advice">
    <section class="blog-section section-pad">
      <article class="featured-post" :style="{ '--post-color': blogPosts[0].color }"><div><span>{{ blogPosts[0].category }}</span><h2>{{ blogPosts[0].title }}</h2><p>{{ blogPosts[0].excerpt }}</p><RouterLink :to="`/blog/${blogPosts[0].slug}`">Read the field note <b>→</b></RouterLink></div><div class="featured-illustration" aria-hidden="true"><span>ORIGINAL</span><i></i><b>IP</b></div></article>
      <div class="blog-grid"><article v-for="post in blogPosts.slice(1)" :key="post.slug" :style="{ '--post-color': post.color }"><div class="post-art"><span>{{ post.category.slice(0, 2).toUpperCase() }}</span><i></i></div><small>{{ post.category }} · {{ post.readTime }}</small><h2>{{ post.title }}</h2><p>{{ post.excerpt }}</p><RouterLink :to="`/blog/${post.slug}`">Read article <span>→</span></RouterLink></article></div>
    </section>
  </PlatformPageShell>
</template>
