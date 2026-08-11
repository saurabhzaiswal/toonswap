<script setup>
import PlatformPageShell from '../components/PlatformPageShell.vue';
import AppButton from '../components/ui/AppButton.vue';
import { blogPosts } from '../data/platformCatalog';

const featuredPost = blogPosts[0];
</script>

<template>
  <PlatformPageShell eyebrow="Ideas for original storytellers" title="Big ideas, explained like a good story." description="Practical field notes about original characters, expressive voices, scene-based animation, consent, safety, and sustainable AI production." accent="#ffc94a" stat="6 illustrated guides" status="Educational content · not legal advice">
    <section class="blog-section section-pad">
      <article class="featured-post" :style="{ '--post-color': featuredPost.color }">
        <div class="featured-copy">
          <span class="category-pill">Featured · {{ featuredPost.category }}</span>
          <h2>{{ featuredPost.title }}</h2>
          <p>{{ featuredPost.excerpt }}</p>
          <div class="post-meta"><span>{{ featuredPost.readTime }}</span><span>Original-IP playbook</span></div>
          <AppButton :to="`/blog/${featuredPost.slug}`" variant="primary" arrow>Read the field note</AppButton>
        </div>
        <RouterLink class="featured-cover" :to="`/blog/${featuredPost.slug}`" :aria-label="`Read ${featuredPost.title}`">
          <img :src="featuredPost.cover" :alt="`Original editorial illustration for ${featuredPost.title}`" width="1400" height="788" fetchpriority="high" />
        </RouterLink>
      </article>

      <div class="section-heading">
        <div><span>ToonSwap field guide</span><h2>Make something unmistakably yours.</h2></div>
        <p>Clear, useful articles for first-time creators and experienced storytellers—without legal fog or production jargon.</p>
      </div>

      <div class="blog-grid">
        <article v-for="post in blogPosts.slice(1)" :key="post.slug" :style="{ '--post-color': post.color }">
          <RouterLink class="post-cover" :to="`/blog/${post.slug}`" :aria-label="`Read ${post.title}`">
            <img :src="post.cover" :alt="`Original editorial illustration for ${post.title}`" width="1400" height="788" loading="lazy" />
            <span>{{ post.category }}</span>
          </RouterLink>
          <div class="post-copy">
            <small>{{ post.readTime }} · ToonSwap editorial</small>
            <h2>{{ post.title }}</h2>
            <p>{{ post.excerpt }}</p>
            <AppButton :to="`/blog/${post.slug}`" variant="outline" arrow>Read article</AppButton>
          </div>
        </article>
      </div>
    </section>
  </PlatformPageShell>
</template>

<style scoped lang="scss">
@use '../styles/tokens' as *;
.blog-section { display: grid; gap: clamp(56px, 7vw, 100px); }
.featured-post { display: grid; grid-template-columns: minmax(0, .82fr) minmax(440px, 1.18fr); min-height: 540px; overflow: hidden; border: 1.5px solid $line; border-radius: 30px; background: $paper; box-shadow: $shadow-soft; }
.featured-copy { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 22px; padding: clamp(34px, 5vw, 76px); }
.category-pill, .post-cover span { display: inline-flex; padding: 8px 12px; border-radius: 999px; color: $ink; background: var(--post-color); font-size: .78rem; font-weight: 900; letter-spacing: .06em; text-transform: uppercase; }
.featured-copy h2 { max-width: 15ch; margin: 0; font-size: clamp(2.25rem, 4.3vw, 4.9rem); line-height: .98; letter-spacing: -.055em; }
.featured-copy p { max-width: 58ch; margin: 0; color: $muted; font-size: 1.1rem; line-height: 1.7; }
.post-meta { display: flex; flex-wrap: wrap; gap: 10px; color: $muted; font-size: .88rem; font-weight: 800; }.post-meta span + span::before { content: '•'; margin-right: 10px; }
.featured-cover, .post-cover { position: relative; display: block; overflow: hidden; background: var(--post-color); }
.featured-cover img, .post-cover img { width: 100%; height: 100%; object-fit: cover; transition: transform .45s ease; }.featured-cover:hover img, .post-cover:hover img { transform: scale(1.025); }
.section-heading { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 470px); gap: 42px; align-items: end; }.section-heading span { color: $coral; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; }.section-heading h2 { max-width: 15ch; margin: 10px 0 0; font-size: clamp(2.1rem, 4vw, 4.2rem); line-height: 1; letter-spacing: -.05em; }.section-heading p { margin: 0; color: $muted; font-size: 1.05rem; line-height: 1.75; }
.blog-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px; }.blog-grid article { display: grid; overflow: hidden; border: 1.5px solid $line; border-radius: 26px; background: $paper; box-shadow: 0 16px 42px color-mix(in srgb, #{$ink} 8%, transparent); }.post-cover { aspect-ratio: 16 / 9; }.post-cover span { position: absolute; left: 18px; bottom: 18px; border: 2px solid $ink; }.post-copy { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; padding: clamp(24px, 4vw, 42px); }.post-copy small { color: $muted; font-weight: 800; }.post-copy h2 { max-width: 21ch; margin: 0; font-size: clamp(1.65rem, 2.5vw, 2.55rem); line-height: 1.08; letter-spacing: -.035em; }.post-copy p { flex: 1; margin: 0; color: $muted; font-size: 1rem; line-height: 1.7; }
@media (max-width: 980px) { .featured-post { grid-template-columns: 1fr; }.featured-cover { min-height: 400px; order: -1; }.blog-grid { grid-template-columns: 1fr; }.section-heading { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .featured-post { border-radius: 22px; }.featured-cover { min-height: 260px; }.featured-copy { padding: 28px 22px 36px; }.post-copy { padding: 26px 22px 32px; } }
</style>
