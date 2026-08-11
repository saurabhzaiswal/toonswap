# ToonSwap Setup

This guide covers local development and the intended production topology. The
project is not yet launch-ready: template URLs, the Replicate model version, and
ElevenLabs voice IDs in `backend/src/meme/` must be replaced with owned,
validated production assets before processing can succeed reliably.

## Development

### Prerequisites

- Node.js 20 or newer and npm
- PostgreSQL 15+ and Redis 7+, installed locally or run with Docker
- FFmpeg, including the `drawtext` filter, available on `PATH`
- An S3-compatible bucket that the backend can write to and whose generated
  object URLs the backend worker and browser can read
- Separate development credentials for Replicate and ElevenLabs

Check the local tools:

```bash
node --version
npm --version
ffmpeg -version
```

### 1. Start PostgreSQL and Redis

If they are not already installed, Docker is a quick local option. Run these
once; the named volumes retain data between container restarts:

```bash
docker run --name toonswap-postgres \
  -e POSTGRES_USER=toonswap \
  -e POSTGRES_PASSWORD=toonswap_dev \
  -e POSTGRES_DB=toonswap \
  -p 5432:5432 \
  -v toonswap-postgres-data:/var/lib/postgresql/data \
  -d postgres:16-alpine

docker run --name toonswap-redis \
  -p 6379:6379 \
  -v toonswap-redis-data:/data \
  -d redis:7-alpine redis-server --appendonly yes
```

On later runs, use `docker start toonswap-postgres toonswap-redis`. Do not use
the example password outside local development.

### 2. Configure and start the backend

From the repository root:

```bash
cd backend
npm install
cp .env.example .env
```

On PowerShell, replace the final command with:

```powershell
Copy-Item .env.example .env
```

Fill `backend/.env` with development values:

```dotenv
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173

DATABASE_URL=postgresql://toonswap:toonswap_dev@localhost:5432/toonswap

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

REPLICATE_API_TOKEN=
REPLICATE_SELF_INSERT_MODEL=
ELEVENLABS_API_KEY=
ELEVENLABS_SELF_INSERT_VOICE_MAP={}
SELF_INSERT_PROVIDER_ENABLED=false
SELF_INSERT_MEDIA_MODERATION_ENABLED=false

S3_REGION=auto
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_BUCKET=toonswap-dev
S3_PUBLIC_BASE_URL=https://<development-public-domain>
S3_ACCESS_KEY=
S3_SECRET_KEY=
TEMPLATE_ASSET_BASE_URL=https://toonswap.vercel.app
```

Then create the Prisma client and local schema and start NestJS:

```bash
npx prisma generate
npx prisma migrate dev --name studio-foundation
npx prisma db seed
npm run start:dev
```

The API listens on `http://localhost:3000`. Short-form generation routes are
under `/api/meme`; scalable story/catalog routes are under `/api/studio`.
Consent-first reusable photo/voice records are under `/api/self-insert`.
`GET /api/studio/capabilities` reports which production capabilities are real
and which still require provider integration.

### 3. Configure and start the frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` to
`http://localhost:3000`. The routed app includes `/characters`, `/voices`,
`/story-studio`, `/roadmap`, `/blog`, and policy pages. Story drafts currently
save in browser storage; durable project writes use the studio API once wired in
the frontend deployment.

### Format the frontend and backend

Prettier is installed in both packages. From the repository root, format both
codebases with one command:

```bash
npm run format
```

Use `npm run format:check` in CI when files should be checked without rewriting
them. The same commands can also be run inside either `frontend/` or `backend/`
to target only that package. Generated builds, native dependency output,
migrations, and lockfiles are excluded from formatting.

### Build the Capacitor mobile apps

Capacitor 8 is configured in `frontend/capacitor.config.json`; the tracked
native projects live in `frontend/android/` and `frontend/ios/`. Install Android
Studio for Android development. An iOS build requires macOS with Xcode even
though its source project can be synced from Windows.

After changing the web app, copy the latest production bundle and native plugin
configuration into both projects:

```bash
cd frontend
npm run mobile:sync
```

The generated Android/iOS app icons and light/dark splash screens use
`frontend/assets/logo.svg`, matching the web header/favicon smile mark. Keep
that source when regenerating assets; review the generator's dependency audit
before temporarily installing any native asset tool.

Open a native project with `npm run mobile:android` or, on macOS,
`npm run mobile:ios`. The mobile wrapper uses the same consent, private-media,
and API rules as the web app; configure the production API origin/reverse proxy
before shipping. Capacitor-generated web bundles, Gradle output, Pods, local
Android SDK paths, and derived iOS data are Git-ignored, while native source and
configuration remain tracked.

### 4. Provider credentials and safe testing

- Create a dedicated development token in the
  [Replicate API token settings](https://replicate.com/account/api-tokens).
  Keep it only in `backend/.env`, use a separate production token, and revoke it
  immediately if exposed.
- Create a restricted development key under ElevenLabs **Developers > API
  Keys**. Enable only the required speech endpoints and set a low credit quota;
  ElevenLabs documents these controls in its
  [API authentication guide](https://elevenlabs.io/docs/api-reference/authentication).
- Never put either key in `VITE_*` variables: Vite exposes those values to the
  browser bundle. Do not paste keys into issues, logs, prompts, or commits.
- Use original voice designs and synthetic or explicitly consented selfie/voice
  samples. A successful credentials check does not authorize cloning a real
  person's or copyrighted character's voice.
- Provider calls incur real usage. Start with one short, disposable input and
  inspect the provider dashboards before broader testing.

The checked-in voice IDs and remote assets are placeholders. Before an
end-to-end run, replace them with original ToonSwap-owned assets and validate the
currently selected Replicate model/version against its input and output schema.

### 5. Local smoke test

With both apps running:

1. Confirm the frontend loads at `http://localhost:5173`.
2. Submit a short synthetic/consented test image and script.
3. Verify the generate response returns a UUIDv7 session ID.
4. Verify the job moves from `PENDING` to `PROCESSING` and then `DONE`.
5. Confirm the resulting object URL is readable and the free output contains the
   watermark.
6. Inspect the NestJS worker logs and Redis queue if the job fails. Provider
   placeholders are expected to fail until replaced.

## Production

### Intended topology

- Deploy the NestJS application to Render or Railway. Attach managed PostgreSQL
  and Redis services in the same region when possible.
- Deploy `frontend/` to Vercel with build command `npm run build` and output
  directory `dist`.
- Store inputs and generated media in a private-by-default S3-compatible bucket;
  Cloudflare R2 is the preferred cost profile. The current code returns public
  object URLs, so use a deliberately enabled read-only public custom domain or
  change the application to issue expiring signed URLs before handling sensitive
  production media.

The Nest process currently hosts both the HTTP API and BullMQ worker. If these
are split or independently scaled later, keep the same queue name and deploy the
same compatible release to both roles.

### Backend build, migration, and start

Use the backend directory as the service root.

```bash
npm install
npx prisma generate
npm run build
```

Run database migrations as a release/pre-deploy step, once per release:

```bash
npx prisma migrate deploy
```

Start the built application with:

```bash
npm run start
```

The runtime image/host must include FFmpeg and the fonts required by the
watermark's `drawtext` filter. Its temporary filesystem must have enough space
for concurrent downloaded videos and rendered outputs; temporary job files are
deleted after each job.

### Required backend environment variables

- `PORT`: normally injected by the hosting platform.
- `FRONTEND_ORIGIN`: exact Vercel/custom frontend origin. Multiple origins may
  be comma-separated; do not leave production CORS open with `*`.
- `DATABASE_URL`: managed PostgreSQL URL; add the provider-required TLS options.
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`: persistent Redis connection.
  The current code does not parse `REDIS_URL` or configure Redis TLS, so add that
  support before choosing a provider that requires a TLS URL.
- `REPLICATE_API_TOKEN`: dedicated production token.
- `REPLICATE_SELF_INSERT_MODEL`: reviewed, pinned Replicate model version used to create one reusable original character reference.
- `ELEVENLABS_API_KEY`: restricted production key with an explicit usage cap.
- `ELEVENLABS_SELF_INSERT_VOICE_MAP`: JSON map from internal original voice-style IDs to approved provider voice IDs.
- `SELF_INSERT_PROVIDER_ENABLED` and `SELF_INSERT_MEDIA_MODERATION_ENABLED`: both must remain `false` until provider review, cost controls, and media moderation are production-ready.
- `S3_REGION`, `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`:
  S3/R2 write credentials and target.
- `S3_PUBLIC_BASE_URL`: public read origin for ordinary generated previews. Self-insert source and reference media stays private and is accessed by short-lived signed URLs.
- `TEMPLATE_ASSET_BASE_URL`: current Vercel/static origin for owned template assets.

Set secrets in the hosting provider's secret manager, not in committed env files
or build arguments. Keep development, staging, and production credentials
separate.

### Frontend API routing

The frontend uses `VITE_API_BASE_URL` as the backend origin when provided; otherwise it calls same-origin `/api`. The checked-in Vercel function at `frontend/api/[...path].js` forwards that path to the Nest service using the server-only `BACKEND_ORIGIN` environment variable. Set `BACKEND_ORIGIN` in Vercel to the deployed Nest origin without a trailing `/api`; never expose it as a secret-bearing `VITE_*` value. For production, choose
one of these approaches before deployment:

1. Use the checked-in Vercel API proxy and set `BACKEND_ORIGIN`. This keeps the browser on a same-origin `/api` path and supports session-protected private media responses.
2. Set `VITE_API_BASE_URL` at build time to the backend origin. The store already
   reads this value. Add the frontend origin to backend `FRONTEND_ORIGIN` CORS
   handling as needed, and never put secrets in a `VITE_*` variable.

The frontend now supports the second option through `frontend/.env.example`.
Set `VITE_API_BASE_URL` in the Vercel project to the deployed NestJS origin. The
checked-in `frontend/vercel.json` serves route-specific pre-rendered HTML for
all 15 public Vue Router URLs, then falls back to the root app shell for unknown
client routes. Direct visits and social/search crawlers therefore receive the
correct title, canonical, social metadata, and JSON-LD before JavaScript runs.

### SEO deployment checks

The frontend build runs `frontend/scripts/prerender-seo.mjs` after Vite. Before
publishing, confirm that `frontend/dist` contains route folders for characters,
voices, Story Studio, roadmap, blog articles, and the three legal pages. After
Vercel deploys, check these public files and representative routes:

- `https://toonswap.vercel.app/robots.txt`
- `https://toonswap.vercel.app/sitemap.xml`
- `https://toonswap.vercel.app/characters`
- `https://toonswap.vercel.app/blog/original-characters-without-copying`

Submit the sitemap in Google Search Console after the first production deploy.
Do not add fake ratings, prices, testimonials, or publication dates merely to
seek a rich result.

Do not deploy the current relative API path without either a rewrite or a code
change; Vercel would otherwise look for the NestJS route in the frontend
deployment.

### PostgreSQL and Redis

- Take a database backup/snapshot before each schema migration and test the
  migration against staging first.
- Prefer backward-compatible migrations so the previous application release can
  run during rollback.
- Enable Redis persistence (AOF and/or provider snapshots), use `noeviction` for
  queue keys where supported, monitor memory, and avoid treating Redis as a
  disposable cache. Losing Redis can lose or duplicate queued work.
- Use provider-native TLS and private networking. Update the current Redis
  connection configuration if the chosen service requires TLS or a single URL.

### S3/R2 bucket, private identity media, public outputs, and CORS

For R2, create separate staging and production buckets and scoped write
credentials. Keep self-insert selfie, voice, and generated identity-reference keys private. The self-insert flow now creates its consent/database record first, issues 10-minute content-type-bound PUT URLs for Uppy, verifies each object with `HEAD`, and only then finalizes or queues the reusable reference. Expired source objects are removed by the 24-hour retention queue. Set `S3_ENDPOINT` to the account's S3 API endpoint, `S3_REGION` to
`auto`, and `S3_PUBLIC_BASE_URL` to the read domain for non-sensitive preview outputs only. Cloudflare recommends an R2
custom domain for production; its `r2.dev` URL is intended for development
traffic. See [R2 public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/).

Direct browser PUTs still require an R2 CORS rule even though the URL is signed. Use `backend/r2-cors.example.json` as the checked-in starting point and replace its origins with the exact deployed frontend origins. A minimal upload policy is:

```json
[
  {
    "AllowedOrigins": ["https://toonswap.vercel.app"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Apply the policy in the bucket settings and verify from the real frontend
origin; origin values must match exactly. Cloudflare's current instructions are
in [Configure CORS](https://developers.cloudflare.com/r2/buckets/cors/).

Private media is streamed through `GET /api/self-insert/assets/:assetId/media/:kind` only after the caller supplies the matching anonymous `x-toonswap-session` header. The response uses `private, no-store`; raw R2 read URLs are not returned to the UI. PUT URLs are short-lived bearer tokens and should never be logged. For a same-origin browser path, route the frontend's `/api/*` through Vercel to the Nest service; otherwise `VITE_API_BASE_URL` must point to an app-owned API hostname. Do not make the self-insert prefix public through an R2 custom domain.

### Release verification

After deployment:

1. Confirm the frontend, API, database, and Redis health from the production
   network path.
2. Apply migrations and verify the expected Prisma schema.
3. Submit one short synthetic/consented job and follow it through BullMQ.
4. Confirm input/template URLs are reachable by Replicate and ElevenLabs where
   applicable, the output URL is readable by the browser, and CORS is restricted
   to the intended origin.
5. Verify watermark behavior, failure handling, logs, spend alerts, rate limits,
   retention deletion, moderation, and age/consent controls before opening the
   service publicly.

### Basic rollback plan

1. Stop new job creation or put the frontend in maintenance mode while retaining
   queued-job records.
2. Redeploy the last known-good frontend and backend artifacts; do not rebuild an
   old Git commit with newly resolved dependencies.
3. If the release included a backward-compatible migration, leave the schema in
   place. For an incompatible migration, follow a tested forward-fix or restore
   the pre-deploy database snapshot; never run an improvised destructive SQL
   rollback on production.
4. Check BullMQ for active/failed jobs and reconcile job records before resuming
   workers. A job may have completed at a provider even if the deployment failed.
5. Do not delete bucket objects as part of an application rollback. Restore or
   repoint versioned assets separately, then run the production smoke test again.
