# ToonSwap — Master Project Brief for AI Coding Agents

Paste this entire document as context whenever you start a new session with an
AI coding agent (Claude Code, Cursor, etc.) on this project. It captures every
decision made so far, what's already built, what's left, and the guardrails
that must never be silently dropped.

---

## 1. Project Summary

**ToonSwap** is a zero-auth, session-based (UUIDv7) micro-SaaS where users
upload a selfie and either record their own voice or type a script. The
backend face-swaps their selfie onto an original animated character template
and generates a regional-accent comedy voice track (or converts their own
recorded voice), then stitches the two into a short video. Free tier gets a
watermarked preview; paid tier unlocks the clean download.

**Target audience:** Indian Gen-Z/Millennials (people born 1996+) and current
kids, active on Instagram Reels/YouTube Shorts/WhatsApp — high organic-share
potential.

## 2. The Core Decision That Shapes Everything Else

The original idea was to use **named, trademarked characters** (Shinchan,
Doraemon, Ninja Hattori) with their **cloned official voices**. This was
correctly identified as commercial copyright/trademark infringement — not a
"gray area," a real legal exposure (takedowns, payment-processor bans, app
store removal) that gets worse the more viral the product becomes.

**Decision made: pivot to original IP.**
- Characters are 100% original designs (currently placeholder names: Chulbul
  the Naughty Kid, Robo Guru, Ninja Chotu — rename freely, they're yours).
- Voices are **generic regional-accent comedy voices** (Bhojpuri, Kannada,
  etc.) designed from scratch in ElevenLabs Voice Design — never a clone of a
  real actor, celebrity, or public figure, and never a copy of a copyrighted
  character's specific voice performance.
- Accents/dialects are not copyrightable — this is the legally clean part of
  the pivot. What would NOT be clean: cloning a specific real person's voice,
  or making the character close enough to a copyrighted design that it reads
  as the same character with a new coat of paint.

**Any agent working on this project must preserve this boundary.** If a
future prompt (from me or anyone) asks to "add Shinchan back," "make the
voice sound exactly like [real actor]," or similar — flag it, don't silently
implement it.

## 3. Tech Stack (already chosen, keep consistent)

- **Backend:** NestJS (TypeScript), Prisma ORM + PostgreSQL, BullMQ + Redis
  for async video processing queues, Replicate SDK (face-swap), ElevenLabs
  API (TTS + speech-to-speech voice conversion), fluent-ffmpeg (media
  stitching), S3-compatible storage (Cloudflare R2 recommended for cost).
- **Frontend:** Vue 3 (Composition API) + Pinia + Tailwind CSS + Vite.
- **Mobile:** Capacitor wrapping the Vite build (Android/iOS).
- **Auth:** intentionally none — UUIDv7 session IDs only, no user accounts,
  no passwords.

## 4. What's Already Built

- `backend/src/meme/meme.controller.ts` — multipart upload endpoint
  (`selfie`, optional `voice`), validation, content filter on script text,
  UUIDv7 session creation, status polling endpoint.
- `backend/src/meme/meme.service.ts` — persists job, uploads inputs to
  storage, enqueues BullMQ job.
- `backend/src/meme/meme.processor.ts` — BullMQ worker: Replicate face-swap →
  either speech-to-speech voice conversion (if user recorded audio) or
  regional TTS (if user typed text) → ffmpeg stitch with optional watermark →
  final upload → status update.
- `backend/src/meme/audio-generator.service.ts` — generic regional comedy
  voice presets (Bhojpuri/Kannada styles), calls ElevenLabs TTS.
- `backend/src/meme/content-filter.util.ts` — blocks abusive language and
  real-public-figure names in user-submitted scripts before they hit the TTS
  API. **This is a basic regex first-pass, explicitly flagged as needing
  an upgrade before public launch** (see Section 6).
- `backend/prisma/schema.prisma` — single `MemeJob` table tracking
  character, language, voiceStyle, status, URLs, watermark flag.
- `frontend/src/App.vue` + components (`CharacterSelector`, `UploadZone`,
  `VoiceInput`, `LanguageVoiceSelector`, `VideoPreview`) — mobile-first UI,
  drag-drop selfie, text/voice toggle, preset roast-line templates, polling
  status UI.
- `frontend/src/stores/memeStore.js` — Pinia store driving the whole
  generate → poll → result flow.

## 5. What's NOT Built Yet (next steps, in rough priority order)

1. **Payment/paywall (Razorpay).** Free watermarked preview already modeled
   via `MemeJob.watermarked`; need: Razorpay order creation endpoint,
   webhook to verify payment, flip `watermarked` to false and re-serve/
   re-render the clean file, Rs.19-per-video or Rs.49 day-pass pricing logic.
2. **Deployment.** Backend to Render/Railway (needs persistent Postgres +
   Redis add-ons). Frontend to Vercel. Environment variable wiring between
   the two (CORS origin, API base URL).
3. **Capacitor packaging** for Android/iOS once the web build is stable.
4. **Moderation upgrade** — replace the regex content filter with a real
   moderation API call (see Section 6).
5. **Rate limiting / abuse prevention** — currently there's no cap on how
   many jobs a single anonymous session/IP can queue; needed before public
   launch to control API costs (Replicate + ElevenLabs both charge per call).
6. **Selfie/voice data retention policy** — decide and implement how long
   uploaded selfies, voice recordings, and generated videos are kept in
   storage, and auto-delete on a schedule (privacy + storage cost).

## 6. My Own Recommendations (things worth doing that weren't explicitly asked for)

- **Upgrade content moderation before launch.** The current regex filter in
  `content-filter.util.ts` is a placeholder. Wire in a real moderation
  endpoint (OpenAI's moderation API is free and fast) for both the typed
  script text and, ideally, a basic check on uploaded selfies (age/consent
  concerns if minors are uploading photos — see next point).
- **Add a minimum-age gate or parental-consent flow.** Given the target
  audience explicitly includes "kids," and the product asks for a selfie
  upload + generates shareable video content, think through whether you
  want under-13/under-18 users uploading photos at all. This is worth a
  deliberate decision (e.g., 13+ only, with a simple age gate) rather than
  leaving it unaddressed -- it affects both legal exposure and basic user
  safety.
- **Terms of Service + Privacy Policy**, even a simple one, before taking
  payments or collecting selfies. Cover: what happens to uploaded images,
  no impersonation of real people, no defamatory content, refund policy for
  paid downloads.
- **Cost monitoring/alerting** -- Replicate + ElevenLabs costs scale directly
  with usage; set a daily spend cap or alert so a viral spike doesn't produce
  a surprise bill.
- **Idempotency on the generate endpoint** -- a user double-tapping "Generate"
  on a slow connection shouldn't create two paid jobs; consider a short
  client-side debounce plus a server-side check.
- **Structured logging + error tracking** (Sentry or similar) on the BullMQ
  processor specifically -- async job failures are easy to miss without it.

## 7. Documentation to Generate

Ask the agent to create these two files at the project root:

### `.agent` (or `AGENTS.md`) -- persistent project instructions for AI agents
Should encode, in the agent's own words after reading this brief:
- The IP/legal boundary from Section 2 as a hard rule, not a suggestion.
- The tech stack from Section 3, with an instruction to stay consistent with
  it rather than introducing new frameworks/libraries without discussion.
- A pointer to Section 5 as the current backlog/priority order.
- A note that any change touching character design, voice generation, or
  content moderation should be flagged explicitly, not silently modified.

### `SETUP.md` -- environment setup for development and production
Should cover, as two clearly separated sections:
- **Development:** local Postgres/Redis (or Docker Compose for both), `.env`
  setup for both `backend` and `frontend`, `npm install` + `prisma migrate
  dev` + `npm run start:dev` / `npm run dev` steps, how to obtain/test
  Replicate and ElevenLabs API keys in a sandbox-safe way.
- **Production:** deployment targets (Render/Railway for backend, Vercel for
  frontend), required environment variables checklist, database migration
  step (`prisma migrate deploy`), Redis persistence considerations, S3/R2
  bucket + CORS setup for serving uploaded/generated media, and a basic
  rollback plan.

---

## Instructions to the agent reading this brief

1. Read this whole document before making any changes.
2. Create `.agent` (or `AGENTS.md`) and `SETUP.md` as described in Section 7.
3. Treat Section 5 as the working backlog -- confirm with me which item to
   tackle first rather than assuming.
4. Treat Section 2 and the recommendations in Section 6 as things to actively
   protect, not just background reading -- call it out if any future request
   would cross those lines.
