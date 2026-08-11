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
ELEVENLABS_API_KEY=

S3_REGION=auto
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_BUCKET=toonswap-dev
S3_PUBLIC_BASE_URL=https://<development-public-domain>
S3_ACCESS_KEY=
S3_SECRET_KEY=
```

Then create the Prisma client and local schema and start NestJS:

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

The API listens on `http://localhost:3000`; routes are under `/api/meme`.

The current source imports `@aws-sdk/client-s3`. If a clean backend install
reports that module as missing, add it to the backend dependencies and commit the
resulting `package.json`/lockfile update rather than relying on a global package.

### 3. Configure and start the frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` to
`http://localhost:3000`, so the frontend needs no local environment variable in
the current implementation.

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
- `ELEVENLABS_API_KEY`: restricted production key with an explicit usage cap.
- `S3_REGION`, `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`:
  S3/R2 write credentials and target.
- `S3_PUBLIC_BASE_URL`: public read origin used to construct stored object URLs.

Set secrets in the hosting provider's secret manager, not in committed env files
or build arguments. Keep development, staging, and production credentials
separate.

### Frontend API routing

The current frontend uses the relative base `/api/meme`. For production, choose
one of these approaches before deployment:

1. Add a Vercel rewrite from `/api/:path*` to the deployed backend. This keeps
   the current frontend unchanged and gives the browser a same-origin API path.
2. Update the store to read a `VITE_API_BASE_URL` at build time and set it to the
   backend origin. If using this option, add that backend origin to
   `FRONTEND_ORIGIN` handling as needed and never put secrets in the variable.

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

### S3/R2 bucket, public access, and CORS

For R2, create separate staging and production buckets and scoped write
credentials. Set `S3_ENDPOINT` to the account's S3 API endpoint, `S3_REGION` to
`auto`, and `S3_PUBLIC_BASE_URL` to the read domain. Cloudflare recommends an R2
custom domain for production; its `r2.dev` URL is intended for development
traffic. See [R2 public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/).

Allow only the frontend origins that need to play/download objects. A minimal
read policy is:

```json
[
  {
    "AllowedOrigins": ["https://app.example.com"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": [],
    "ExposeHeaders": ["Content-Length", "Content-Type", "ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Apply the policy in the bucket settings and verify from the real frontend
origin; origin values must match exactly. Cloudflare's current instructions are
in [Configure CORS](https://developers.cloudflare.com/r2/buckets/cors/).

The storage service currently sends `ACL: public-read`. R2 public access is
configured at the bucket/custom-domain layer, and S3-compatible providers differ
in ACL support. Test an upload during staging and remove or adapt that option if
the selected provider rejects it.

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

