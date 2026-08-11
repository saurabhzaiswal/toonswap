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

## Phase 1 — Routed product foundation (implemented)

- Vue Router navigation for Home, Characters, Voices, guided Story Studio,
  animated Roadmap, Blog, Privacy, Terms, and Community Guidelines.
- 24 illustrated original characters plus 108 structured blueprints across 12
  original worlds and nine broad story roles.
- A local custom-character brief builder covering silhouette, personality,
  movement, world role, palette, and prompt.
- 220 labelled voice-direction profiles: four live backend presets and 216
  planned/research profiles. A 200+ language goal is clearly a roadmap, not a
  claim of reviewed live support.
- Pinia-backed device-local character, voice, cast, project, and scene drafts.
- A six-step Simple mode for first-time creators and an optional Creator mode
  exposing camera, audio, continuity, and partial-regeneration controls.
- Custom Tailwind-backed Vue fields with scoped SCSS, readable typography,
  keyboard focus states, help text, and responsive layouts.
- Product-policy drafts for privacy, terms, and community rules.

## Phase 2 — Production data model and APIs (foundation implemented)

The first scalable schema/API pass is implemented without expanding the single
`MemeJob` into a catch-all:

- `StoryProject`: anonymous owner session, language, style, target duration,
  captions, mode, status, moderation state, and cost estimate.
- `Character` and `VoiceProfile`: catalog metadata, status, provider fields,
  consent link, visual/movement/emotion direction, and ownership boundary.
- `StoryCharacter`: ordered project cast, voice assignment, and custom snapshot.
- `StoryScene`: order, duration, cast, location, dialogue, expression, camera,
  continuity, replaceable-layer scope, status, and version.
- `SceneVersion`: immutable prompt/provider/settings/output record.
- `Render`: requested quality, estimated cost, approved cost, progress, output.
- `ConsentRecord`: subject, guardian where required, scope, evidence, expiry,
  withdrawal, deletion completion.

The REST foundation now provides catalog pagination, project creation, session-
owned reads, scene updates, 15–3600 second project validation, and an honest
capability endpoint. Provider rendering, catalog seeding, immutable scene/output
version history, moderation, consent evidence, and cost approval remain the next
backend phase.

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
