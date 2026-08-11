# ToonSwap

Face-swap + voice-conversion meme generator using **original, non-infringing cartoon
characters** (Chulbul, Robo Guru, Ninja Chotu) — same 90s-nostalgia vibe as
Shinchan/Doraemon/Ninja Hattori, but characters you actually own the rights to.

## Stack
- **Backend:** NestJS + Prisma (Postgres) + BullMQ/Redis + Replicate SDK + ElevenLabs API + fluent-ffmpeg
- **Frontend:** Vue 3 (Composition API) + Pinia + Tailwind CSS + Vite
- **Sessions:** zero-auth, UUIDv7 session IDs (job id doubles as session id)

## Before you run this
1. **Draw/commission your own character art and record your own reference voice
   samples** for Chulbul / Robo Guru / Ninja Chotu (or rename them to whatever you
   like). Upload the base template videos to your S3 bucket at the paths referenced
   in `backend/src/meme/meme.processor.ts` (`CHARACTER_TEMPLATES`).
2. Train/register the corresponding ElevenLabs voice models and put their model IDs
   in the same map.
3. Swap the placeholder Replicate model string in `meme.processor.ts`
   (`FACE_SWAP_MODEL`) for whichever face-swap model you land on after testing —
   check current model versions on replicate.com before going live.

## Backend setup
```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL, REDIS_*, REPLICATE_API_TOKEN, ELEVENLABS_API_KEY, S3_*
npx prisma migrate dev --name init
npm run start:dev
```
You'll also need a local/hosted Redis instance for BullMQ, and an S3-compatible
bucket (Cloudflare R2 is cheap and works well here) for selfies/voice/output storage.

## Frontend setup
```bash
cd frontend
npm install
npm run dev
```
Vite proxies `/api/*` to `http://localhost:3000` in dev (see `vite.config.js`).

## Wrapping with Capacitor
Once the Vite build is stable:
```bash
cd frontend
npm run build
npm install @capacitor/core @capacitor/cli
npx cap init ToonSwap com.yourname.toonswap
npx cap add android
npx cap add ios
npx cap sync
```
Point `webDir` in `capacitor.config.ts` to `dist`, and change `API_BASE` in
`src/stores/memeStore.js` from a relative path to your deployed backend's full URL
(mobile webviews can't rely on the Vite dev proxy).

## Regional comedy voices (Bhojpuri / Kannada / etc.)
On top of the character face-swap, text input now routes through
`AudioGeneratorService` → generic, original accent-based comedy voices
(`backend/src/meme/audio-generator.service.ts`). Two rules keep this safe:

1. **Never clone a real actor/celebrity's voice.** Design your own voices in
   ElevenLabs Voice Design/Library and fill in `VOICE_PRESETS` with your own
   voice IDs — the placeholders in the file are not real IDs.
2. **`content-filter.util.ts` blocks obvious abuse and real-person names**
   before a script ever reaches the TTS API. This is a basic first pass —
   swap in a real moderation API (OpenAI moderation endpoint, Perspective
   API, etc.) before you launch publicly, especially since scripts are
   user-generated and could turn defamatory.

## Monetization note
Keep the free/watermarked-preview + paid-download model — it's the same structure
you had planned, just applied to characters you own. `MemeJob.watermarked` in the
Prisma schema already tracks this per-job so you can flip it after payment
confirmation before re-serving the final render.
