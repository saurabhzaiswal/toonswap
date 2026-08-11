# ToonSwap implementation status

Updated: 11 August 2026

## Branded social preview and production SEO correction

- Corrected the canonical production origin to `https://toonswap-kappa.vercel.app/`
  across route metadata, Open Graph, Twitter cards, JSON-LD, the XML sitemap,
  robots, llms guidance, environment examples, and deployment documentation.
- Added `frontend/public/og-social.jpg`, a branded 1200 x 630 social preview
  containing the ToonSwap smile logo, wordmark, three original characters, and
  the main product message. The final file is 196,181 bytes, safely below the
  requested 300 KB ceiling.
- Added complete image metadata including the public URL, secure URL, JPEG MIME
  type, exact dimensions, and accessible alt text. Route-specific SEO and static
  prerendering now use the same production origin and fallback preview.
- Removed the prohibited long dash character from tracked project copy and
  documentation.

## Latest session, Turnstile, Axios, and audit-log hardening

- Kept ToonSwap's current B2C authorization model intentionally small: `UserRole`
  remains `USER | ADMIN`. The proposed `Client`, `Role`, `Permission`, and
  `RolePermission` tenant tables were not added because the product does not yet
  have client workspaces or custom roles. This avoids carrying a fake multi-tenant
  model into the future SaaS migration.
- Adapted the useful OTP proposal into `OtpChallenge`: UUIDv7 request IDs, hashed
  one-time codes, hashed public request tokens, optional hashed fingerprint/network
  signals, expiry, verification/consumption state, attempt limits, and indexed
  request-rate checks. Neither the code nor bearer-style request token is stored
  in plaintext.
- Replaced the admin-only audit table with a general indexed `ActivityLog` that can
  record an optional actor/subject, action, entity type/id/name, description,
  metadata, timestamps, and soft-deletion time. Login, generation, role, block,
  and quota events are recorded and searchable from a new admin Activity tab.
- Added mandatory Cloudflare Turnstile verification to OTP requests and Google
  sign-in/sign-up. The Vue widget uses explicit SPA rendering; Nest validates every
  token with Siteverify, expected action, optional hostname, remote IP, timeout,
  and idempotency key. Missing server credentials fail closed.
- Axios is now the sole frontend backend-API client. Auth, profile, admin,
  generation, and self-insert requests live in Pinia actions. The central response
  interceptor clears local auth state and redirects expired sessions to the public
  landing page (`/`), never to a private user home.
- Rebuilt sign-in/sign-up as a responsive, animated three-step experience with
  clear account-mode tabs, human-check state, email/OTP feedback, locked Google
  access until verification, mobile-safe layout, and route-level `noindex` SEO.
- Added honest content deterrence for non-admin visual assets: media-only
  right-click/drag prevention and a clear notification. Text selection and normal
  page interaction remain available. DevTools, F12, Inspect, OS screenshots, and
  cameras cannot be reliably blocked by a website, so no deceptive detection claim
  was added. Real protection remains private R2 objects, short-lived signed upload/
  provider URLs, owner-checked streaming, quotas, watermark state, and disabled
  production source maps.
- Tightened the existing API boundary with an exact credentialed CORS allowlist,
  mandatory production origin configuration, explicit methods/CSRF headers,
  preflight caching, Helmet security headers, secure-cookie production defaults,
  and semantic 403 responses for bad CSRF tokens. Authenticated CSRF checks remain
  bound to the active database session; public authentication has its own
  login-CSRF token and no broad unsafe-route bypass list.
- Replaced the dark split authentication screen with a lighter editorial creator
  experience: focused email/OTP forms, clearer security state, responsive tabs,
  real illustrated originals from the character atlas, playful story/voice notes,
  compact product context, and a single-column mobile layout.

### Latest verification

- Prisma format, schema validation, and Prisma Client generation: **pass**.
- Frontend Vite production build and backend Nest production build: **pass**.
- Visual browser QA could not run because this session exposed no in-app/Chrome
  browser backend; compilation and static responsive checks passed.

## V8 authentication, RBAC, admin, and UUIDv7 data model

- Added passwordless email OTP and optional Google Identity Services sign-in.
  OTP values are HMAC-hashed, expiring, single-use, attempt-limited, and request
  rate-limited. Browser sessions use opaque httpOnly cookies plus a separate
  double-submit CSRF token; logout and logout-all revoke server records.
- Added private profiles with display name, date of birth, city, country,
  locale, timezone, Uppy-to-R2 profile pictures, terms/privacy acknowledgement,
  age-policy state, and self-service permanent account deletion.
- Added USER/ADMIN RBAC, fail-closed generation policy checks, per-account usage
  overrides, blocked-account session revocation, admin audit logs, and an
  interactive users/jobs dashboard with indexed search, filters, pagination,
  roles, blocking, last-seen data, and usage controls.
- Migrated Meme, Story, Consent, SelfInsert, and custom Character ownership from
  anonymous browser secrets to authenticated user relations. Legacy anonymous
  rows are preserved under a blocked system owner for migration review.
- Every Prisma model primary key now uses
  `@id @default(dbgenerated("uuidv7()")) @db.Uuid`; relation columns are native
  PostgreSQL UUIDs and migrations require a database `uuidv7()` function.
- Added responsive MJML OTP mail, protected-route UI, account-aware header using
  the real favicon mark, private-route noindex HTML, creator identity JSON-LD,
  and an auth-capable Vercel reverse proxy that preserves cookies and CSRF.
- WebAuthn/passkeys remain explicitly documented as a future enhancement rather
  than an unimplemented security claim. Launch age and quota windows remain
  operator-configured; generation fails closed while either policy is missing.

## V7 route SEO and full responsive polish

- Added route-aware titles, descriptions, canonicals, Open Graph/Twitter cards, index directives, and working JSON-LD graphs for every public URL. The schemas cover Organization, WebSite, WebPage/CollectionPage, BreadcrumbList, SoftwareApplication, character/voice ItemLists, the six-step HowTo workflow, Blog, and each BlogPosting without inventing reviews, prices, or unsupported product claims.
- The production build now pre-renders SEO head content into 15 route-specific HTML entries. Vercel serves those entries on direct visits, while Vue still updates metadata during client navigation. The XML sitemap, robots policy, manifest, blog image sitemap entries, and legal/content routes use `https://toonswap-kappa.vercel.app` consistently.
- Finished an all-route narrow-screen pass: mobile-safe page gutters and wrapping, smaller-screen character/voice/story grids, readable legal copy, compact blog/article cards, overflow-safe toasts and dropdowns, and less fragile decorative shadows/transforms.
- Fixed the header's trailing two-line artifact by keeping the hamburger hidden at desktop sizes, aligned its breakpoint with the desktop navigation, and added an accessible animated slide/fade mobile menu with route-change closing and reduced-motion support.
- Reworked Home's language/voice section into expressive, tactile persona cards with clearer selection, larger art, responsive stacking, and pressable starter prompts. Per the latest direction, `UiSelect` no longer shows or enables an embedded search field.
- Compacted the Blog landing page's hero and featured story so one article no longer occupies nearly a full desktop viewport. Titles, artwork, cards, spacing, and mobile aspect ratios now follow a denser editorial rhythm.
- Follow-up fix: removed the featured card's fixed height, placed its CTA in a dedicated responsive action row, and reduced title scale so “Read the field note” can never be clipped below the card. Expanded all six articles from three short notes into five substantive sections, a practical checklist, a specific takeaway, and roughly 465–571 words of useful body copy per article.
- Added useful non-duplicative metadata from the supplied reference: Bing indexing directives, app-capable/color/format hints, route-correct `en` and `x-default` alternates, a sitemap discovery link, useful no-script copy, and an honest `llms.txt`. The unrelated analytics ID, person schema, social identities, and obsolete keyword stuffing were intentionally not copied.

### V7 verification

- Generated public HTML entries: **15**; unique route titles: **15**; canonical URLs: **15**.
- Parsed JSON-LD graphs without errors: **15/15**; XML sitemap URLs: **15**; web manifest JSON: **valid**.
- Root frontend/backend production build: **pass**.
- `og-social.jpg`: **191.6 KiB**, below the current 300 KB ceiling.
- Git-tracked `node_modules` files: **0**.

## V6 creator UI, mobile, formatting, and overflow update

- Reworked the Home guided creator into a clearer workspace with an orientation header, readable progress labels, real illustrated character thumbnails, larger selection cards, a proper segmented voice-input control, a reusable textarea, clearer voice personas, and a branded violet preview instead of a cramped black side strip. The two-column creator now stacks before it becomes narrow, so the flow remains usable on tablet-sized screens.
- Removed the visible “Type to search this list” banner from every Vue Select menu. The latest V7 direction also disables the embedded search control entirely. Menus retain keyboard selection, viewport-aware height, contained scrolling, a higher overlay layer, and no horizontal spill. Story Studio’s panel no longer clips open menus.
- Increased small Home/footer labels and strengthened route-level status treatments. Character and voice counts plus Story Studio browse/scene panels now use branded violet surfaces and clearer text hierarchy. Prettier normalized all frontend and backend source formatting.
- Added Capacitor 8.5 with tracked Android and iOS projects, safe-area-aware web chrome, sync/open scripts, and native build documentation. Android/iOS icons and light/dark splash screens are generated from the same smile-mark SVG as the header/favicon. Copied web bundles and local native build/dependency output are ignored so Git tracks source rather than generated noise.
- Added Prettier 3.9 to both packages. `npm run format` and `npm run format:check` work from the repository root or independently inside frontend/backend.
- Replaced the legacy social preview with the current branded 1200 x 630 JPEG,
  kept at 191.6 KiB for fast social-crawler delivery.
- Upgraded Vite to 8.2 and the Vue plugin to 6.0. The frontend production bundle now builds with route splitting and the production dependency audit remains clean.

### V6 verification

- Root, frontend, and backend Prettier checks: **pass**.
- Frontend Vite 8 production build: **pass**.
- Backend Nest production build: **pass**.
- Capacitor Android/iOS sync: **pass**.
- Frontend production and backend full dependency audits: **0 vulnerabilities**.
- Frontend full development audit retains three moderate findings in Capacitor CLI’s transitive `xcode -> uuid` helper. They do not ship in the production bundle; npm’s proposed forced fix is an unverified Capacitor downgrade, so it was not applied.
- Local Vite server health: **HTTP 200**. Browser screenshot QA could not run because no in-app browser backend was available in this session; production compilation and static layout checks passed.

## V5 dropdown, upload, and media-customization update

- Replaced the Headless UI select base with Vue 3 `vue-select` v4 and fully re-skinned it as ToonSwap `UiSelect`. Every existing dropdown now supports type-to-search, keyboard navigation, descriptions, empty search states, and optional image/sprite avatars.
- Added the canonical `AppButton` `size="sm"` option and applied it to the header CTA. Its depth and pressed state scale down with the control instead of using header-only sizing hacks.
- Fixed the character-image circle regression at its source. Home's decorative `.character-art::before` and `.character-copy` styles were globally leaking into the Characters route; both Home classes are now namespaced. Full character and blog art remains rectangular, while only deliberate tiny indicators/avatars remain circular or rounded.
- Adopted Uppy Core, Vue, and XHR Upload for selfie and voice file selection plus direct private uploads. Self-insert uploads create consent records before receiving signed R2 PUT slots, validate file type/size, upload without proxying bytes through Nest, verify object presence, then finalize behind the provider/moderation gates.
- Added session-protected private-media streaming at `/api/self-insert/assets/:assetId/media/:kind`, `private, no-store` headers, an example R2 PUT-only CORS policy, and setup guidance for a Vercel `/api/*` reverse proxy. Raw private read URLs are not returned to the UI.
- Added Creator-mode scene media controls: per-scene voice volume/pitch/speed, an original royalty-safe music direction and volume, single-line voice-only regeneration versioning, trim start/end, cut/fade transition direction, scene reordering, and a preview scrubber. These are saved renderer instructions; the UI does not falsely claim that provider rendering is live.
- Improved Studio mode and step controls with clearer selected states and tactile depth. The active step is brand violet instead of a flat black block.
- Frontend production JS is now about 86.88 KB gzip after the requested searchable-select and Uppy foundations. The upload dependencies are accepted for validation, retry/progress, and direct-to-R2 behavior; further route-level splitting remains a performance follow-up.

## V4 regression and self-insert update

- Fixed the design-system regression at its source: `AppButton` no longer carries the legacy global `.primary-button` class, so Home-only descendant styles cannot leak into cards, filters, menus, and controls on other routes.
- Corrected `variant="primary"` from black to the CSS-variable coral brand color. Every raised button now has distinct default, hover, active/pressed, focus-visible, disabled, touch, and reduced-motion behavior. The active state compresses by 6px and collapses the depth shadow so a click feels physical.
- The Home layout was preserved; only its canonical CTA behavior/color and the shared regression were corrected.
- Characters now explains **216 total = 24 illustrated + 192 blueprint-only** inside the page. Illustrated characters surface first, blueprints have a dedicated filter, six varied placeholder silhouettes, and an explicit “Art coming soon · blueprint ready” badge.
- Story Studio now accepts a spoken story idea. Supported browsers transcribe it into the prompt; unsupported browsers retain the recording only in the current tab for the future moderated transcription adapter.
- Story Studio now includes a first-class consent-first self-insert cast option: photo only, voice only, or both; real voice as-is or consented conversion to an original fictional voice style; clear local/private state; delete control; and one reusable character-reference record for all scenes.
- Added dedicated Nest modules for character catalog, voice catalog, stories/scenes, moderation, private media storage, and self-insert orchestration. `studio.service.ts` is now a small readiness contract rather than a god-service.
- Added Prisma `ConsentRecord` and `SelfInsertAsset` models, a migration, a session-owner protected status/delete API, private S3 object references, short-lived signed provider URLs, a 24-hour retention queue, and provider/media-moderation gates.
- V4 temporarily adopted `@headlessui/vue` for listbox behavior; V5 explicitly superseded that choice with searchable `vue-select` and removed the Headless UI dependency.
- Adopted Nest-standard `class-validator` and `class-transformer` for new story/self-insert DTO boundaries, plus AWS’s official S3 presigner for private sensitive-media access.
- Upgraded the backend to the compatible NestJS 11, Multer 2, Config 4, BullMQ adapter 11, and UUID 11 lines. This cleared the older transitive security advisories without a blind forced audit fix; the application still compiles.
- Did not add VueUse, Zod, or Bull Board: the select/upload libraries cover the requested interaction needs, backend DTO validation covers the new server boundary, and the current queue count does not justify another dashboard dependency.
- The requested 12–20 FLUX pilot remains **not run** because no Replicate token is configured. No paid call or fake result was created; the exact next action and estimated $0.48–$0.80 generation cost are recorded in `ART_PIPELINE.md`.

## Completed in this pass

- Character catalog expanded to **216 original structured characters**: 12 worlds × 18 archetypes.
- **24 characters are illustrated** in the current atlas; **192 are honestly marked as blueprints**, not misrepresented as finished assets.
- Prisma seed creates the same 216-character structure and retains scalable catalog metadata.
- Voice library contains **220 profiles**, and every profile has an expressive visual-avatar mapping plus expression, energy, and age-feel direction.
- Native HTML selects were removed. `UiSelect.vue` keeps ToonSwap’s custom visual design while `vue-select` supplies search, keyboard navigation, focus management, ARIA semantics, descriptions, and optional avatars.
- `AppButton.vue` is the canonical button/link component. The Vue source contains no raw `<select>` tags; library internals render their own accessible controls.
- Primary, secondary, tertiary, accent, surface, border, ink, and state colors are CSS variables in `frontend/src/styles/base.scss`. Sass tokens and Tailwind colors reference those variables.
- Blog listing and article pages use responsive editorial layouts, clear typography, canonical CTAs, related articles, and six original cover illustrations.
- Blog images are resized and compressed to 1400px-wide JPGs (about 190–322 KB each).
- A reusable backend prompt builder exists for original character and expressive voice-avatar generation.
- Existing Pinia project drafts, Story Studio, legal pages, Vercel Analytics, SEO metadata, SVG favicon, REST backend structure, and 15-second-to-60-minute duration guardrails remain in place.

## Verification

- Frontend production build: **pass** (`npm run build`).
- Backend TypeScript/Nest build: **pass** (`npm run build`).
- Catalog integrity check: **216 characters**, **24 illustrated**, **192 blueprints**, **216 unique character IDs**, **24 unique art slots**, and **220 voices**.
- Source audit: **0 native `<select>` elements**, **0 raw `<button>` elements**, **0 legacy dark CTA usages**, and **0 old `toonswap.app` asset URLs** in application source.
- Frontend production dependency audit: **0 vulnerabilities**.
- Backend full and production dependency audits: **0 vulnerabilities** after the reviewed framework/security upgrade.
- Browser-based visual QA could not run in this session because no in-app/Chrome browser backend was available. Production compilation and static integrity checks passed; a final device/browser pass is still required before deployment.

## Honest product boundary

The present repository is a production-oriented foundation, not a claim that every AI capability is already live. Four voice directions are marked live in the UI; broader language coverage is a native-review roadmap. The 192 non-illustrated characters are structured blueprints awaiting a reviewed art batch. Long-form generation requires real provider credentials, moderation, queues, storage, cost limits, and observability before public launch.

## Next recommended milestone

Run the 12–20-image art pilot described in `ART_PIPELINE.md`, review it for original-IP distance and cultural quality, then connect approved asset records to the existing backend catalog. After that, run keyboard/mobile/browser QA and a small end-to-end render job before Vercel production deployment.
