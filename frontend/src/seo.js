import { blogPosts } from './data/platformCatalog.js';

const SITE_URL = 'https://toonswap-kappa.vercel.app';
const DEFAULT_IMAGE = `${SITE_URL}/og-social.jpg`;
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const FOUNDER_ID = `${SITE_URL}/#founder`;
const UPDATED_AT = '2026-08-11';

const pageSeo = {
  home: {
    title: 'AI Cartoon Video Maker | ToonSwap',
    description:
      'Create original AI cartoon videos with custom characters, editable scenes, consent-first voices, and multilingual story planning from 15 seconds to 60 minutes.',
    type: 'WebPage',
  },
  characters: {
    title: 'Original Cartoon Character Maker | ToonSwap',
    description:
      'Explore 24 illustrated originals, 216 structured character blueprints, movement styles, story worlds, and a custom original cartoon character designer.',
    type: 'CollectionPage',
  },
  voices: {
    title: 'Cartoon Voice Library & Languages | ToonSwap',
    description:
      'Choose original visual voice personas by feeling, rhythm, region, and language, or use your own consented voice with clear expression controls.',
    type: 'CollectionPage',
  },
  'story-studio': {
    title: 'AI Cartoon Story Studio & Scene Editor | ToonSwap',
    description:
      'Plan a complete original cartoon in six guided steps with cast, worlds, dialogue, voices, movement, camera, continuity, and scene-level regeneration.',
    type: 'WebPage',
  },
  roadmap: {
    title: 'AI Cartoon Video Workflow & Roadmap | ToonSwap',
    description:
      'See the guided cartoon workflow, editable production layers, safety gates, backend milestones, and worldwide language roadmap behind ToonSwap.',
    type: 'WebPage',
  },
  blog: {
    title: 'AI Cartoon Creation Guides | ToonSwap Blog',
    description:
      'Practical guides for original character design, multilingual comedy direction, scene planning, consent-first media, and responsible AI animation.',
    type: 'CollectionPage',
  },
  privacy: {
    title: 'Privacy Policy | Face, Voice & Media Safety at ToonSwap',
    description:
      'Read how ToonSwap plans to handle selfies, voice recordings, story data, private media, consent, retention, deletion, processors, and children’s safety.',
    type: 'WebPage',
  },
  terms: {
    title: 'Terms of Use | ToonSwap Original AI Cartoon Creator',
    description:
      'Review ToonSwap rules for eligibility, media permissions, original characters, prohibited use, AI-assisted outputs, availability, and enforcement.',
    type: 'WebPage',
  },
  community: {
    title: 'Community Guidelines | ToonSwap Creator Safety',
    description:
      'Create joyful original stories while respecting real people, children, cultures, music, voices, copyrighted work, and community safety.',
    type: 'WebPage',
  },
  login: {
    title: 'Sign In | ToonSwap Creator Account',
    description:
      'Sign in to your protected ToonSwap creator workspace with a passwordless email code or configured Google sign-in.',
    type: 'WebPage',
  },
  signup: {
    title: 'Create a ToonSwap Creator Account',
    description:
      'Create a protected ToonSwap account for original characters, consented media, voices, and cartoon story projects.',
    type: 'WebPage',
  },
  profile: {
    title: 'Your Creator Profile & Settings | ToonSwap',
    description: 'Manage your private ToonSwap profile and account safety settings.',
    type: 'WebPage',
  },
  admin: {
    title: 'ToonSwap Admin Dashboard & User Controls',
    description: 'Role-protected ToonSwap administration.',
    type: 'WebPage',
  },
};

function absoluteUrl(path = '/') {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  return element;
}

function setMetaName(name, content) {
  upsertMeta(`meta[name="${name}"]`, { name, content });
}

function setMetaProperty(property, content) {
  upsertMeta(`meta[property="${property}"]`, { property, content });
}

function setCanonical(url) {
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;
}

function setAlternateLanguage(language, url) {
  let alternate = document.head.querySelector(`link[rel="alternate"][hreflang="${language}"]`);
  if (!alternate) {
    alternate = document.createElement('link');
    alternate.rel = 'alternate';
    alternate.hreflang = language;
    document.head.appendChild(alternate);
  }
  alternate.href = url;
}

function getBlogPost(route) {
  if (route.name !== 'blog-post') return null;
  return blogPosts.find((post) => post.slug === route.params.slug) || null;
}

function getPageDetails(route) {
  const post = getBlogPost(route);
  if (post) {
    return {
      title: post.seoTitle,
      description: post.excerpt,
      type: 'BlogPosting',
      image: absoluteUrl(post.cover),
      imageWidth: '1400',
      imageHeight: '788',
      imageAlt: `${post.title} - original ToonSwap editorial illustration`,
      post,
    };
  }

  return {
    ...(pageSeo[route.name] || pageSeo.home),
    image: DEFAULT_IMAGE,
    imageWidth: '1200',
    imageHeight: '630',
    imageAlt: 'Three original ToonSwap characters with the message Your face. Their world.',
    post: null,
  };
}

function breadcrumbItems(route, details, canonicalUrl) {
  const items = [{ name: 'Home', item: `${SITE_URL}/` }];
  if (route.name === 'home') return items;
  if (route.name === 'blog-post') {
    items.push({ name: 'Blog', item: `${SITE_URL}/blog` });
    items.push({ name: details.post.title, item: canonicalUrl });
    return items;
  }

  const names = {
    characters: 'Characters',
    voices: 'Voices',
    'story-studio': 'Story Studio',
    roadmap: 'Roadmap',
    blog: 'Blog',
    privacy: 'Privacy Policy',
    terms: 'Terms of Use',
    community: 'Community Guidelines',
  };
  items.push({ name: names[route.name] || details.title, item: canonicalUrl });
  return items;
}

function sharedGraph() {
  return [
    {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: 'ToonSwap',
      url: `${SITE_URL}/`,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo-512.png`,
        width: 1024,
        height: 1024,
      },
      image: DEFAULT_IMAGE,
      description:
        'ToonSwap is an original-character AI cartoon creation studio with consent-first voice and media controls.',
      founder: { '@id': FOUNDER_ID },
      foundingDate: '2026',
    },
    {
      '@type': 'Person',
      '@id': FOUNDER_ID,
      name: 'Saurabh Choudhary',
      givenName: 'Saurabh',
      familyName: 'Choudhary',
      jobTitle: 'Creator and Full Stack Engineer',
      url: 'https://saurabhzaiswal.vercel.app/',
      sameAs: [
        'https://saurabhzaiswal.vercel.app/',
        'https://www.linkedin.com/in/saurabh-choudhary-7ab207239/',
        'https://github.com/saurabhzaiswal',
        'https://dev.to/saurabhzaiswal',
        'https://x.com/saurabhzaiswal',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: `${SITE_URL}/`,
      name: 'ToonSwap',
      alternateName: 'ToonSwap AI Cartoon Video Maker',
      inLanguage: 'en-IN',
      creator: { '@id': FOUNDER_ID },
      publisher: { '@id': ORGANIZATION_ID },
    },
  ];
}

function routeGraph(route, details, canonicalUrl) {
  const pageId = `${canonicalUrl}#webpage`;
  const breadcrumbs = breadcrumbItems(route, details, canonicalUrl);
  const graph = [
    ...sharedGraph(),
    {
      '@type': details.type === 'BlogPosting' ? 'WebPage' : details.type,
      '@id': pageId,
      url: canonicalUrl,
      name: details.title,
      description: details.description,
      inLanguage: 'en-IN',
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': ORGANIZATION_ID },
      author: { '@id': FOUNDER_ID },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: details.image,
        width: Number(details.imageWidth),
        height: Number(details.imageHeight),
      },
      breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.item,
      })),
    },
  ];

  if (route.name === 'home') {
    graph.push({
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#software`,
      name: 'ToonSwap',
      url: `${SITE_URL}/`,
      applicationCategory: 'MultimediaApplication',
      applicationSubCategory: 'AI cartoon video maker',
      operatingSystem: 'Web browser, Android, iOS',
      isAccessibleForFree: true,
      image: DEFAULT_IMAGE,
      creator: { '@id': FOUNDER_ID },
      publisher: { '@id': ORGANIZATION_ID },
      featureList: [
        'Original cartoon character library and custom character briefs',
        'Multi-character scene-by-scene story planning',
        'Consent-first selfie and voice inputs',
        'Editable dialogue, movement, camera, audio, captions, and continuity',
        '15-second to 60-minute project planning',
        'Worldwide language and regional voice roadmap',
      ],
    });
  }

  if (route.name === 'characters') {
    graph.push({
      '@type': 'ItemList',
      '@id': `${canonicalUrl}#character-library`,
      name: 'ToonSwap original character library',
      numberOfItems: 216,
      itemListOrder: 'https://schema.org/ItemListUnordered',
    });
  }

  if (route.name === 'voices') {
    graph.push({
      '@type': 'ItemList',
      '@id': `${canonicalUrl}#voice-library`,
      name: 'ToonSwap original voice direction library',
      numberOfItems: 220,
      itemListOrder: 'https://schema.org/ItemListUnordered',
    });
  }

  if (route.name === 'roadmap') {
    graph.push({
      '@type': 'HowTo',
      '@id': `${canonicalUrl}#workflow`,
      name: 'How to plan an original cartoon video with ToonSwap',
      description: details.description,
      step: ['Idea', 'World', 'Cast', 'Voice', 'Scenes', 'Ready'].map((name, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name,
        url: `${SITE_URL}/app/story-studio#step-${index + 1}`,
      })),
    });
  }

  if (route.name === 'blog') {
    graph.push({
      '@type': 'Blog',
      '@id': `${canonicalUrl}#blog`,
      name: 'ToonSwap Blog',
      url: canonicalUrl,
      publisher: { '@id': ORGANIZATION_ID },
      blogPost: blogPosts.map((post) => ({
        '@type': 'BlogPosting',
        headline: post.title,
        url: `${SITE_URL}/blog/${post.slug}`,
        image: absoluteUrl(post.cover),
      })),
    });
  }

  if (details.post) {
    graph.push({
      '@type': 'BlogPosting',
      '@id': `${canonicalUrl}#article`,
      mainEntityOfPage: { '@id': pageId },
      headline: details.post.title,
      description: details.post.excerpt,
      image: {
        '@type': 'ImageObject',
        url: details.image,
        width: 1400,
        height: 788,
      },
      datePublished: UPDATED_AT,
      dateModified: UPDATED_AT,
      articleSection: details.post.category,
      inLanguage: 'en-IN',
      author: { '@id': FOUNDER_ID },
      publisher: { '@id': ORGANIZATION_ID },
    });
  }

  return graph;
}

function setStructuredData(graph) {
  let script = document.getElementById('toonswap-route-schema');
  if (!script) {
    script = document.createElement('script');
    script.id = 'toonswap-route-schema';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

export function buildSeoPayload(route) {
  const details = getPageDetails(route);
  const canonicalPath =
    route.name === 'blog-post' && details.post ? `/blog/${details.post.slug}` : route.path;
  const canonicalUrl = absoluteUrl(canonicalPath === '/' ? '/' : canonicalPath.replace(/\/$/, ''));
  return { details, canonicalUrl, graph: routeGraph(route, details, canonicalUrl) };
}

export function applySeo(route) {
  const { details, canonicalUrl, graph } = buildSeoPayload(route);

  document.title = details.title;
  setMetaName('description', details.description);
  const privatePage = [
    'characters',
    'voices',
    'story-studio',
    'login',
    'signup',
    'profile',
    'admin',
  ].includes(route.name);
  setMetaName(
    'robots',
    privatePage
      ? 'noindex, nofollow, noarchive'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  );
  setMetaName(
    'googlebot',
    privatePage
      ? 'noindex, nofollow, noarchive'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  );
  setMetaName(
    'bingbot',
    privatePage
      ? 'noindex, nofollow, noarchive'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  );
  setCanonical(canonicalUrl);
  setAlternateLanguage('en', canonicalUrl);
  setAlternateLanguage('x-default', canonicalUrl);

  setMetaProperty('og:type', details.post ? 'article' : 'website');
  setMetaProperty('og:site_name', 'ToonSwap');
  setMetaProperty('og:locale', 'en_US');
  setMetaProperty('og:url', canonicalUrl);
  setMetaProperty('og:title', details.title);
  setMetaProperty('og:description', details.description);
  setMetaProperty('og:image', details.image);
  setMetaProperty('og:image:url', details.image);
  setMetaProperty('og:image:secure_url', details.image);
  setMetaProperty('og:image:type', 'image/jpeg');
  setMetaProperty('og:image:width', details.imageWidth);
  setMetaProperty('og:image:height', details.imageHeight);
  setMetaProperty('og:image:alt', details.imageAlt);

  setMetaName('twitter:card', 'summary_large_image');
  setMetaName('twitter:title', details.title);
  setMetaName('twitter:description', details.description);
  setMetaName('twitter:image', details.image);
  setMetaName('twitter:image:alt', details.imageAlt);

  if (details.post) {
    setMetaProperty('article:published_time', UPDATED_AT);
    setMetaProperty('article:modified_time', UPDATED_AT);
    setMetaProperty('article:section', details.post.category);
  } else {
    document.head
      .querySelectorAll('meta[property^="article:"]')
      .forEach((element) => element.remove());
  }

  setStructuredData(graph);
}

export const validBlogSlugs = new Set(blogPosts.map((post) => post.slug));
