# ToonSwap implementation status

Updated: 11 August 2026

## V4 regression and self-insert update

- Fixed the design-system regression at its source: `AppButton` no longer carries the legacy global `.primary-button` class, so Home-only descendant styles cannot leak into cards, filters, menus, and controls on other routes.
- Corrected `variant="primary"` from black to the CSS-variable coral brand color. Every raised button now has distinct default, hover, active/pressed, focus-visible, disabled, touch, and reduced-motion behavior. The active state compresses by 6px and collapses the depth shadow so a click feels physical.
- The Home layout was preserved; only its canonical CTA behavior/color and the shared regression were corrected.
- Characters now explains **216 total = 24 illustrated + 192 blueprint-only** inside the page. Illustrated characters surface first, blueprints have a dedicated filter, six varied placeholder silhouettes, and an explicit “Art coming soon · blueprint ready” badge.
- Story Studio now accepts a spoken story idea. Supported browsers transcribe it into the prompt; unsupported browsers retain the recording only in the current tab for the future moderated transcription adapter.
- Story Studio now includes a first-class consent-first self-insert cast option: photo only, voice only, or both; real voice as-is or consented conversion to an original fictional voice style; clear local/private state; delete control; and one reusable character-reference record for all scenes.
- Added dedicated Nest modules for character catalog, voice catalog, stories/scenes, moderation, private media storage, and self-insert orchestration. `studio.service.ts` is now a small readiness contract rather than a god-service.
- Added Prisma `ConsentRecord` and `SelfInsertAsset` models, a migration, a session-owner protected status/delete API, private S3 object references, short-lived signed provider URLs, a 24-hour retention queue, and provider/media-moderation gates.
- Adopted `@headlessui/vue` under the custom `UiSelect` design for tested listbox keyboard/focus/ARIA behavior. Production JS gzip increased from about 56.65 KB to 64.68 KB (+8.03 KB) including the self-insert UI; this is accepted for accessibility correctness.
- Adopted Nest-standard `class-validator` and `class-transformer` for new story/self-insert DTO boundaries, plus AWS’s official S3 presigner for private sensitive-media access.
- Upgraded the backend to the compatible NestJS 11, Multer 2, Config 4, BullMQ adapter 11, and UUID 11 lines. This cleared the older transitive security advisories without a blind forced audit fix; the application still compiles.
- Did not add VueUse, Zod, or Bull Board: Headless UI already removes the custom dropdown composable, backend DTO validation covers the new server boundary, and the current queue count does not justify another dashboard dependency.
- The requested 12–20 FLUX pilot remains **not run** because no Replicate token is configured. No paid call or fake result was created; the exact next action and estimated $0.48–$0.80 generation cost are recorded in `ART_PIPELINE.md`.

## Completed in this pass

- Character catalog expanded to **216 original structured characters**: 12 worlds × 18 archetypes.
- **24 characters are illustrated** in the current atlas; **192 are honestly marked as blueprints**, not misrepresented as finished assets.
- Prisma seed creates the same 216-character structure and retains scalable catalog metadata.
- Voice library contains **220 profiles**, and every profile has an expressive visual-avatar mapping plus expression, energy, and age-feel direction.
- Native HTML selects were removed. `UiSelect.vue` keeps ToonSwap’s custom visual design while Headless UI supplies keyboard navigation, focus management, ARIA semantics, outside-click handling, descriptions, and optional avatars.
- `AppButton.vue` is the canonical button/link component. The Vue source contains no raw `<button>` or `<select>` tags; Headless UI renders its accessible listbox controls internally.
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
