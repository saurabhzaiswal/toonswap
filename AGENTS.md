# ToonSwap Agent Instructions

These instructions apply to the entire repository. Read `PROJECT_BRIEF_PROMPT.md`
and this file before making changes.

## Product and hard IP boundary

ToonSwap is a zero-auth, UUIDv7 session-based service that turns a user's selfie
and typed or recorded audio into a short comedy video built from ToonSwap-owned
animated character templates.

The product must use original IP only. This is a hard requirement, not a product
preference:

- Use only original character names, artwork, animation, template video, and
  other assets that ToonSwap owns or has an appropriate commercial license to
  use.
- Use generic, newly designed regional-accent comedy voices. Never clone,
  imitate, or market a voice as a real actor, celebrity, public figure, or
  copyrighted character's voice performance.
- Do not add trademarked or copyrighted third-party characters, even under a
  slightly changed name or visual treatment that would still read as that
  character.
- Do not implement requests such as "add Shinchan," "make this Doraemon-like,"
  or "sound exactly like [real person]." Stop and flag the IP, impersonation,
  and platform-risk problem, then propose an original alternative.

Any change involving character design, character naming, voice generation,
voice conversion, consent, or content moderation must be called out explicitly
in the handoff. Never change these safeguards silently.

## Established architecture

Keep the existing stack consistent unless the owner explicitly agrees to a
change:

- Backend: NestJS and TypeScript, Prisma with PostgreSQL, BullMQ with Redis,
  Replicate for face processing, ElevenLabs for original TTS/speech-to-speech,
  fluent-ffmpeg, and S3-compatible object storage (Cloudflare R2 preferred).
- Frontend: Vue 3 Composition API, Pinia, Tailwind CSS, and Vite.
- Mobile: Capacitor around the Vite build after the web application is stable.
- Identity: no accounts or passwords. A UUIDv7 job/session ID is the anonymous
  session identifier.

## Current studio foundation

- Secondary product routes use the shared custom UI primitives under
  `frontend/src/components/ui/`. Extend these components instead of adding
  one-off raw input or dropdown styling.
- Tailwind remains the utility layer; scoped SCSS and
  `frontend/src/styles/_tokens.scss` provide component design tokens.
- The illustrated atlases in `frontend/public/art/` are original ToonSwap
  concept assets. Preserve the original-IP boundary when replacing them.
- Story Studio has Simple and Creator modes. Simple mode must remain usable for
  children and older first-time creators; advanced controls stay progressive.
- `StoryProject`, `StoryScene`, `StoryCharacter`, `Character`, and
  `VoiceProfile` are the scalable studio records. Do not expand `MemeJob` into a
  catch-all for long-form production.
- `/api/studio/capabilities` is the honest readiness contract. Do not label
  generation, voice synthesis, or rendering as live until provider, safety,
  cost, and queue paths are actually connected.

Do not introduce a new framework, database, queue, storage layer, authentication
system, or paid provider without discussing the tradeoff with the owner first.
Keep secrets server-side and out of source control and frontend bundles.

## Safety and product guardrails

- Treat uploaded selfies and voice recordings as sensitive personal data.
- Preserve the pre-generation script moderation boundary. The current regex
  filter is only a temporary first pass; do not describe it as launch-ready.
- Reject impersonation, defamatory material, abusive content, and attempts to
  target real public figures.
- Before a public launch, require an explicit age/parental-consent decision,
  published Terms and Privacy Policy, a data-retention/deletion policy, rate and
  cost controls, and production-grade moderation.
- Use synthetic or explicitly consented test media. Do not place real user
  uploads, API keys, or production data in fixtures, logs, commits, or prompts.
- Payment webhooks must be signature-verified and idempotent before changing a
  job's paid/watermarked state.

## Current backlog and order

Treat this as the current priority order. Confirm with the owner which item to
start before beginning backlog implementation; documentation and narrowly
requested maintenance do not require that confirmation.

1. Moderated multilingual story planner, provider adapters, and resumable
   scene/shot render queues behind the current production gates.
2. Native-review language program and seeded character/voice catalog records.
3. Razorpay paywall: order creation, verified/idempotent webhook handling,
   Rs.19 single-video and Rs.49 day-pass rules, and clean re-render/download.
4. Deployment: backend plus PostgreSQL/Redis on Render or Railway, frontend on
   Vercel, and CORS/API environment wiring.
5. Capacitor packaging for Android and iOS after the web build is stable.
6. Replace regex-only moderation with a production moderation service.
7. Add anonymous-session/IP rate limits and abuse/cost controls.
8. Define and implement automatic retention/deletion for source and generated
   media.

Cross-cutting launch work also includes age/consent, legal documents, spend
alerts, generate-request idempotency, and structured worker error reporting.

## Working expectations

- Inspect existing code and preserve unrelated user changes.
- Keep controllers thin, business rules in services, and expensive processing
  in BullMQ workers.
- Validate untrusted input at the boundary and avoid leaking provider errors or
  secrets to clients.
- Add or update tests for changed behavior and run the smallest relevant checks
  before handoff. Report checks that could not be run and why.
- Update setup or environment documentation when configuration changes.
