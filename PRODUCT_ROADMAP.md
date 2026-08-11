# ToonSwap Product Roadmap

This roadmap turns ToonSwap from a short-form meme generator into an original-IP
animation studio without pretending that prototype UI equals production AI.

## Non-negotiable creative boundary

ToonSwap may explore broad genres, eras, cultural settings, and storytelling
traditions. It must not generate copies, close substitutes, mashups, or disguised
versions of protected characters or real performers. Changing a name or colour is
not enough. Original work needs distinct silhouettes, roles, relationships,
world rules, movement signatures, props, costumes, lore, voices, and marketing.

Every provider prompt and uploaded reference should pass an IP/impersonation
review before generation. Public-figure and protected-character requests should
be rejected with an original alternative.

## Phase 1 — Routed product foundation (implemented in the frontend)

- Vue Router navigation for Home, Characters, Voices, Story Studio, Blog,
  Privacy, Terms, and Community Guidelines.
- 108 original character blueprints across 12 original worlds and nine broad
  story roles.
- A local custom-character brief builder covering silhouette, personality,
  movement, world role, palette, and prompt.
- 220 labelled voice-direction profiles: four live backend presets and 216
  planned/research profiles. A 200+ language goal is clearly a roadmap, not a
  claim of reviewed live support.
- Pinia-backed device-local character, voice, cast, project, and scene drafts.
- Multi-character story planning from 15 seconds to 60 minutes, with editable
  scene action, dialogue/song, expression, camera, audio mode, continuity, and
  regeneration scope.
- Product-policy drafts for privacy, terms, and community rules.

## Phase 2 — Production data model and APIs

Create versioned domain models rather than expanding the single `MemeJob` into a
catch-all:

- `Project`: anonymous owner session, title, language, target duration, status.
- `CharacterAsset`: original/licensed source, consent record, model references,
  style bible, current version, deletion state.
- `VoiceAsset`: original preset or consented speaker source, usage scope,
  consent record, provider voice ID, version.
- `Scene`: order, duration, cast, location, prompt, dialogue, expression, camera,
  continuity, moderation state.
- `SceneVersion`: immutable prompt/provider/settings/output record.
- `Render`: requested quality, estimated cost, approved cost, progress, output.
- `ConsentRecord`: subject, guardian where required, scope, evidence, expiry,
  withdrawal, deletion completion.

Add authenticated project ownership before durable personal character libraries.
The existing anonymous UUID job is suitable only for limited short-lived jobs.

## Phase 3 — Safety, consent, and rights pipeline

Before any provider call:

1. Neutral age gate and launch-market age policy.
2. Verifiable guardian workflow where legally required.
3. Media consent and rights declaration with evidence for reusable identities.
4. Image, text, audio-transcript, and prompt moderation.
5. Protected-character, public-figure, trademark, and impersonation screening.
6. EXIF/geolocation stripping and malware/file validation.
7. Human review route for borderline cultural, child-safety, or rights cases.
8. Reporting, appeals, rights-holder notices, and fast takedown operations.

## Phase 4 — Native-led voice and language program

A language is “live” only after:

- the model is technically supported and evaluated;
- the voice is original or properly licensed with documented consent;
- native reviewers assess pronunciation, rhythm, politeness, stereotypes,
  humour, and unsafe ambiguity;
- scripts use language-specific moderation and transliteration rules;
- quality limits and fallback behaviour are published;
- users can report pronunciation or cultural issues.

Translation, dubbing, speech-to-speech, singing, and lip-sync should be separate
capabilities. Copyrighted songs and lyrics require their own rights checks.

## Phase 5 — Scene-based AI pipeline

1. Convert the story brief into structured beats.
2. Lock character/style bibles and consent before shots.
3. Generate low-cost storyboards and animatics.
4. Let the creator approve or edit each scene.
5. Render short, independently retryable shots.
6. Generate/convert dialogue and original songs per approved scene.
7. Lip-sync, mix, subtitle, and assemble the film.
8. Run output moderation and continuity checks.
9. Store immutable versions so “change voice only” or “change background only”
   can reuse approved work.

## Phase 6 — Long-form rendering (up to 60 minutes)

- Never render a one-hour film as one provider job. Use resumable scene and shot
  queues with checkpoints.
- Estimate cost before rendering and require explicit approval above a threshold.
- Cache character references, backgrounds, voices, and approved shots.
- Separate preview quality from final quality.
- Enforce per-session/user concurrency, daily spend limits, provider circuit
  breakers, retries, cancellation, and idempotency.
- Save project manifests so an interrupted render can resume without duplicate
  charges.

## Phase 7 — Privacy and retention

Define and implement before public access:

- source selfie and voice retention;
- generated preview/final retention;
- draft character and reusable identity retention;
- deletion across PostgreSQL, object storage, queues, logs, backups, analytics,
  and providers where supported;
- self-service export/deletion and verified privacy requests;
- withdrawal of voice/face consent and prevention of future reuse;
- incident response, audit logs, and a working privacy contact.

## Phase 8 — Commerce and launch readiness

- Razorpay order creation and signature-verified idempotent webhooks.
- Clear licence per asset and output, pricing, taxes, refund policy, and day-pass
  rules.
- Rate limits, spend alerts, structured worker logs, error tracking, uptime and
  queue dashboards.
- Staging evaluation set covering languages, cultures, character consistency,
  voice consent, minors, abuse, and IP similarity.
- Qualified legal review of privacy, terms, community rules, provider terms,
  commercial licences, child-safety design, and launch markets.

