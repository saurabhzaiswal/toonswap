import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { blogPosts } from '../src/data/platformCatalog.js';
import { buildSeoPayload } from '../src/seo.js';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const frontendRoot = dirname(scriptDirectory);
const distDirectory = join(frontendRoot, 'dist');
const sourceHtml = await readFile(join(distDirectory, 'index.html'), 'utf8');

const routes = [
  { name: 'home', path: '/', params: {} },
  { name: 'characters', path: '/app/characters', params: {} },
  { name: 'voices', path: '/app/voices', params: {} },
  { name: 'story-studio', path: '/app/story-studio', params: {} },
  { name: 'roadmap', path: '/roadmap', params: {} },
  { name: 'blog', path: '/blog', params: {} },
  ...blogPosts.map((post) => ({
    name: 'blog-post',
    path: `/blog/${post.slug}`,
    params: { slug: post.slug },
  })),
  { name: 'privacy', path: '/privacy', params: {} },
  { name: 'terms', path: '/terms', params: {} },
  { name: 'community', path: '/community-guidelines', params: {} },
  { name: 'login', path: '/login', params: {} },
  { name: 'signup', path: '/signup', params: {} },
  { name: 'profile', path: '/app/profile', params: {} },
  { name: 'admin', path: '/app/admin', params: {} },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function replaceMeta(html, attribute, key, content) {
  const matcher = new RegExp(`<meta\\s+[^>]*${attribute}=["']${key}["'][^>]*>`, 'i');
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`;
  return matcher.test(html)
    ? html.replace(matcher, tag)
    : html.replace('</head>', `  ${tag}\n  </head>`);
}

function renderRoute(route) {
  const { details, canonicalUrl, graph } = buildSeoPayload(route);
  let html = sourceHtml
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(details.title)}</title>`)
    .replace(
      /<link\s+[^>]*rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${canonicalUrl}" />`,
    )
    .replace(
      /<link\s+[^>]*rel=["']alternate["'][^>]*hreflang=["']en["'][^>]*>/i,
      `<link rel="alternate" hreflang="en" href="${canonicalUrl}" />`,
    )
    .replace(
      /<link\s+[^>]*rel=["']alternate["'][^>]*hreflang=["']x-default["'][^>]*>/i,
      `<link rel="alternate" hreflang="x-default" href="${canonicalUrl}" />`,
    )
    .replace(
      /<script\s+id=["']toonswap-route-schema["'][^>]*>[\s\S]*?<\/script>/i,
      `<script id="toonswap-route-schema" type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c')}</script>`,
    );

  const privateRoute = [
    'characters',
    'voices',
    'story-studio',
    'login',
    'signup',
    'profile',
    'admin',
  ].includes(route.name);
  const namedMeta = {
    description: details.description,
    robots: privateRoute
      ? 'noindex, nofollow, noarchive'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    googlebot: privateRoute
      ? 'noindex, nofollow, noarchive'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    bingbot: privateRoute
      ? 'noindex, nofollow, noarchive'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    'twitter:card': 'summary_large_image',
    'twitter:title': details.title,
    'twitter:description': details.description,
    'twitter:image': details.image,
    'twitter:image:alt': details.imageAlt,
  };
  const propertyMeta = {
    'og:type': details.post ? 'article' : 'website',
    'og:site_name': 'ToonSwap',
    'og:locale': 'en_US',
    'og:url': canonicalUrl,
    'og:title': details.title,
    'og:description': details.description,
    'og:image': details.image,
    'og:image:url': details.image,
    'og:image:secure_url': details.image,
    'og:image:type': 'image/jpeg',
    'og:image:width': details.imageWidth,
    'og:image:height': details.imageHeight,
    'og:image:alt': details.imageAlt,
  };

  Object.entries(namedMeta).forEach(([name, content]) => {
    html = replaceMeta(html, 'name', name, content);
  });
  Object.entries(propertyMeta).forEach(([property, content]) => {
    html = replaceMeta(html, 'property', property, content);
  });

  if (details.post) {
    const articleMeta = [
      ['article:published_time', '2026-08-11'],
      ['article:modified_time', '2026-08-11'],
      ['article:section', details.post.category],
    ];
    articleMeta.forEach(([property, content]) => {
      html = replaceMeta(html, 'property', property, content);
    });
  }

  return html;
}

for (const route of routes) {
  const outputFile =
    route.path === '/'
      ? join(distDirectory, 'index.html')
      : join(distDirectory, route.path, 'index.html');
  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, renderRoute(route), 'utf8');
}

console.log(`Generated route-aware SEO HTML for ${routes.length} public and protected URLs.`);
