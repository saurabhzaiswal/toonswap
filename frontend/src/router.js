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
    blog: 'ToonSwap Blog — Original Animation, Voice & Story Craft',
    'blog-post': 'ToonSwap Blog',
    privacy: 'Privacy Policy | ToonSwap',
    terms: 'Terms of Use | ToonSwap',
    community: 'Community Guidelines | ToonSwap',
  };
  document.title = titles[to.name] || titles.home;
});

export default router;
