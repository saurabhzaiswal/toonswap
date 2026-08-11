<script setup>
import PlatformPageShell from '../components/PlatformPageShell.vue';
import AppButton from '../components/ui/AppButton.vue';
import { blogPosts } from '../data/platformCatalog';

const featuredPost = blogPosts[0];
</script>

<template>
  <PlatformPageShell
    eyebrow="Ideas for original storytellers"
    title="Big ideas, explained like a good story."
    description="Practical field notes about original characters, expressive voices, scene-based animation, consent, safety, and sustainable AI production."
    accent="#ffc94a"
    stat="6 illustrated guides"
    status="Educational content · not legal advice"
  >
    <section class="blog-section section-pad">
      <article class="featured-post" :style="{ '--post-color': featuredPost.color }">
        <div class="featured-copy">
          <span class="category-pill">Featured · {{ featuredPost.category }}</span>
          <h2>{{ featuredPost.title }}</h2>
          <p>{{ featuredPost.excerpt }}</p>
          <div class="featured-bottom">
            <div class="post-meta">
              <span>{{ featuredPost.readTime }}</span
              ><span>Original-IP playbook</span>
            </div>
            <AppButton :to="`/blog/${featuredPost.slug}`" variant="primary" size="sm" arrow
              >Read the field note</AppButton
            >
          </div>
        </div>
        <RouterLink
          class="featured-cover"
          :to="`/blog/${featuredPost.slug}`"
          :aria-label="`Read ${featuredPost.title}`"
        >
          <img
            :src="featuredPost.cover"
            :alt="`Original editorial illustration for ${featuredPost.title}`"
            width="1400"
            height="788"
            fetchpriority="high"
          />
        </RouterLink>
      </article>

      <div class="section-heading">
        <div>
          <span>ToonSwap field guide</span>
          <h2>Make something unmistakably yours.</h2>
        </div>
        <p>
          Clear, useful articles for first-time creators and experienced storytellers—without legal
          fog or production jargon.
        </p>
      </div>

      <div class="blog-grid">
        <article
          v-for="post in blogPosts.slice(1)"
          :key="post.slug"
          :style="{ '--post-color': post.color }"
        >
          <RouterLink
            class="post-cover"
            :to="`/blog/${post.slug}`"
            :aria-label="`Read ${post.title}`"
          >
            <img
              :src="post.cover"
              :alt="`Original editorial illustration for ${post.title}`"
              width="1400"
              height="788"
              loading="lazy"
            />
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
.blog-section {
  display: grid;
  gap: clamp(48px, 6vw, 78px);
  padding-top: clamp(44px, 5vw, 72px);
}
:deep(.platform-hero) {
  min-height: 340px;
  padding-top: 64px;
  padding-bottom: 54px;
}
:deep(.platform-hero h1) {
  font-size: clamp(2.75rem, 5vw, 4.6rem);
}
.featured-post {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(420px, 1.1fr);
  min-height: 440px;
  overflow: hidden;
  border: 1.5px solid $line;
  border-radius: 30px;
  background: $paper;
  box-shadow: $shadow-soft;
}
.featured-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 17px;
  padding: clamp(30px, 3.5vw, 48px);
}
.category-pill,
.post-cover span {
  display: inline-flex;
  padding: 8px 12px;
  border-radius: 999px;
  color: $ink;
  background: var(--post-color);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.featured-copy h2 {
  max-width: 20ch;
  margin: 0;
  font-size: clamp(2rem, 2.45vw, 2.75rem);
  line-height: 1.02;
  letter-spacing: -0.045em;
}
.featured-copy p {
  max-width: 58ch;
  margin: 0;
  color: $muted;
  font-size: 1rem;
  line-height: 1.62;
}
.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: $muted;
  font-size: 0.88rem;
  font-weight: 800;
}
.featured-bottom {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-top: 2px;
}
.post-meta span + span::before {
  content: '•';
  margin-right: 10px;
}
.featured-cover,
.post-cover {
  position: relative;
  display: block;
  overflow: hidden;
  background: var(--post-color);
}
.featured-cover img,
.post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.45s ease;
}
.featured-cover:hover img,
.post-cover:hover img {
  transform: scale(1.025);
}
.section-heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 470px);
  gap: 42px;
  align-items: end;
}
.section-heading span {
  color: $coral;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.section-heading h2 {
  max-width: 15ch;
  margin: 10px 0 0;
  font-size: clamp(2rem, 3.2vw, 3.35rem);
  line-height: 1;
  letter-spacing: -0.05em;
}
.section-heading p {
  margin: 0;
  color: $muted;
  font-size: 1.05rem;
  line-height: 1.75;
}
.blog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
}
.blog-grid article {
  display: grid;
  overflow: hidden;
  border: 1.5px solid $line;
  border-radius: 26px;
  background: $paper;
  box-shadow: 0 16px 42px color-mix(in srgb, #{$ink} 8%, transparent);
}
.post-cover {
  aspect-ratio: 16 / 9;
}
.post-cover span {
  position: absolute;
  left: 18px;
  bottom: 18px;
  border: 2px solid $ink;
}
.post-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  padding: clamp(24px, 3vw, 34px);
}
.post-copy small {
  color: $muted;
  font-weight: 800;
}
.post-copy h2 {
  max-width: 21ch;
  margin: 0;
  font-size: clamp(1.55rem, 2vw, 2.05rem);
  line-height: 1.08;
  letter-spacing: -0.035em;
}
.post-copy p {
  flex: 1;
  margin: 0;
  color: $muted;
  font-size: 1rem;
  line-height: 1.7;
}
@media (max-width: 980px) {
  :deep(.platform-hero) {
    min-height: 0;
  }
  .featured-post {
    grid-template-columns: 1fr;
  }
  .featured-cover {
    min-height: 0;
    aspect-ratio: 16 / 8;
    order: -1;
  }
  .blog-grid {
    grid-template-columns: 1fr;
  }
  .section-heading {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .featured-post {
    border-radius: 22px;
  }
  .featured-cover {
    min-height: 220px;
    aspect-ratio: 16 / 9;
  }
  .featured-copy {
    padding: 28px 22px 36px;
  }
  .post-copy {
    padding: 26px 22px 32px;
  }
}
@media (max-width: 420px) {
  .featured-cover {
    min-height: 190px;
  }
  .featured-copy,
  .post-copy {
    padding-inline: 18px;
  }
  .featured-bottom {
    align-items: stretch;
    flex-direction: column;
  }
  .featured-bottom :deep(.app-button) {
    width: 100%;
  }
}
</style>
