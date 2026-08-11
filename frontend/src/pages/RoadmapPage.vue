<script setup>
import PlatformPageShell from '../components/PlatformPageShell.vue';

const journey = [
  { number: '01', title: 'Choose a world', text: 'Pick an original era and visual feeling—from prehistoric invention comedy to a future eco-city.', state: 'Available in UI' },
  { number: '02', title: 'Build the cast', text: 'Choose art-ready originals or save a custom character brief with its own silhouette and movement.', state: 'Available in UI' },
  { number: '03', title: 'Tell the story', text: 'Type or speak one idea. The planner turns it into editable scenes in the language you understand best.', state: 'Local planner prototype' },
  { number: '04', title: 'Direct every voice', text: 'Choose language, regional context, expression, pace, warmth, or a voice you have permission to use.', state: '4 directions live · 200+ roadmap' },
  { number: '05', title: 'Approve production', text: 'Review originality, consent, moderation, duration, provider cost, captions, and every planned shot.', state: 'Backend gates in progress' },
  { number: '06', title: 'Render and revise', text: 'Generate short retryable shots, then replace only video, voice, background, movement, or one scene.', state: 'Provider integration required' },
];

const phases = [
  { name: 'Foundation', status: 'Now', class: 'now', points: ['Custom accessible UI system', 'Pinia project drafts', '24 illustrated originals + 108 blueprints', '220 structured voice profiles', 'Project / scene / voice database model'] },
  { name: 'Intelligence', status: 'Next', class: 'next', points: ['Moderated multilingual story planner', 'Native language review workflow', 'Character consistency references', 'Consent records and identity deletion', 'Per-shot cost estimator'] },
  { name: 'Production', status: 'Then', class: 'later', points: ['Resumable render queue', 'Voice, music, captions as separate layers', 'Partial scene regeneration', 'Version history and restore', '15-second to 60-minute assembly'] },
  { name: 'Worldwide launch', status: 'Scale', class: 'scale', points: ['200+ reviewed language records', 'Regional creator programs', 'Cultural QA and community reports', 'Team collaboration', 'Export and publishing controls'] },
];
</script>

<template>
  <PlatformPageShell eyebrow="From idea to finished cartoon" title="See exactly how ToonSwap will make your video." description="A transparent build plan for an original, multilingual animation studio. The interface can be playful; the production pipeline must still be safe, editable, resumable, and honest." accent="#ffc94a" stat="6 clear steps" status="Living roadmap · UI foundation working · generation providers not connected yet">
    <template #hero-media><div class="roadmap-gif"><img src="/art/video-journey.gif" alt="Animated six-step journey from choosing a world to editing a finished cartoon" /><span>Looping product journey</span></div></template>

    <section class="journey-section section-pad">
      <header><p class="kicker">How you will make a video</p><h2>Big choices first. Tiny controls only when needed.</h2><p>A ten-year-old can follow the six steps. An experienced creator can open advanced controls for camera, continuity, audio layers, and partial regeneration.</p></header>
      <div class="journey-grid"><article v-for="item in journey" :key="item.number"><span>{{ item.number }}</span><h3>{{ item.title }}</h3><p>{{ item.text }}</p><small>{{ item.state }}</small></article></div>
      <RouterLink class="start-link" to="/story-studio">Try the guided Story Studio <span>→</span></RouterLink>
    </section>

    <section class="architecture-section section-pad">
      <div class="architecture-copy"><p class="kicker">Editable by design</p><h2>One story, separate replaceable layers.</h2><p>ToonSwap does not treat an hour-long film as one giant AI request. A project is broken into scenes and shots, while character, movement, voice, music, captions, camera, and continuity remain independently versioned.</p></div>
      <div class="layer-stack" aria-label="Replaceable video production layers"><span class="scene">Scene plan <i>what happens</i></span><span class="visual">Visual shot <i>background + camera</i></span><span class="motion">Character motion <i>pose + expression</i></span><span class="voice">Voice track <i>language + feeling</i></span><span class="sound">Music and sound <i>licensed or original</i></span><span class="caption">Captions <i>editable translation</i></span></div>
    </section>

    <section class="phases-section section-pad">
      <header><p class="kicker">Build roadmap</p><h2>What works now—and what still needs engineering.</h2><p>No “AI magic” label is used to hide missing infrastructure. Public launch requires provider adapters, moderation, native review, cost approval, secure storage, and resumable jobs.</p></header>
      <div class="phase-grid"><article v-for="phase in phases" :key="phase.name" :class="phase.class"><div><span>{{ phase.status }}</span><h3>{{ phase.name }}</h3></div><ul><li v-for="point in phase.points" :key="point">{{ point }}</li></ul></article></div>
    </section>

    <section class="guardrails section-pad"><div><p class="kicker">Non-negotiable</p><h2>Worldwide does not mean careless.</h2></div><div class="guardrail-grid"><article><span>◎</span><h3>Original IP only</h3><p>No duplicate cartoon identities, confusing lookalikes, copied logos, costumes, voices, lore, or franchise prompts.</p></article><article><span>♡</span><h3>Consent before identity</h3><p>A person’s photo or voice is processed only with informed permission and stronger safeguards for minors.</p></article><article><span>文</span><h3>Native review</h3><p>Language availability is labeled honestly. Regional humor and accents need human cultural review before launch.</p></article><article><span>₹</span><h3>Cost before render</h3><p>Creators see an estimate and approve long-form generation before paid provider work begins.</p></article></div></section>
  </PlatformPageShell>
</template>

<style scoped lang="scss">
@use '../styles/tokens' as *;
.roadmap-gif { position: relative; width: min(380px, 32vw); overflow: hidden; border: 7px solid white; border-radius: 30px; box-shadow: $shadow-lift; transform: rotate(2deg); }.roadmap-gif img { display: block; width: 100%; aspect-ratio: 1; object-fit: cover; }.roadmap-gif span { position: absolute; right: 15px; bottom: 15px; padding: 8px 11px; border-radius: 30px; color: $ink; background: $gold; font-size: .74rem; font-weight: 900; }
.journey-section, .architecture-section, .phases-section, .guardrails { max-width: 1540px; margin: 0 auto; padding-top: clamp(75px, 9vw, 135px); padding-bottom: clamp(75px, 9vw, 135px); }.journey-section > header, .phases-section > header { max-width: 920px; margin-bottom: 38px; }.journey-section h2, .architecture-copy h2, .phases-section h2, .guardrails h2 { margin: 7px 0 15px; font-size: var(--type-h2); line-height: 1.02; letter-spacing: -.045em; }.journey-section header > p, .architecture-copy > p, .phases-section header > p { margin: 0; color: $muted; font-size: var(--type-body); line-height: 1.65; }
.journey-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }.journey-grid article { @include panel; display: grid; align-content: start; min-height: 270px; padding: 26px; }.journey-grid article > span { display: grid; place-items: center; width: 45px; height: 45px; border-radius: 14px; color: white; background: $ink; font-weight: 900; }.journey-grid h3 { margin: 28px 0 8px; font-size: 1.55rem; letter-spacing: -.03em; }.journey-grid p { margin: 0; color: $muted; line-height: 1.55; }.journey-grid small { align-self: end; margin-top: 20px; color: $violet; font-size: .76rem; font-weight: 900; text-transform: uppercase; }.start-link { display: inline-flex; align-items: center; gap: 10px; min-height: 54px; margin-top: 28px; padding: 14px 21px; border: 1.5px solid $ink; border-radius: 15px; color: $ink; background: $gold; font-weight: 900; text-decoration: none; box-shadow: 0 10px 24px rgba(23,19,33,.1); }.start-link:hover { transform: translateY(-2px); }.start-link:focus-visible { @include focus-ring; }
.architecture-section { display: grid; grid-template-columns: .85fr 1.15fr; gap: clamp(45px, 8vw, 120px); align-items: center; border-top: 1px solid $line; }.layer-stack { display: grid; gap: 9px; padding: 25px; border-radius: $radius-lg; background: $ink; transform: rotate(-1deg); box-shadow: $shadow-lift; }.layer-stack span { display: flex; justify-content: space-between; gap: 20px; padding: 18px 20px; border-radius: 15px; color: $ink; font-weight: 900; box-shadow: 0 5px 16px rgba(0,0,0,.2); }.layer-stack i { opacity: .7; font-style: normal; font-size: .78rem; }.layer-stack .scene { background: $gold; }.layer-stack .visual { background: #ff8d65; }.layer-stack .motion { background: #88ddaf; }.layer-stack .voice { background: #73d6ca; }.layer-stack .sound { background: #c1b2ff; }.layer-stack .caption { background: white; }
.phases-section { border-top: 1px solid $line; }.phase-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }.phase-grid article { overflow: hidden; border: 1px solid $line; border-radius: $radius-md; background: white; }.phase-grid article > div { padding: 24px; background: var(--phase); }.phase-grid span { padding: 7px 9px; border-radius: 30px; color: white; background: $ink; font-size: .7rem; font-weight: 900; text-transform: uppercase; }.phase-grid h3 { margin: 18px 0 0; font-size: 1.5rem; }.phase-grid ul { display: grid; gap: 11px; margin: 0; padding: 24px 24px 27px 44px; color: $muted; }.phase-grid li { padding-left: 3px; line-height: 1.45; }.phase-grid .now { --phase: #b8ebdf; }.phase-grid .next { --phase: #ffdf7e; }.phase-grid .later { --phase: #c8bcff; }.phase-grid .scale { --phase: #ffb19c; }
.guardrails { display: grid; grid-template-columns: .65fr 1.35fr; gap: 60px; border-top: 1px solid $line; }.guardrail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }.guardrail-grid article { padding: 24px; border-radius: $radius-md; background: #f1ebe3; }.guardrail-grid span { color: $coral; font-size: 1.8rem; font-weight: 900; }.guardrail-grid h3 { margin: 18px 0 7px; font-size: 1.25rem; }.guardrail-grid p { margin: 0; color: $muted; line-height: 1.55; }
.roadmap-gif span, .journey-grid small, .phase-grid span { font-size: .8rem; }
@media (max-width: 1050px) { .phase-grid { grid-template-columns: repeat(2, 1fr); }.architecture-section, .guardrails { grid-template-columns: 1fr; }.layer-stack { max-width: 720px; }.journey-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 650px) { .roadmap-gif { width: 100%; }.journey-grid, .phase-grid, .guardrail-grid { grid-template-columns: 1fr; }.journey-grid article { min-height: 230px; }.layer-stack { padding: 15px; }.layer-stack span { display: grid; gap: 4px; } }
</style>
