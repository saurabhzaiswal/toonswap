import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './App.vue';
import { applySeo, validBlogSlugs } from './seo';

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 90 };
    return { top: 0, behavior: 'smooth' };
  },
  routes: [
    { path: '/', name: 'home', component: HomePage },
    {
      path: '/characters',
      name: 'characters',
      component: () => import('./pages/CharactersPage.vue'),
    },
    { path: '/voices', name: 'voices', component: () => import('./pages/VoicesPage.vue') },
    {
      path: '/story-studio',
      name: 'story-studio',
      component: () => import('./pages/StoryStudioPage.vue'),
    },
    { path: '/roadmap', name: 'roadmap', component: () => import('./pages/RoadmapPage.vue') },
    { path: '/blog', name: 'blog', component: () => import('./pages/BlogPage.vue') },
    {
      path: '/blog/:slug',
      name: 'blog-post',
      component: () => import('./pages/BlogPostPage.vue'),
      beforeEnter: (to) => (validBlogSlugs.has(to.params.slug) ? true : { name: 'blog' }),
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('./pages/LegalPage.vue'),
      props: { documentKey: 'privacy' },
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('./pages/LegalPage.vue'),
      props: { documentKey: 'terms' },
    },
    {
      path: '/community-guidelines',
      name: 'community',
      component: () => import('./pages/LegalPage.vue'),
      props: { documentKey: 'community' },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

router.afterEach((to) => applySeo(to));

export default router;
