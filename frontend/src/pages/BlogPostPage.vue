<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import SiteHeader from '../components/SiteHeader.vue';
import SiteFooter from '../components/SiteFooter.vue';
import AppButton from '../components/ui/AppButton.vue';
import { blogPosts } from '../data/platformCatalog';

const route = useRoute();
const post = computed(
  () => blogPosts.find((item) => item.slug === route.params.slug) || blogPosts[0],
);
const relatedPosts = computed(() =>
  blogPosts.filter((item) => item.slug !== post.value.slug).slice(0, 2),
);
</script>

<template>
  <div class="site-shell article-shell" :style="{ '--article-color': post.color }">
    <SiteHeader />
    <main>
      <header class="article-hero section-pad">
        <div class="hero-copy">
          <AppButton to="/blog" variant="ghost"
            ><template #icon>←</template>All field notes</AppButton
          >
          <span class="category">{{ post.category }}</span>
          <h1>{{ post.title }}</h1>
          <p>{{ post.excerpt }}</p>
          <div class="meta">
            <span>{{ post.readTime }}</span
            ><span>ToonSwap editorial</span><span>Updated August 2026</span>
          </div>
        </div>
        <figure>
          <img
            :src="post.cover"
            :alt="`Original editorial illustration for ${post.title}`"
            width="1400"
            height="788"
            fetchpriority="high"
          />
        </figure>
      </header>

      <div class="article-layout section-pad">
        <article>
          <p class="standfirst">
            {{ post.brief }}
          </p>
          <section v-for="(section, index) in post.sections" :key="section[0]">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <div>
              <h2>{{ section[0] }}</h2>
              <p v-for="paragraph in section.slice(1)" :key="paragraph">{{ paragraph }}</p>
            </div>
          </section>
          <section class="article-checklist">
            <span>✓</span>
            <div>
              <h2>Practical checklist</h2>
              <ul>
                <li v-for="item in post.checklist" :key="item">{{ item }}</li>
              </ul>
            </div>
          </section>
          <div class="article-callout">
            <b>Keep this takeaway</b>
            <p>{{ post.takeaway }}</p>
          </div>
        </article>
        <aside>
          <span>Try it while the idea is fresh</span>
          <h2>Build your original world.</h2>
          <p>Design a cast, choose expressive voices, and plan every scene before rendering.</p>
          <AppButton to="/characters" variant="primary" arrow block>Open character lab</AppButton>
          <AppButton to="/story-studio" variant="outline" arrow block>Open Story Studio</AppButton>
        </aside>
      </div>

      <section class="related section-pad">
        <div>
          <span>Keep learning</span>
          <h2>Next field notes</h2>
        </div>
        <article v-for="item in relatedPosts" :key="item.slug">
          <img :src="item.cover" alt="" width="1400" height="788" loading="lazy" />
          <div>
            <small>{{ item.category }} · {{ item.readTime }}</small>
            <h3>{{ item.title }}</h3>
            <AppButton :to="`/blog/${item.slug}`" variant="outline" arrow>Read article</AppButton>
          </div>
        </article>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped lang="scss">
@use '../styles/tokens' as *;
.article-hero {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(440px, 1.1fr);
  gap: clamp(42px, 7vw, 100px);
  align-items: center;
  padding-top: clamp(54px, 8vw, 112px);
  padding-bottom: clamp(64px, 9vw, 130px);
  background: color-mix(in srgb, var(--article-color) 12%, #{$canvas});
}
.hero-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 22px;
}
.category {
  padding: 8px 12px;
  border: 2px solid $ink;
  border-radius: 999px;
  background: var(--article-color);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}
.hero-copy h1 {
  max-width: 15ch;
  margin: 0;
  font-size: clamp(2.65rem, 5.4vw, 6.5rem);
  line-height: 0.95;
  letter-spacing: -0.06em;
}
.hero-copy > p {
  max-width: 58ch;
  margin: 0;
  color: $muted;
  font-size: clamp(1.05rem, 1.5vw, 1.25rem);
  line-height: 1.7;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: $muted;
  font-size: 0.86rem;
  font-weight: 800;
}
.meta span + span::before {
  content: '•';
  margin-right: 10px;
}
.article-hero figure {
  aspect-ratio: 16 / 10;
  margin: 0;
  overflow: hidden;
  border: 2px solid $ink;
  border-radius: 30px;
  box-shadow: 13px 15px 0 $ink;
  transform: rotate(1deg);
}
.article-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.article-layout {
  display: grid;
  grid-template-columns: minmax(0, 760px) minmax(280px, 380px);
  gap: clamp(58px, 10vw, 150px);
  align-items: start;
  padding-top: clamp(74px, 9vw, 130px);
  padding-bottom: clamp(74px, 9vw, 130px);
}
.article-layout article {
  display: grid;
  gap: 52px;
}
.standfirst {
  margin: 0;
  padding-bottom: 42px;
  border-bottom: 1.5px solid $line;
  font-size: clamp(1.35rem, 2.1vw, 1.85rem);
  font-weight: 750;
  line-height: 1.55;
}
.article-layout article section {
  display: grid;
  grid-template-columns: 54px 1fr;
  gap: 22px;
}
.article-layout article section > span {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 14px;
  color: white;
  background: $ink;
  font-weight: 900;
}
.article-layout h2 {
  margin: 0 0 14px;
  font-size: clamp(1.65rem, 2.6vw, 2.5rem);
  line-height: 1.08;
  letter-spacing: -0.035em;
}
.article-layout article p {
  margin: 0;
  color: $muted;
  font-size: 1.08rem;
  line-height: 1.85;
}
.article-layout article section > div {
  display: grid;
  gap: 16px;
}
.article-layout article section > div > p + p {
  margin-top: 2px;
}
.article-checklist ul {
  display: grid;
  gap: 12px;
  margin: 0;
  padding-left: 22px;
}
.article-checklist li {
  color: $muted;
  font-size: 1.03rem;
  line-height: 1.65;
}
.article-callout {
  padding: 30px;
  border: 2px solid $ink;
  border-radius: 22px;
  background: color-mix(in srgb, var(--article-color) 20%, white);
  box-shadow: 8px 9px 0 $ink;
}
.article-callout b {
  display: block;
  margin-bottom: 10px;
  font-size: 1.1rem;
}
.article-layout aside {
  position: sticky;
  top: 110px;
  display: grid;
  gap: 18px;
  padding: 30px;
  border: 1.5px solid $line;
  border-radius: 24px;
  background: $paper;
  box-shadow: $shadow;
}
.article-layout aside > span,
.related > div span {
  color: $coral;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.article-layout aside p {
  margin: 0 0 8px;
  color: $muted;
  line-height: 1.7;
}
.related {
  display: grid;
  grid-template-columns: 0.7fr 1fr 1fr;
  gap: 28px;
  padding-top: clamp(70px, 8vw, 110px);
  padding-bottom: clamp(80px, 10vw, 140px);
  background: $soft;
}
.related > div h2 {
  margin: 10px 0;
  font-size: clamp(2rem, 3vw, 3.5rem);
}
.related article {
  overflow: hidden;
  border: 1.5px solid $line;
  border-radius: 22px;
  background: $paper;
}
.related img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
.related article div {
  display: grid;
  justify-items: start;
  gap: 16px;
  padding: 24px;
}
.related small {
  color: $muted;
  font-weight: 800;
}
.related h3 {
  margin: 0;
  font-size: 1.35rem;
  line-height: 1.2;
}
@media (max-width: 1050px) {
  .article-hero,
  .article-layout {
    grid-template-columns: 1fr;
  }
  .article-hero figure {
    order: -1;
  }
  .article-layout aside {
    position: static;
  }
  .related {
    grid-template-columns: 1fr 1fr;
  }
  .related > div {
    grid-column: 1 / -1;
  }
}
@media (max-width: 680px) {
  .article-hero figure {
    border-radius: 20px;
    box-shadow: 5px 6px 0 $ink;
    transform: none;
  }
  .article-layout {
    gap: 44px;
  }
  .article-layout article {
    gap: 42px;
  }
  .article-layout article section {
    grid-template-columns: 1fr;
  }
  .article-callout,
  .article-layout aside {
    padding: 22px;
  }
  .article-callout {
    box-shadow: 5px 6px 0 $ink;
  }
  .related {
    grid-template-columns: 1fr;
  }
  .related > div {
    grid-column: auto;
  }
}
</style>
