<script setup>
import { computed } from 'vue';
import PlatformPageShell from '../components/PlatformPageShell.vue';

const props = defineProps({ documentKey: { type: String, required: true } });

const documents = {
  privacy: {
    eyebrow: 'Privacy policy',
    title: 'Your face and voice deserve serious care.',
    accent: '#48b9a7',
    summary:
      'This page explains how the current ToonSwap account beta handles identity, profile, creator, and consented media data. Market-specific legal review is still required before a broad commercial launch.',
    warning:
      'Age thresholds and generation windows are deployment policies, not guesses in code. Creation fails closed until the operator configures them; children must not upload media without the legally required guardian flow.',
    sections: [
      [
        '1. What ToonSwap handles',
        [
          'Account email, verified sign-in identity, opaque UUIDv7 records, security sessions, hashed network signals, and last-seen timestamps.',
          'Private profile fields: display name, date of birth, city, country code, locale, timezone, and optional profile picture.',
          'Selfies and other images you choose to upload.',
          'Voice recordings, typed scripts, story prompts, character briefs, dialogue, and scene instructions.',
          'Generated previews, provider outputs, processing status, and error details.',
          'Basic traffic and device information collected through Vercel Web Analytics when enabled.',
        ],
      ],
      [
        '2. Why the data is used',
        [
          'To create the cartoon video or storyboard you request.',
          'To store job state, process queued work, diagnose failures, prevent abuse, and control provider costs.',
          'To improve product reliability using aggregated usage patterns.',
          'To meet safety, fraud-prevention, legal, and rights-protection obligations.',
        ],
      ],
      [
        '3. Processors and transfers',
        [
          'The current architecture may send necessary inputs to Replicate for visual processing, ElevenLabs for original voice generation or consented speech conversion, S3-compatible storage such as Cloudflare R2, hosting providers, PostgreSQL, and Redis.',
          'Provider production terms, data-use settings, retention, training settings, subprocessors, and cross-border transfer safeguards must be reviewed and documented before launch.',
          'Do not include secrets, financial records, medical information, identity documents, or media you are not authorised to process.',
        ],
      ],
      [
        '4. Faces, voices, and family media',
        [
          'Upload only your own media or media covered by explicit, informed permission.',
          'Photos, video, and voice recordings of children require heightened protection. ToonSwap must not knowingly collect a child’s face or voice without the legally required parent or guardian process.',
          'A creator’s promise alone may not satisfy applicable verifiable consent requirements; the production service needs an age and consent workflow.',
        ],
      ],
      [
        '5. Retention and deletion',
        [
          'Self-insert source media is assigned a 24-hour expiry and an automated purge job; provider and queue deletion must still be verified in each deployed environment.',
          'The profile page includes permanent account deletion. It removes the account database record and attempts to delete related profile, selfie, voice, reference, and generated media from configured storage.',
          'Backups, security audit records, and provider copies may follow separate legally permitted retention periods; the operator must document those before commercial launch.',
        ],
      ],
      [
        '6. Security',
        [
          'Secrets belong only in server-side secret managers.',
          'Authentication uses one-time email codes or verified Google identity tokens. Session cookies are opaque and httpOnly; unsafe requests require a separate CSRF token. One-time codes are hashed, expiring, single-use, rate-limited, and never stored as plaintext.',
          'Production access should use Secure cookies, least-privilege credentials, encrypted connections, private networking where available, signed media URLs, audit logs, and incident response procedures.',
          'No internet service is risk-free; avoid uploading media whose exposure would create unacceptable harm.',
        ],
      ],
      [
        '7. Your choices and rights',
        [
          'Depending on location, people may have rights to access, correct, delete, restrict, object to, or receive information about their personal data.',
          'Authenticated people can correct profile details and permanently delete their account from the profile page. A verified privacy contact and request-verification process must also be published before production launch.',
          'If a person withdraws permission for their face or voice, future use should stop and applicable stored assets should be removed.',
        ],
      ],
      [
        '8. Children',
        [
          'The beta is not ready for child-directed launch and does not guess a universal age threshold.',
          'A deployment operator must configure the supported self-service age after legal review. Accounts below that threshold are locked for generation until a verified guardian workflow is implemented.',
          'Age thresholds and consent rules vary by country; qualified counsel must set the supported policy and guardian experience.',
        ],
      ],
    ],
  },
  terms: {
    eyebrow: 'Terms of use draft',
    title: 'Create freely. Respect people and original work.',
    accent: '#7152f3',
    summary:
      'These draft terms define the intended rules for ToonSwap. They are not a substitute for market-specific legal review and do not activate paid services or production promises that are not yet built.',
    warning:
      'The current beta uses third-party AI and storage services and is provided for controlled testing. Provider availability, output quality, generation time, language coverage, and long-form rendering are not guaranteed.',
    sections: [
      [
        '1. Eligibility',
        [
          'You must create an account and provide accurate eligibility information before using creator tools.',
          'The deployment operator sets the supported self-service age after legal review; creation is unavailable while that policy is unconfigured.',
          'People below the configured threshold may not generate until an appropriate verified guardian-consent workflow is implemented.',
        ],
      ],
      [
        '2. Your permissions and responsibilities',
        [
          'You must own or have sufficient permission for every face, voice, image, script, song, character, brand, and other input you submit.',
          'Permission must cover AI transformation, provider processing, storage, generation, download, and your intended sharing.',
          'You are responsible for reviewing an output before publishing or relying on it.',
        ],
      ],
      [
        '3. Original-IP rule',
        [
          'Do not request or create copies, confusingly similar substitutes, mashups, or disguised versions of protected cartoon characters, franchises, logos, costumes, signature props, creatures, plots, or visual identities.',
          'Do not clone or imitate a celebrity, actor, public figure, private person, or recognisable copyrighted character performance.',
          'Broad ideas such as stone-age comedy, village mystery, family adventure, friendly ghosts, future technology, or musical storytelling are allowed only when the resulting expression is independently original.',
        ],
      ],
      [
        '4. Prohibited use',
        [
          'No deception, impersonation, fraud, harassment, defamation, threats, hate, sexual exploitation, non-consensual intimate content, grooming, or dangerous instructions.',
          'No processing of a child’s image or voice without the legally required guardian process.',
          'No attempts to bypass moderation, rate limits, payment rules, retention, watermarking, provider safeguards, or technical restrictions.',
          'No copyrighted song lyrics, recordings, or compositions unless you have the required rights.',
        ],
      ],
      [
        '5. Outputs and ownership',
        [
          'You retain rights you already hold in your inputs.',
          'Rights in AI-assisted outputs vary by law, provider terms, originality, and included material; ToonSwap does not promise exclusive copyright in every output.',
          'ToonSwap-owned character designs, branding, templates, and software remain ToonSwap property unless a separate written licence says otherwise.',
          'You receive only the usage rights explicitly attached to the selected original asset or paid product.',
        ],
      ],
      [
        '6. Availability, payment, and refunds',
        [
          'The free-preview and paid-download model remains under development. Pricing, licences, day passes, refund rules, and taxes must be shown before checkout.',
          'Payment status must be based only on verified, idempotent payment-provider confirmation.',
          'Long renders may require a cost estimate and explicit approval before processing.',
        ],
      ],
      [
        '7. Enforcement',
        [
          'ToonSwap may reject prompts, stop jobs, remove content, restrict access, or preserve evidence when needed for safety, rights protection, legal compliance, or platform integrity.',
          'Repeated or severe violations may lead to account blocking. Blocking immediately revokes active sessions and administrative changes are audit logged.',
        ],
      ],
      [
        '8. Disclaimers and liability',
        [
          'AI outputs may contain errors, artefacts, mistranslations, cultural mistakes, or unexpected similarities. Human review is required.',
          'The beta is provided as available without a guarantee of uninterrupted service or fitness for a particular purpose, to the extent permitted by law.',
          'Final governing-law, dispute, warranty, and liability clauses require qualified legal review before commercial launch.',
        ],
      ],
    ],
  },
  community: {
    eyebrow: 'Community guidelines',
    title: 'Make the joke kind. Make the world yours.',
    accent: '#ff624d',
    summary:
      'ToonSwap is for joyful, original storytelling across languages and cultures. These guidelines apply to prompts, uploads, characters, voices, scenes, songs, outputs, titles, and sharing.',
    warning:
      'A renamed copy is still a copy. If an ordinary viewer would immediately identify a protected character, celebrity, actor, private person, or franchise, redesign the concept before creating.',
    sections: [
      [
        '1. Build original worlds',
        [
          'Start from human experiences, broad eras, genres, places, materials, and emotions.',
          'Create a distinct silhouette, personality, movement signature, relationships, props, lore, costume logic, colour system, and voice direction.',
          'Do not use “make it like,” misspelled names, near-identical outfits, signature powers, recognisable creatures, franchise symbols, or prompts intended to evade IP safeguards.',
        ],
      ],
      [
        '2. Respect real people',
        [
          'Get explicit permission before transforming somebody’s face or voice.',
          'Never present synthetic media as proof of something that happened.',
          'Do not impersonate politicians, celebrities, actors, creators, teachers, colleagues, relatives, or private people.',
          'Clearly label AI-assisted media when context could confuse viewers.',
        ],
      ],
      [
        '3. Protect children',
        [
          'Do not upload a child’s image or voice without the legally required parent or guardian process.',
          'Never sexualise, exploit, frighten, manipulate, identify, locate, or shame a child.',
          'Family stories involving minors should be private by default and reviewed by the responsible adult before sharing.',
        ],
      ],
      [
        '4. Tell stories without abuse',
        [
          'Friendly ghosts, folklore, action, suspense, and slapstick can be fun; graphic violence, sexual content involving minors, hateful dehumanisation, and targeted humiliation are not.',
          'Do not use a cultural accent, dress, religion, disability, caste, race, gender, nationality, or community as the punchline.',
          'Native context and review matter more than literal translation.',
        ],
      ],
      [
        '5. Music and voice',
        [
          'Create original lyrics and melodies or use properly licensed material.',
          'Do not upload commercial songs or reproduce protected lyrics without rights.',
          'Use original voice designs or your own consented voice; never clone a recognisable performer.',
        ],
      ],
      [
        '6. Enforcement and appeals',
        [
          'Content may be blocked before generation or removed after review.',
          'Severe violations may be reported where legally required.',
          'Before public launch, ToonSwap must publish reporting, appeal, rights-holder notice, and counter-notice channels with response targets.',
        ],
      ],
    ],
  },
};

const document = computed(() => documents[props.documentKey] || documents.community);
</script>

<template>
  <PlatformPageShell
    :eyebrow="document.eyebrow"
    :title="document.title"
    :description="document.summary"
    :accent="document.accent"
    stat="Draft · August 2026"
    status="Requires qualified legal review before public launch"
  >
    <section class="legal-section section-pad">
      <div class="legal-warning">
        <span>Important</span>
        <p>{{ document.warning }}</p>
      </div>
      <div class="legal-layout">
        <nav aria-label="Document contents">
          <strong>On this page</strong
          ><a
            v-for="section in document.sections"
            :key="section[0]"
            :href="`#legal-${section[0].slice(0, 1)}`"
            >{{ section[0] }}</a
          >
          <div>
            <b>Effective date</b><span>Not yet effective — draft</span><b>Last updated</b
            ><span>11 August 2026</span>
          </div>
        </nav>
        <article>
          <section
            v-for="section in document.sections"
            :id="`legal-${section[0].slice(0, 1)}`"
            :key="section[0]"
          >
            <h2>{{ section[0] }}</h2>
            <ul>
              <li v-for="item in section[1]" :key="item">{{ item }}</li>
            </ul>
          </section>
          <section class="legal-sources">
            <h2>Reference points for launch review</h2>
            <p>
              Children’s face and voice data can receive special legal protection. Review the
              <a
                href="https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions"
                target="_blank"
                rel="noreferrer"
                >FTC COPPA guidance</a
              >, India’s
              <a
                href="https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf"
                target="_blank"
                rel="noreferrer"
                >Digital Personal Data Protection Act</a
              >, provider terms, and the rules in every supported market with qualified counsel.
            </p>
          </section>
        </article>
      </div>
    </section>
  </PlatformPageShell>
</template>
