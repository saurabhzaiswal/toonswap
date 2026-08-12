# ToonSwap Backend Local Run Guide

This guide starts the ToonSwap backend on Windows with PowerShell. Run every
command from the repository at `C:\Users\asus\Downloads\toonswap` unless a step
says otherwise.

## 1. Install the required software

Install these tools first:

- Node.js 20 or newer
- Docker Desktop
- FFmpeg with the `drawtext` filter
- Git

PostgreSQL and Redis will run in Docker, so a separate `psql` or Redis install
is not required.

Check the installed tools:

```powershell
node --version
npm --version
docker --version
ffmpeg -version
```

This computer already has Node.js, npm, and the Docker command-line tool.
Docker Desktop was not running during the last check, and FFmpeg was not found
on `PATH`. Start Docker Desktop and install FFmpeg before testing video
rendering.

## 2. Start PostgreSQL 18 and Redis

Open Docker Desktop and wait until it says the engine is running.

For the first run only, create the containers:

```powershell
docker run --name toonswap-postgres `
  -e POSTGRES_USER=toonswap `
  -e POSTGRES_PASSWORD=toonswap_dev `
  -e POSTGRES_DB=toonswap `
  -p 5432:5432 `
  -v toonswap-postgres-data:/var/lib/postgresql/data `
  -d postgres:18-alpine

docker run --name toonswap-redis `
  -p 6379:6379 `
  -v toonswap-redis-data:/data `
  -d redis:7-alpine redis-server --appendonly yes
```

To start the existing containers on later days:

```powershell
docker start toonswap-postgres toonswap-redis
```

Confirm that both services are ready:

```powershell
docker exec toonswap-postgres pg_isready -U toonswap -d toonswap
docker exec toonswap-redis redis-cli ping
```

PostgreSQL must be version 18 or newer because every database model uses the
native `uuidv7()` function. Do not replace these IDs with UUIDv4.

## 3. Prepare the backend environment

Move into the backend folder and install its packages:

```powershell
Set-Location backend
npm install
```

Create the environment file only if it does not already exist:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Do not overwrite an existing `.env`. Open `backend/.env` and set at least these
local values:

```dotenv
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173,http://localhost:4173

AUTH_SECRET=replace-with-at-least-32-random-characters
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax

DATABASE_URL=postgresql://toonswap:toonswap_dev@localhost:5432/toonswap
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

SELF_INSERT_PROVIDER_ENABLED=false
SELF_INSERT_MEDIA_MODERATION_ENABLED=false
```

Generate a strong local `AUTH_SECRET` with:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Copy the printed value into `AUTH_SECRET`. Never commit `.env` or share this
secret.

### Authentication settings

Email OTP sign-in also requires valid `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
`SMTP_PASSWORD`, and `MAIL_FROM` values.

Google sign-in requires the same public OAuth client ID in both places:

- `GOOGLE_CLIENT_ID` in `backend/.env`
- `VITE_GOOGLE_CLIENT_ID` in `frontend/.env`

The login and signup pages use the official Google Identity Services button and
request the official One Tap prompt. Google decides whether the account prompt
can appear based on the browser, active Google session, prior consent, origin,
and user preference. The regular Google button remains available as the
fallback. Do not recreate Google's account card with custom HTML.

For this JavaScript callback and popup flow, add these Google OAuth Authorized
JavaScript origins:

```text
http://localhost:5173
https://toonswap-kappa.vercel.app
```

Do not add a redirect URI for the current implementation. It receives Google's
ID credential in the browser callback, submits it to `/api/auth/google`, and the
backend verifies the token before creating ToonSwap's httpOnly session.

Cloudflare Turnstile requires:

- `TURNSTILE_SECRET_KEY` only in `backend/.env`
- `TURNSTILE_EXPECTED_HOSTNAME=localhost` in `backend/.env` for local use
- `VITE_TURNSTILE_SITE_KEY` in `frontend/.env`

The Turnstile secret must never use a `VITE_` prefix. Use Cloudflare's published
test key pair for local testing or create a localhost-enabled widget. The
backend always verifies the browser token with Cloudflare.

### Generation provider settings

The API and Story Studio can boot without Replicate, ElevenLabs, R2, or FFmpeg,
but live upload, voice, face-processing, and rendering paths will not work until
those services are configured. Keep both `SELF_INSERT_*_ENABLED` flags set to
`false` until provider review, media moderation, retention, and cost controls
are ready.

Only use original ToonSwap assets and synthetic or explicitly consented test
media. Never test with a celebrity, public figure, copied character, or a real
user's private upload.

## 4. Create the Prisma client and database

While still inside `backend` run:

```powershell
npm run prisma:generate
npx prisma migrate dev
npx prisma db seed
```

Use `prisma migrate dev` without `--name` when you only want to apply the
existing migrations. Add a migration name only when you intentionally change
`schema.prisma`.

## 5. Start the NestJS backend

```powershell
npm run start:dev
```

Keep this terminal open. A successful start prints:

```text
ToonSwap backend running on :3000
```

The local backend address is `http://localhost:3000`.

## 6. Verify the backend

Open a second PowerShell terminal and run:

```powershell
Invoke-RestMethod http://localhost:3000/api/studio/capabilities
```

You should receive a JSON object describing the currently implemented and gated
Studio features. This endpoint is safe for a basic startup check.

## 7. Start the frontend

In the second terminal, from the repository root:

```powershell
Set-Location frontend
npm install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

For local development, leave `VITE_API_BASE_URL` empty. Vite will proxy `/api`
requests to `http://localhost:3000`.

Open `http://localhost:5173` in the browser.

## Daily start commands

After the first setup, the short routine is:

Terminal 1:

```powershell
docker start toonswap-postgres toonswap-redis
Set-Location C:\Users\asus\Downloads\toonswap\backend
npm run start:dev
```

Terminal 2:

```powershell
Set-Location C:\Users\asus\Downloads\toonswap\frontend
npm run dev
```

## Stop the local services

Press `Ctrl+C` in the frontend and backend terminals. To stop the database and
Redis containers too:

```powershell
docker stop toonswap-postgres toonswap-redis
```

Database data remains in Docker volumes and will still be there on the next
start.

## Common errors

### Docker cannot connect to the engine

Start Docker Desktop, wait for it to become ready, and retry `docker version`.

### Container name is already in use

The container already exists. Use:

```powershell
docker start toonswap-postgres toonswap-redis
```

### Port 5432 or 6379 is already allocated

Another PostgreSQL or Redis instance is using the port. Stop that instance or
change both the Docker port mapping and the matching `.env` setting.

### Prisma says `uuidv7()` is unavailable

The database is older than PostgreSQL 18. Recreate the local PostgreSQL
container with `postgres:18-alpine`. Do not bypass the migration check.

### Prisma error P1001

The backend cannot reach PostgreSQL. Check Docker Desktop, container status,
and `DATABASE_URL`:

```powershell
docker ps --filter name=toonswap-postgres
docker logs --tail 50 toonswap-postgres
```

### Redis connection refused

Check the Redis container and the `REDIS_HOST` and `REDIS_PORT` values:

```powershell
docker ps --filter name=toonswap-redis
docker exec toonswap-redis redis-cli ping
```

### OTP email fails

The server can run without SMTP, but email login cannot send a code. Configure
the five SMTP and mail variables listed above.

### Turnstile verification fails

Confirm that the frontend site key and backend secret belong to the same widget,
that the widget permits `localhost`, and that
`TURNSTILE_EXPECTED_HOSTNAME=localhost`.

### Rendering fails with FFmpeg not found

Install FFmpeg, open a new terminal, and confirm `ffmpeg -version` works. The
production runtime also needs fonts supported by FFmpeg's `drawtext` filter.

## Build checks before pushing

From the repository root:

```powershell
npm run format:check
npm run build
```

These commands check both frontend and backend packages.

# Deployment Guide

Use the free path first for a private demo or beta test. Move to the paid path
before accepting real users or enabling video generation.

## Option A: Free demo deployment

This option uses:

- Vercel Hobby for the Vue frontend
- Render Free Web Service for NestJS
- Neon Free PostgreSQL 18, if version 18 is available for the project
- Render Free Key Value for the BullMQ Redis connection
- Cloudflare R2 Standard storage within its included free usage

This is not a production architecture. Render's free backend sleeps after idle
time, can take about a minute to wake up, and has an ephemeral local filesystem.
Its free Key Value instance is memory-only and can lose queued jobs after a
restart. Render also blocks outbound SMTP ports `25`, `465`, and `587` on free
web services. Regular Nodemailer OTP email will therefore not work on this free
path. Use Google sign-in for the demo, or move the backend to an always-on paid
service before enabling OTP.

### A1. Create a free PostgreSQL 18 database

1. Create a Neon project.
2. Explicitly select PostgreSQL 18. Do not use PostgreSQL 17 or older.
3. Copy the direct connection string. The current Prisma schema has one
   `DATABASE_URL` and does not yet define a separate migration `directUrl`.
4. Open Neon's SQL editor and verify the required features:

```sql
SELECT version();
SELECT uuidv7();
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

If `uuidv7()` fails, do not deploy this schema to that database. Select a
PostgreSQL 18 database instead.

### A2. Create the free Redis-compatible queue

1. In Render, create a Free Key Value instance.
2. Put it in the same region as the backend web service.
3. Keep internal authentication disabled for the first demo setup.
4. Copy the internal hostname and port from its internal URL.

For an internal URL similar to `redis://red-example:6379`, configure:

```dotenv
REDIS_HOST=red-example
REDIS_PORT=6379
REDIS_PASSWORD=
```

The current backend accepts separate host, port, and password fields. It does
not yet parse a `REDIS_URL` or configure Redis TLS.

### A3. Create the Cloudflare R2 bucket

1. In Cloudflare, open **Storage and databases > R2**.
2. Create a Standard storage bucket named `toonswap-assets`.
3. Create an R2 API token limited to object read and write access for only this
   bucket.
4. Copy the Access Key ID, Secret Access Key, Account ID, and S3 endpoint.
5. Add a lifecycle rule for source uploads after the retention period is
   formally decided.
6. Keep selfie and voice source objects private. Never enable an `r2.dev` public
   URL for sensitive uploads.

Use these backend variables:

```dotenv
S3_REGION=auto
S3_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
S3_BUCKET=toonswap-assets
S3_ACCESS_KEY=your-r2-access-key-id
S3_SECRET_KEY=your-r2-secret-access-key
S3_PUBLIC_BASE_URL=https://media.your-domain.example
```

`S3_PUBLIC_BASE_URL` is only for approved non-sensitive generated outputs. The
backend already streams private self-insert media through authenticated API
routes.

If the browser uploads through presigned URLs, configure this R2 CORS policy and
replace the origin with the real Vercel origin:

```json
[
  {
    "AllowedOrigins": ["https://toonswap-kappa.vercel.app"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Do not add `*` as an allowed production origin.

### A4. Deploy the NestJS backend on Render

1. Push the repository to GitHub.
2. In Render select **New > Web Service** and connect the repository.
3. Select the `main` branch.
4. Set **Root Directory** to `backend`.
5. Select the Node runtime and Free instance type.
6. Set the build command:

```text
npm ci && npm run prisma:generate && npx prisma migrate deploy && npx prisma db seed && npm run build
```

7. Set the start command:

```text
npm run start
```

8. Set the health check path to:

```text
/api/studio/capabilities
```

9. Add the backend environment variables below in Render. Store every secret as
   a secret value, never in Git.

```dotenv
NODE_ENV=production
FRONTEND_ORIGIN=https://toonswap-kappa.vercel.app
AUTH_SECRET=generate-a-new-production-secret
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=lax
SESSION_TTL_DAYS=30

DATABASE_URL=your-neon-postgresql-18-url
REDIS_HOST=your-render-internal-key-value-host
REDIS_PORT=6379
REDIS_PASSWORD=

GOOGLE_CLIENT_ID=your-public-google-client-id
TURNSTILE_SECRET_KEY=your-private-turnstile-secret
TURNSTILE_EXPECTED_HOSTNAME=toonswap-kappa.vercel.app

MINIMUM_SELF_SERVE_AGE=your-confirmed-policy
FREE_GENERATION_LIMIT=1
FREE_GENERATION_WINDOW_DAYS=your-confirmed-window
ADMIN_GENERATION_LIMIT=0
ADMIN_GENERATION_WINDOW_DAYS=0

SELF_INSERT_PROVIDER_ENABLED=false
SELF_INSERT_MEDIA_MODERATION_ENABLED=false

S3_REGION=auto
S3_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
S3_BUCKET=toonswap-assets
S3_ACCESS_KEY=your-r2-access-key-id
S3_SECRET_KEY=your-r2-secret-access-key
S3_PUBLIC_BASE_URL=https://media.your-domain.example
TEMPLATE_ASSET_BASE_URL=https://toonswap-kappa.vercel.app
```

Do not manually set `PORT` on Render. Render supplies it and the NestJS server
already reads it.

10. Deploy and open:

```text
https://YOUR-RENDER-SERVICE.onrender.com/api/studio/capabilities
```

### A5. Deploy the Vue frontend on Vercel

1. Import the GitHub repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Select Vite or configure these values:

```text
Install command: npm ci
Build command: npm run build
Output directory: dist
```

4. Add these Vercel Production environment variables:

```dotenv
BACKEND_ORIGIN=https://YOUR-RENDER-SERVICE.onrender.com
VITE_API_BASE_URL=
VITE_TURNSTILE_SITE_KEY=your-public-turnstile-site-key
VITE_GOOGLE_CLIENT_ID=your-public-google-client-id
VITE_OTP_ENABLED=false
```

Keep `VITE_API_BASE_URL` empty to use the checked-in same-origin Vercel API
proxy. This is the preferred session-cookie path. `BACKEND_ORIGIN` is used only
by the server-side Vercel proxy and must not have a trailing `/api`.

5. Redeploy after adding or changing variables. Vite variables are embedded at
   build time.
6. In Google OAuth, add
   `https://toonswap-kappa.vercel.app` as an Authorized JavaScript origin.
7. In Cloudflare Turnstile, allow `toonswap-kappa.vercel.app` and use Invisible
   mode.

### A6. Free demo verification

Check these URLs after both services deploy:

```text
https://toonswap-kappa.vercel.app/
https://toonswap-kappa.vercel.app/api/studio/capabilities
https://toonswap-kappa.vercel.app/login
https://toonswap-kappa.vercel.app/robots.txt
https://toonswap-kappa.vercel.app/sitemap.xml
```

Then verify:

- Google sign-in creates a secure server-side session.
- A signed-in user cannot open `/login` or `/signup`.
- A signed-out user cannot open protected `/app/*` pages.
- Only an administrator can open `/app/admin`.
- R2 source objects are not publicly readable.
- Provider and generation buttons remain disabled while capabilities are gated.

## Option B: Real production with Cloudflare and AWS

Recommended architecture:

```text
Browser
  -> Vercel Vue frontend and same-origin API proxy
  -> AWS Application Load Balancer
  -> ECS Fargate NestJS API service
  -> ECS Fargate BullMQ worker service
  -> Amazon RDS for PostgreSQL 18
  -> Amazon ElastiCache for Valkey or Redis with TLS and RBAC
  -> Cloudflare R2 or Amazon S3 private media bucket
```

Use Cloudflare for Turnstile, R2, DNS, rate controls, and optional WAF. Do not
move the existing NestJS, BullMQ, Prisma, and FFmpeg backend directly to
Cloudflare Workers. That runtime is not a drop-in host for this architecture.

### Production blockers that must be completed first

The current repository is not ready for the AWS path without these engineering
changes:

1. Add a reviewed backend Dockerfile containing Node.js, FFmpeg, required fonts,
   and a non-root runtime user.
2. Add `REDIS_URL` or explicit Redis TLS and username support. Amazon
   ElastiCache authentication requires in-transit encryption, while the current
   backend supports only host, port, and password without TLS.
3. Split HTTP API startup from BullMQ worker startup so they can run as separate
   ECS services and scale independently.
4. Add graceful queue shutdown, structured job errors, retry limits, and a
   dead-letter or failed-job review process.
5. Replace regex-only moderation with production media and text moderation.
6. Decide and enforce age or parental consent, media retention and deletion,
   rate limits, cost limits, and provider spend alerts.
7. Add generate-request idempotency and verify every payment webhook before
   changing paid or watermark state.
8. Add automated backup restore testing and an incident rollback procedure.

Keep `SELF_INSERT_PROVIDER_ENABLED=false` and
`SELF_INSERT_MEDIA_MODERATION_ENABLED=false` until these gates are complete.

### B1. Create the AWS network

1. Select one AWS region close to the primary users.
2. Create a VPC across at least two Availability Zones.
3. Put the Application Load Balancer in public subnets.
4. Put ECS tasks, RDS, and ElastiCache in private subnets.
5. Allow inbound HTTPS to the load balancer only.
6. Allow the API and worker security group to reach RDS and ElastiCache.
7. Do not expose RDS or ElastiCache to the public internet.

### B2. Create managed PostgreSQL and Redis

1. Create Amazon RDS for PostgreSQL 18.
2. Enable encryption, automated backups, deletion protection, and a production
   retention period.
3. Use Multi-AZ when availability matters.
4. Create ElastiCache for Valkey or Redis with TLS and RBAC.
5. Store database and Redis credentials in AWS Secrets Manager.
6. Verify `SELECT uuidv7();` and enable `pg_trgm` before migration.

Do not continue until the backend Redis TLS change from the blocker list is
implemented and tested.

### B3. Configure private media storage

Choose one storage service:

- Cloudflare R2 for S3 compatibility and no direct R2 egress charge
- Amazon S3 for a fully AWS-native network and IAM setup

For either choice:

1. Keep source selfie and voice objects private.
2. Give the ECS task role or R2 API token access only to the required bucket and
   object operations.
3. Use short-lived presigned PUT URLs for uploads.
4. Stream private downloads through authenticated API routes.
5. Restrict CORS to the exact frontend origin.
6. Apply lifecycle deletion rules to raw uploads and temporary renders.
7. Never log signed URLs, API tokens, raw media, or provider payloads containing
   user media.

### B4. Configure email, identity, and secrets

1. Verify the sending domain in Amazon SES.
2. Create SES SMTP credentials and put them in Secrets Manager.
3. Configure `SMTP_HOST`, port `587`, username, password, and `MAIL_FROM` for the
   NestJS task.
4. Add the production frontend origin to Google OAuth.
5. Configure the Cloudflare Turnstile production widget.
6. Keep Google client ID and Turnstile site key public in Vercel.
7. Keep Turnstile secret, SMTP credentials, provider keys, database URL, Redis
   credentials, and `AUTH_SECRET` in Secrets Manager.

### B5. Build and publish the backend image

After the Dockerfile blocker is implemented:

```powershell
aws ecr get-login-password --region YOUR_REGION | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.YOUR_REGION.amazonaws.com
docker build -t toonswap-backend ./backend
docker tag toonswap-backend:latest YOUR_ACCOUNT.dkr.ecr.YOUR_REGION.amazonaws.com/toonswap-backend:YOUR_RELEASE_TAG
docker push YOUR_ACCOUNT.dkr.ecr.YOUR_REGION.amazonaws.com/toonswap-backend:YOUR_RELEASE_TAG
```

Use an immutable commit SHA or release number for `YOUR_RELEASE_TAG`. Do not use
`latest` in production task definitions.

### B6. Run migration and seed tasks

Before deploying the new API tasks, run one ECS one-off task with:

```text
npx prisma migrate deploy
```

Run the catalog seed once when needed:

```text
npx prisma db seed
```

Do not run concurrent migrations from every API replica. Review migration logs
before switching production traffic.

### B7. Deploy API and worker services

1. Create an ECS Fargate task definition for the API.
2. Attach the least-privilege task IAM role and Secrets Manager references.
3. Expose only the NestJS port through an Application Load Balancer target
   group.
4. Set the health check path to `/api/studio/capabilities`.
5. Create a separate worker task definition after the worker entrypoint exists.
6. Give workers more CPU, memory, temporary disk, and suitable timeouts for
   FFmpeg jobs.
7. Start with one API task and one worker task. Scale only after queue,
   idempotency, and concurrency tests pass.
8. Send application and worker logs to CloudWatch with retention and alarms.

### B8. Production backend environment

Set these values through ECS plain configuration and Secrets Manager. The exact
Redis variables will change after TLS support is implemented.

```dotenv
NODE_ENV=production
FRONTEND_ORIGIN=https://toonswap-kappa.vercel.app
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=lax
TURNSTILE_EXPECTED_HOSTNAME=toonswap-kappa.vercel.app
TEMPLATE_ASSET_BASE_URL=https://toonswap-kappa.vercel.app
```

Set these as secrets:

```text
AUTH_SECRET
DATABASE_URL
REDIS_URL or the final TLS Redis variables
SMTP_USER
SMTP_PASSWORD
TURNSTILE_SECRET_KEY
REPLICATE_API_TOKEN
ELEVENLABS_API_KEY
S3_ACCESS_KEY and S3_SECRET_KEY when using R2
```

Rely on the ECS task IAM role instead of long-lived S3 access keys when using
Amazon S3.

### B9. Connect Vercel to AWS

1. Put the load balancer behind an API hostname such as
   `https://api.your-domain.example`.
2. Set Vercel's server-only `BACKEND_ORIGIN` to that API origin without `/api`.
3. Leave `VITE_API_BASE_URL` empty to keep browser API requests same-origin.
4. Keep the backend `FRONTEND_ORIGIN` set to the exact Vercel or custom frontend
   origin.
5. Redeploy Vercel after changing build-time `VITE_*` variables.

### B10. Production launch checks

Before public traffic:

- Run `npm run format:check` and `npm run build` in CI.
- Run Prisma migration and backup restore tests in staging.
- Test session cookies, CSRF, CORS, Turnstile, Google sign-in, OTP, RBAC, account
  blocking, and logout.
- Test upload cancellation, provider timeouts, BullMQ retries, duplicate
  requests, FFmpeg failure, and cleanup.
- Confirm selfie and voice retention deletion works automatically.
- Confirm source media is private and generated public media contains no private
  inputs.
- Load-test one API task and one worker before configuring autoscaling.
- Set AWS, R2, Replicate, ElevenLabs, and email spend alerts.
- Publish final Terms, Privacy Policy, Community Guidelines, consent policy, and
  support or deletion contact details.

Only after these checks pass should provider flags be enabled in staging. Enable
them in production through a controlled release with a rollback plan.
