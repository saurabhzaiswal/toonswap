import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './App.vue';
import { applySeo, validBlogSlugs } from './seo';
import { useAuthStore } from './stores/authStore';
import { pinia } from './pinia';

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 90 };
    return { top: 0, behavior: 'smooth' };
  },
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/app', redirect: { name: 'story-studio' } },
    {
      path: '/app/characters',
      name: 'characters',
      component: () => import('./pages/CharactersPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/app/voices',
      name: 'voices',
      component: () => import('./pages/VoicesPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/app/story-studio',
      name: 'story-studio',
      component: () => import('./pages/StoryStudioPage.vue'),
      meta: { requiresAuth: true, requiresProfile: true },
    },
    { path: '/roadmap', name: 'roadmap', component: () => import('./pages/RoadmapPage.vue') },
    // Founder page is intentionally disabled until it is ready for public launch.
    // { path: '/about', name: 'about', component: () => import('./pages/AboutPage.vue') },
    { path: '/blog', name: 'blog', component: () => import('./pages/BlogPage.vue') },
    {
      path: '/blog/:slug',
      name: 'blog-post',
      component: () => import('./pages/BlogPostPage.vue'),
      beforeEnter: (to) => (validBlogSlugs.has(to.params.slug) ? true : { name: 'blog' }),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('./pages/AuthPage.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('./pages/AuthPage.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/app/profile',
      name: 'profile',
      component: () => import('./pages/ProfilePage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/app/admin',
      name: 'admin',
      component: () => import('./pages/AdminDashboardPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
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
    { path: '/characters', redirect: { name: 'characters' } },
    { path: '/voices', redirect: { name: 'voices' } },
    { path: '/story-studio', redirect: { name: 'story-studio' } },
    { path: '/profile', redirect: { name: 'profile' } },
    { path: '/admin', redirect: { name: 'admin' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore(pinia);
  await auth.bootstrap();
  if (to.meta.requiresAuth && !auth.signedIn)
    return { name: 'login', query: { redirect: to.fullPath } };
  if (to.meta.requiresAdmin && !auth.isAdmin) return { name: 'story-studio' };
  if (to.meta.requiresProfile && auth.needsProfile)
    return { name: 'profile', query: { redirect: to.fullPath } };
  if (to.meta.guestOnly && auth.signedIn)
    return auth.needsProfile ? { name: 'profile' } : { name: 'story-studio' };
  return true;
});

router.afterEach((to) => applySeo(to));

export default router;
