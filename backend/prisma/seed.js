const { PrismaClient, CatalogStatus } = require('@prisma/client');

const prisma = new PrismaClient();

const worlds = [
  ['stone-spark', 'Stone Spark Valley', 'Stone age comedy', 'Kobu'], ['river-kingdoms', 'River Kingdoms', 'Ancient river fantasy', 'Nira'],
  ['moonlit-village', 'Moonlit Village', 'Village mystery', 'Bela'], ['spice-port', 'Spice Port Stories', 'Seafaring folklore', 'Miro'],
  ['cloud-monastery', 'Cloud Monastery', 'Mountain myth', 'Tashi'], ['gear-garden', 'Gear Garden', 'Clockwork wonder', 'Piko'],
  ['desert-radio', 'Desert Radio Club', 'Retro adventure', 'Zuno'], ['forest-spirits', 'Forest Spirit Post', 'Eco fantasy', 'Luma'],
  ['neon-metro', 'Neon Metro 2099', 'Future city comedy', 'Vexa'], ['star-caravan', 'Star Caravan', 'Deep-space family', 'Olo'],
  ['dream-bazaar', 'Dream Bazaar', 'Surreal storybook', 'Sumi'], ['ocean-below', 'Ocean Below', 'Undersea tomorrow', 'Aqua'],
];
const roles = [
  ['tinkerer', 'Tinkerer', 'bit', 'Curious, resourceful, delightfully chaotic', 'Fast hands and careful tiptoes'],
  ['trickster', 'Trickster', 'wink', 'Playful, clever, never cruel', 'Elastic takes and mischievous pauses'],
];
const languages = [
  ['bhojpuri', 'Bhojpuri', 'Purvanchal, India'], ['kannada', 'Kannada', 'Karnataka, India'], ['tamil', 'Tamil', 'Tamil Nadu, India'],
  ['bengali', 'Bengali', 'Bengal region'], ['punjabi', 'Punjabi', 'Punjab region'], ['marathi', 'Marathi', 'Maharashtra, India'],
  ['gujarati', 'Gujarati', 'Gujarat, India'], ['malayalam', 'Malayalam', 'Kerala, India'], ['telugu', 'Telugu', 'Andhra & Telangana'],
  ['hindustani', 'Hindustani', 'North India'], ['pidgin', 'Nigerian Pidgin', 'Nigeria'], ['swahili', 'Swahili', 'East Africa'],
  ['pt-br', 'Brazilian Portuguese', 'Brazil'], ['es-mx', 'Mexican Spanish', 'Mexico'], ['en-caribbean', 'Caribbean English', 'Caribbean'],
  ['ar-levant', 'Levantine Arabic', 'Levant'], ['ja', 'Japanese', 'Japan'], ['ko', 'Korean', 'South Korea'],
];
const directions = [
  ['mischief', 'Mischief Spark', 'quick, cheeky, playful'], ['warm-elder', 'Warm Elder', 'steady, affectionate, wise'],
  ['deadpan', 'Deadpan Narrator', 'dry, precise, understated'], ['heroic', 'Comic Hero', 'bold, sincere, energetic'],
  ['festival', 'Festival Host', 'bright, social, expressive'], ['bedtime', 'Bedtime Storyteller', 'gentle, intimate, calm'],
  ['street-poet', 'Street Poet', 'rhythmic, clever, grounded'], ['curious-youth', 'Curious Youth', 'wonder-filled, fast, lively'],
  ['village-radio', 'Village Radio', 'conversational, warm, witty'], ['future-guide', 'Future Guide', 'clean, optimistic, focused'],
  ['musical', 'Musical Comic', 'melodic, bouncy, performance-led'], ['mystery', 'Mystery Whisper', 'suspenseful, textured, restrained'],
];
const liveVoices = [
  ['bhojpuri-comedy-uncle', 'Mast Uncle', 'bhojpuri', 'Bhojpuri', 'Purvanchal, India', 'warm, witty, cheeky'],
  ['bhojpuri-funny-aunty', 'Fun Aunty', 'bhojpuri', 'Bhojpuri', 'Purvanchal, India', 'bold, bright, playful'],
  ['kannada-funny-boy', 'Funny Huduga', 'kannada', 'Kannada', 'Karnataka, India', 'quick, youthful, lively'],
  ['kannada-comedy-thatha', 'Comedy Thatha', 'kannada', 'Kannada', 'Karnataka, India', 'dry, lovable, measured'],
];

async function seed() {
  const characters = worlds.flatMap(([worldId, worldName, era, prefix], worldIndex) => roles.map(([roleId, role, suffix, personality, movement], roleIndex) => ({
    id: `${worldId}-${roleId}`, slug: `${worldId}-${roleId}`, name: `${prefix}${suffix}`, worldId, worldName, era, archetype: role,
    personality, movementStyle: { signature: movement }, visualBrief: { atlas: '/art/character-atlas.png', artIndex: worldIndex * 2 + roleIndex },
    imageUrl: '/art/character-atlas.png', tags: [era, role], status: CatalogStatus.LIVE,
  })));
  const roadmapVoices = languages.flatMap(([languageCode, languageName, region], languageIndex) => directions.map(([directionId, name, direction], directionIndex) => ({
    id: `${languageCode}-${directionId}`, slug: `${languageCode}-${directionId}`, name, languageCode, languageName, region, direction,
    emotionalRange: direction.split(', '), providerMetadata: { artIndex: directionIndex },
    status: languageIndex < 4 && directionIndex < 2 ? CatalogStatus.PLANNED : CatalogStatus.RESEARCH,
  })));
  const workingVoices = liveVoices.map(([slug, name, languageCode, languageName, region, direction], index) => ({
    id: slug, slug, name, languageCode, languageName, region, direction, emotionalRange: direction.split(', '),
    providerMetadata: { artIndex: index, requiresOwnedProviderVoiceId: true }, status: CatalogStatus.LIVE,
  }));

  await Promise.all(characters.map((data) => prisma.character.upsert({ where: { slug: data.slug }, update: data, create: data })));
  await Promise.all([...workingVoices, ...roadmapVoices].map((data) => prisma.voiceProfile.upsert({ where: { slug: data.slug }, update: data, create: data })));
  console.log(`Seeded ${characters.length} illustrated characters and ${workingVoices.length + roadmapVoices.length} voice profiles.`);
}

seed().finally(() => prisma.$disconnect());
