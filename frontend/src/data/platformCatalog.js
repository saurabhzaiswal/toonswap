export const worlds = [
  { id: 'stone-spark', name: 'Stone Spark Valley', era: 'Stone age comedy', mark: 'ST', color: '#ff8d65', setting: 'Caves, wild orchards, first inventions', motion: 'Chunky poses and springy slapstick', prefix: 'Kobu' },
  { id: 'river-kingdoms', name: 'River Kingdoms', era: 'Ancient river fantasy', mark: 'RK', color: '#48b9a7', setting: 'Floating farms, clay cities, moon festivals', motion: 'Flowing gestures and ceremonial rhythm', prefix: 'Nira' },
  { id: 'moonlit-village', name: 'Moonlit Village', era: 'Village mystery', mark: 'MV', color: '#7152f3', setting: 'Courtyards, banyan lanes, friendly spirits', motion: 'Quiet suspense and sudden comic bursts', prefix: 'Bela' },
  { id: 'spice-port', name: 'Spice Port Stories', era: 'Seafaring folklore', mark: 'SP', color: '#f0a830', setting: 'Colorful docks, monsoon markets, talking boats', motion: 'Rolling walks and wind-led action', prefix: 'Miro' },
  { id: 'cloud-monastery', name: 'Cloud Monastery', era: 'Mountain myth', mark: 'CM', color: '#7bb2ed', setting: 'High bridges, cloud gardens, echoing bells', motion: 'Calm balance and airy martial comedy', prefix: 'Tashi' },
  { id: 'gear-garden', name: 'Gear Garden', era: 'Clockwork wonder', mark: 'GG', color: '#cf8052', setting: 'Mechanical flowers, tram towns, pocket machines', motion: 'Clicky timing and clockwork loops', prefix: 'Piko' },
  { id: 'desert-radio', name: 'Desert Radio Club', era: 'Retro adventure', mark: 'DR', color: '#e96553', setting: 'Radio towers, dune races, midnight broadcasts', motion: 'Rubber-hose bounce with modern silhouettes', prefix: 'Zuno' },
  { id: 'forest-spirits', name: 'Forest Spirit Post', era: 'Eco fantasy', mark: 'FP', color: '#53a763', setting: 'Living postboxes, seed libraries, gentle giants', motion: 'Leafy follow-through and animal-inspired acting', prefix: 'Luma' },
  { id: 'neon-metro', name: 'Neon Metro 2099', era: 'Future city comedy', mark: 'NM', color: '#e259bb', setting: 'Sky trains, hologram food stalls, helpful drones', motion: 'Sharp transitions and glitchy dance moves', prefix: 'Vexa' },
  { id: 'star-caravan', name: 'Star Caravan', era: 'Deep-space family', mark: 'SC', color: '#6859c8', setting: 'Traveling habitats, comet farms, alien kitchens', motion: 'Low-gravity arcs and cosmic scale reactions', prefix: 'Olo' },
  { id: 'dream-bazaar', name: 'Dream Bazaar', era: 'Surreal storybook', mark: 'DB', color: '#de5e78', setting: 'Memory shops, upside-down rain, singing shadows', motion: 'Shape-changing transitions and visual poetry', prefix: 'Sumi' },
  { id: 'ocean-below', name: 'Ocean Below', era: 'Undersea tomorrow', mark: 'OB', color: '#258bb9', setting: 'Reef cities, bubble buses, bioluminescent stages', motion: 'Floating curves and current-driven choreography', prefix: 'Aqua' },
];

export const archetypes = [
  { id: 'tinkerer', name: 'Tinkerer', suffix: 'bit', personality: 'Curious, resourceful, delightfully chaotic', movement: 'Fast hands and careful tiptoes' },
  { id: 'trickster', name: 'Trickster', suffix: 'wink', personality: 'Playful, clever, never cruel', movement: 'Elastic takes and mischievous pauses' },
  { id: 'guardian', name: 'Guardian', suffix: 'ram', personality: 'Protective, gentle, secretly dramatic', movement: 'Grounded weight and heroic turns' },
  { id: 'scout', name: 'Scout', suffix: 'zip', personality: 'Brave, observant, easily excited', movement: 'Quick dashes and alert poses' },
  { id: 'storyteller', name: 'Storyteller', suffix: 'tale', personality: 'Warm, imaginative, master of suspense', movement: 'Expressive hands and rhythmic beats' },
  { id: 'musician', name: 'Musician', suffix: 'rum', personality: 'Joyful, sensitive, always finds a rhythm', movement: 'Full-body groove and musical accents' },
  { id: 'healer', name: 'Healer', suffix: 'moss', personality: 'Patient, funny, connected to nature', movement: 'Soft arcs and reassuring stillness' },
  { id: 'detective', name: 'Detective', suffix: 'lens', personality: 'Observant, deadpan, confidently wrong sometimes', movement: 'Measured walks and sudden reveals' },
  { id: 'dreamer', name: 'Dreamer', suffix: 'loo', personality: 'Inventive, kind, frequently lost in thought', movement: 'Floaty timing and oversized reactions' },
  { id: 'rival', name: 'Friendly Rival', suffix: 'dash', personality: 'Competitive, loyal, secretly generous', movement: 'Confident starts and sheepish recoveries' },
  { id: 'reluctant-hero', name: 'Reluctant Hero', suffix: 'mumble', personality: 'Cautious, capable, surprised by their own courage', movement: 'Hesitant wind-ups and committed finishes' },
  { id: 'shapechanger', name: 'Shapechanger', suffix: 'morph', personality: 'Adaptable, theatrical, always experimenting', movement: 'Silhouette swaps and liquid transitions' },
  { id: 'mentor', name: 'Unusual Mentor', suffix: 'sage', personality: 'Wise, eccentric, happily imperfect', movement: 'Economical gestures and perfectly timed chaos' },
  { id: 'captain', name: 'Team Captain', suffix: 'helm', personality: 'Organised, optimistic, occasionally overprepared', movement: 'Decisive points and rallying poses' },
  { id: 'monster-friend', name: 'Monster Friend', suffix: 'bloom', personality: 'Enormous, tender, afraid of tiny noises', movement: 'Heavy landings and delicate fingertip acting' },
  { id: 'speedster', name: 'Speedster', suffix: 'flash', personality: 'Restless, helpful, learns to slow down', movement: 'Smear-frame bursts and abrupt statue-still stops' },
  { id: 'reporter', name: 'Curious Reporter', suffix: 'scoop', personality: 'Fearless, nosy, committed to the full story', movement: 'Forward-leaning walks and rapid note-taking beats' },
  { id: 'tiny-giant', name: 'Tiny Giant', suffix: 'thump', personality: 'Small in size, huge in confidence and heart', movement: 'Miniature power poses and oversized anticipation' },
];

export const characterCatalog = worlds.flatMap((world, worldIndex) => (
  archetypes.map((archetype, archetypeIndex) => ({
    id: `${world.id}-${archetype.id}`,
    name: `${world.prefix}${archetype.suffix}`,
    worldId: world.id,
    world: world.name,
    era: world.era,
    role: archetype.name,
    personality: archetype.personality,
    movement: `${world.motion}; ${archetype.movement.toLowerCase()}`,
    setting: world.setting,
    mark: `${worldIndex + 1}${String.fromCharCode(65 + archetypeIndex)}`,
    color: world.color,
    blueprintIndex: archetypeIndex,
    artIndex: archetypeIndex < 2 ? worldIndex * 2 + archetypeIndex : null,
    status: archetypeIndex < 2 ? 'art-ready' : 'concept',
  }))
));

export const voiceRegions = [
  ['bhojpuri', 'Bhojpuri', 'Purvanchal, India'],
  ['kannada', 'Kannada', 'Karnataka, India'],
  ['tamil', 'Tamil', 'Tamil Nadu, India'],
  ['bengali', 'Bengali', 'Bengal region'],
  ['punjabi', 'Punjabi', 'Punjab region'],
  ['marathi', 'Marathi', 'Maharashtra, India'],
  ['gujarati', 'Gujarati', 'Gujarat, India'],
  ['malayalam', 'Malayalam', 'Kerala, India'],
  ['telugu', 'Telugu', 'Andhra & Telangana'],
  ['hindustani', 'Hindustani', 'North India'],
  ['pidgin', 'Nigerian Pidgin', 'Nigeria'],
  ['swahili', 'Swahili', 'East Africa'],
  ['brazilian-portuguese', 'Brazilian Portuguese', 'Brazil'],
  ['mexican-spanish', 'Mexican Spanish', 'Mexico'],
  ['caribbean-english', 'Caribbean English', 'Caribbean'],
  ['levantine-arabic', 'Levantine Arabic', 'Levant'],
  ['japanese', 'Japanese', 'Japan'],
  ['korean', 'Korean', 'South Korea'],
];

export const voiceDirections = [
  ['mischief', 'Mischief Spark', 'quick, cheeky, playful', 'raised brow · held-in laugh', 'high', 'youthful'],
  ['warm-elder', 'Warm Elder', 'steady, affectionate, wise', 'soft eyes · knowing smile', 'low', 'elder'],
  ['deadpan', 'Deadpan Narrator', 'dry, precise, understated', 'straight face · tiny side-eye', 'low', 'adult'],
  ['heroic', 'Comic Hero', 'bold, sincere, energetic', 'bright eyes · brave grin', 'high', 'adult'],
  ['aunty-energy', 'Festival Host', 'bright, social, expressive', 'open smile · welcoming hands', 'high', 'adult'],
  ['soft-story', 'Bedtime Storyteller', 'gentle, intimate, calm', 'kind gaze · quiet wonder', 'soft', 'adult'],
  ['street-poet', 'Street Poet', 'rhythmic, clever, grounded', 'focused eyes · half-smile', 'medium', 'young adult'],
  ['curious-kid', 'Curious Youth', 'wonder-filled, fast, lively', 'wide eyes · delighted gasp', 'high', 'youthful'],
  ['village-radio', 'Village Radio', 'conversational, warm, witty', 'friendly squint · ready laugh', 'medium', 'adult'],
  ['future-guide', 'Future Guide', 'clean, optimistic, focused', 'calm focus · hopeful smile', 'medium', 'ageless'],
  ['musical', 'Musical Comic', 'melodic, bouncy, performance-led', 'singing joy · rhythmic bounce', 'high', 'all ages'],
  ['mystery', 'Mystery Whisper', 'suspenseful, textured, restrained', 'alert eyes · secretive pause', 'soft', 'adult'],
];

const liveVoices = [
  { id: 'bhojpuri-comedy-uncle', name: 'Mast Uncle', language: 'Bhojpuri', region: 'Purvanchal, India', direction: 'Warm, witty, cheeky', status: 'live' },
  { id: 'bhojpuri-funny-aunty', name: 'Fun Aunty', language: 'Bhojpuri', region: 'Purvanchal, India', direction: 'Bold, bright, playful', status: 'live' },
  { id: 'kannada-funny-boy', name: 'Funny Huduga', language: 'Kannada', region: 'Karnataka, India', direction: 'Quick, youthful, lively', status: 'live' },
  { id: 'kannada-comedy-thatha', name: 'Comedy Thatha', language: 'Kannada', region: 'Karnataka, India', direction: 'Dry, lovable, measured', status: 'live' },
];

const roadmapVoices = voiceRegions.flatMap(([regionId, language, region], regionIndex) => (
  voiceDirections.map(([directionId, name, direction, expressionCue, energy, ageFeel], directionIndex) => ({
    id: `${regionId}-${directionId}`,
    name,
    language,
    region,
    direction,
    expressionCue,
    energy,
    ageFeel,
    status: regionIndex < 4 && directionIndex < 2 ? 'planned' : 'research',
  }))
));

export const voiceCatalog = [
  ...liveVoices,
  ...roadmapVoices.filter((voice) => !liveVoices.some((live) => live.id === voice.id)),
].map((voice, index) => {
  const directionIndex = voiceDirections.findIndex(([directionId]) => voice.id.endsWith(directionId));
  const directionMeta = voiceDirections[Math.max(0, directionIndex)] || voiceDirections[0];
  return {
    expressionCue: directionMeta[3], energy: directionMeta[4], ageFeel: directionMeta[5],
    ...voice,
    artIndex: index < 4 ? index : Math.max(0, directionIndex),
  };
});

export const languageSamples = [
  'Hindi', 'Bhojpuri', 'Kannada', 'Tamil', 'Telugu', 'Bengali', 'Punjabi', 'Marathi',
  'Gujarati', 'Malayalam', 'Urdu', 'English', 'Spanish', 'Portuguese', 'Arabic', 'Swahili',
  'French', 'German', 'Japanese', 'Korean', 'Indonesian', 'Thai', 'Turkish', 'Vietnamese',
];

const blogPostDrafts = [
  {
    slug: 'original-characters-without-copying',
    category: 'Original IP',
    title: 'How to build nostalgic cartoon energy without copying a famous character',
    excerpt: 'A practical framework for creating fresh silhouettes, motivations, worlds, movement rules, and voices that belong to you.',
    readTime: '7 min read',
    color: '#ff8d65',
    cover: '/art/blog/original-characters-without-copying.jpg',
    sections: [
      ['Start with a human truth, not a reference', 'Choose a relatable tension—sibling rivalry, an invention gone wrong, a village rumour, first-day nerves—and build outward. A character becomes original through their specific wants, flaws, relationships, silhouette, movement, and world rules.'],
      ['Design a movement signature', 'Give every character three repeatable physical ideas: how they enter, how they react, and how they recover. Movement is identity, so it should come from the character’s body and temperament rather than another show.'],
      ['Run a distance test', 'Remove the name and colour. If viewers still identify a protected character or franchise, the design is too close. Redesign the silhouette, role, relationships, setting, powers, props, and performance together—not just one surface detail.'],
    ],
  },
  {
    slug: 'directing-comedy-across-languages',
    category: 'Voice & culture',
    title: 'Why translating words is not enough for comedy across languages',
    excerpt: 'Timing, relationships, politeness, rhythm, and local context matter as much as vocabulary.',
    readTime: '6 min read',
    color: '#48b9a7',
    cover: '/art/blog/directing-comedy-across-languages.jpg',
    sections: [
      ['Comedy lives in context', 'A literal translation may preserve meaning while losing status, rhythm, or warmth. Native review should shape the premise, phrasing, pauses, and performance direction.'],
      ['Accents are not costumes', 'Build original voices with clear consent and direction. Avoid exaggerating communities into stereotypes or copying a recognisable performer.'],
      ['Label confidence honestly', 'Separate live, reviewed languages from experimental coverage. Let creators see what was reviewed, what model was used, and where human checking is recommended.'],
    ],
  },
  {
    slug: 'scene-by-scene-animation-workflow',
    category: 'Story craft',
    title: 'A scene-by-scene workflow for turning one prompt into a complete cartoon story',
    excerpt: 'Plan cast, beats, camera, action, dialogue, voice direction, and continuity before rendering expensive video.',
    readTime: '8 min read',
    color: '#7152f3',
    cover: '/art/blog/scene-by-scene-animation-workflow.jpg',
    sections: [
      ['Outline before rendering', 'Break the story into short beats with one clear purpose each. Lock the cast, location, visual era, and emotional change before generating frames.'],
      ['Treat every scene as editable', 'Store dialogue, action, camera, duration, voice direction, and continuity notes separately. A creator should be able to change scene four without rebuilding the entire film.'],
      ['Keep versions', 'Save drafts before each render. Track the prompt, character version, voice settings, model settings, and output so changes are explainable and reversible.'],
    ],
  },
  {
    slug: 'consent-first-family-stories', category: 'Safety', title: 'A consent-first checklist for family cartoon stories', excerpt: 'How to use relatives’ photos and voices respectfully, with permission and clear controls.', readTime: '5 min read', color: '#ffc94a', sections: [['Permission comes first', 'Every identifiable person should understand how their photo or voice will be transformed, where the result may be shared, and how long source media is retained.'], ['Minors need stronger protection', 'Use a deliberate age gate and verified parental or guardian consent before processing a child’s media.'], ['Make deletion easy', 'Creators need a simple way to delete source uploads, generated media, and saved identity assets.']],
  },
  {
    slug: 'designing-stone-to-space-worlds', category: 'World building', title: 'Designing original cartoon worlds from stone age to deep space', excerpt: 'Use materials, tools, social rules, motion, sound, and comedy problems to make each era distinct.', readTime: '7 min read', color: '#e259bb', sections: [['World rules create stories', 'Define what is scarce, what is normal, what technology exists, and what characters misunderstand.'], ['Mix principles, not protected designs', 'You can combine broad genres such as folklore mystery and future comedy. Do not combine recognisable characters, costumes, symbols, creatures, or lore from protected franchises.'], ['Let sound carry the era', 'Build an original sound palette from materials and environments: stone taps, bamboo creaks, market calls, clockwork ticks, or synthetic city hums.']],
  },
  {
    slug: 'one-hour-animation-cost-plan', category: 'Production', title: 'Why a one-hour AI cartoon needs a render and cost plan', excerpt: 'Long-form generation requires shot budgeting, resumable queues, versioned assets, moderation, and predictable spend.', readTime: '9 min read', color: '#258bb9', sections: [['Think in shots', 'A one-hour film should be assembled from short, independently retryable shots rather than generated as one job.'], ['Cache expensive work', 'Character references, voices, backgrounds, and approved shots should be reusable across versions.'], ['Protect the budget', 'Estimate every provider call, require confirmation before long renders, set account limits, and stop queues when spend thresholds are reached.']],
  },
];

export const blogPosts = blogPostDrafts.map((post) => ({
  ...post,
  cover: post.cover || `/art/blog/${post.slug}.jpg`,
}));
