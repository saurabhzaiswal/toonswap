# ToonSwap character and voice art pipeline

Updated: 11 August 2026

## Recommendation

Use the existing `replicate` backend package with FLUX 1.1 Pro for the first controlled character-art pilot. It already fits the current NestJS stack, supports deterministic seeds, and has a predictable per-output price. Do not start a 400+ image batch until 12–20 pilot images pass visual consistency, cultural review, accessibility, and original-IP review.

The backend now includes reusable prompt builders in `backend/src/studio/character-art-prompt.ts`. Store the input brief, prompt version, provider/model version, seed, output URL, reviewer decision, and rejection reason for every result.

### V4 pilot status

The requested FLUX pilot was not submitted on 11 August 2026 because no `REPLICATE_API_TOKEN` is configured in the workspace. This prevents accidental paid calls and avoids claiming that ungenerated assets exist. Once the owner adds a sandbox token and confirms the model/version, run 12–20 outputs (estimated provider generation cost: $0.48–$0.80 at $0.04/image), then record silhouette consistency, face/hand defects, cross-era style consistency, cultural-review notes, and original-IP distance before expanding the illustrated count.

## Current public price comparison

Prices were checked against official provider pages on 11 August 2026. They can change; confirm again immediately before a paid batch.

| Option | Published unit price | 420 first passes | 420 + two revisions each (1,260 outputs) | Notes |
| --- | ---: | ---: | ---: | --- |
| Replicate FLUX 1.1 Pro | $0.040 / image | $16.80 | $50.40 | Recommended first pilot; existing backend dependency |
| Replicate FLUX dev | $0.025 / image | $10.50 | $31.50 | Lower-cost exploration |
| Ideogram 4.0 Turbo | $0.030 / image | $12.60 | $37.80 | Useful alternative; review style consistency |
| OpenAI GPT Image 1.5 medium square | $0.034 / image | $14.28 | $42.84 | Strong editing workflow; price varies by size/quality |
| OpenAI GPT Image 1.5 high square | $0.133 / image | $55.86 | $167.58 | Reserve for approved hero assets |

These estimates cover generation only. They exclude storage, background removal, upscaling, moderation, human review, retries beyond the stated allowance, and taxes.

Official sources:

- Replicate pricing: https://replicate.com/pricing
- FLUX 1.1 Pro model: https://replicate.com/black-forest-labs/flux-1.1-pro
- Ideogram API pricing: https://ideogram.ai/api-pricing
- OpenAI GPT Image 1.5: https://developers.openai.com/api/docs/models/gpt-image-1.5

## Batch stages

1. Freeze the ToonSwap style guide and forbidden-reference rules.
2. Generate 12–20 diverse pilot characters across eras and body types.
3. Review silhouette uniqueness at thumbnail size and without names/colors.
4. Review cultural context with native/community reviewers where relevant.
5. Approve a locked prompt template and model version.
6. Generate one first pass per catalog item with deterministic seeds.
7. Allow at most two targeted revisions before manual art direction.
8. Compress final web assets, retain source masters privately, and record provenance.

Never put the name of an existing cartoon, celebrity, franchise, or “make it like” instruction into a production prompt. Broad eras and genres are allowed; protected expression is not.
