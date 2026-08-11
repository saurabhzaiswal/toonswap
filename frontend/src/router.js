import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './App.vue';

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 90 };
    return { top: 0, behavior: 'smooth' };
  },
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/characters', name: 'characters', component: () => import('./pages/CharactersPage.vue') },
    { path: '/voices', name: 'voices', component: () => import('./pages/VoicesPage.vue') },
    { path: '/story-studio', name: 'story-studio', component: () => import('./pages/StoryStudioPage.vue') },
    { path: '/roadmap', name: 'roadmap', component: () => import('./pages/RoadmapPage.vue') },
    { path: '/blog', name: 'blog', component: () => import('./pages/BlogPage.vue') },
    { path: '/blog/:slug', name: 'blog-post', component: () => import('./pages/BlogPostPage.vue') },
    { path: '/privacy', name: 'privacy', component: () => import('./pages/LegalPage.vue'), props: { documentKey: 'privacy' } },
    { path: '/terms', name: 'terms', component: () => import('./pages/LegalPage.vue'), props: { documentKey: 'terms' } },
    { path: '/community-guidelines', name: 'community', component: () => import('./pages/LegalPage.vue'), props: { documentKey: 'community' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

router.afterEach((to) => {
  const titles = {
    home: 'ToonSwap: AI Cartoon Video Maker with Regional Voices',
    characters: 'Original Character Library & Character Designer | ToonSwap',
    voices: 'Global Comedy Voice & Language Library | ToonSwap',
    'story-studio': 'Multi-Character Story Studio | ToonSwap',
    roadmap: 'How ToonSwap Works & Product Roadmap | ToonSwap',
    blog: 'ToonSwap Blog — Original Animation, Voice & Story Craft',
    'blog-post': 'ToonSwap Blog',
    privacy: 'Privacy Policy | ToonSwap',
    terms: 'Terms of Use | ToonSwap',
    community: 'Community Guidelines | ToonSwap',
  };
  const descriptions = {
    home: 'Create original AI cartoon videos with editable scenes, custom characters, consent-first voices, and a worldwide language roadmap.',
    characters: 'Explore 24 illustrated ToonSwap originals, 216 scalable character blueprints, and a custom original character designer.',
    voices: 'Direct original cartoon performances by feeling, region, and language with consent-first voice controls and a 200+ language roadmap.',
    'story-studio': 'Plan a 15-second to 60-minute original cartoon in six simple steps with editable cast, voice, scenes, dialogue, movement, and camera.',
    roadmap: 'See ToonSwap’s six-step cartoon workflow, replaceable production layers, safety gates, backend milestones, and worldwide language roadmap.',
    blog: 'Practical guides for original character design, multilingual voice direction, scene planning, consent, and responsible AI animation.',
  };
  const title = titles[to.name] || titles.home;
  const description = descriptions[to.name] || descriptions.home;
  const canonicalUrl = `https://toonswap.vercel.app${to.path === '/' ? '/' : to.path}`;
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl);
});

export default router;
