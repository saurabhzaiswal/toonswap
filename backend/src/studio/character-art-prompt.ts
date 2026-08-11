export type CharacterArtBrief = {
  name: string;
  world: string;
  era: string;
  role: string;
  personality: string;
  movement: string;
  setting: string;
  palette: string;
};

export type VoiceAvatarBrief = {
  persona: string;
  region: string;
  expression: string;
  energy: string;
  ageFeel: string;
};

const sharedStyleGuide = [
  'brand-new original ToonSwap character design',
  'friendly editorial 2D animation concept art',
  'bold readable silhouette, expressive face, tactile painted texture',
  'family-friendly, culturally respectful, production-ready character sheet lighting',
  'no text, no logos, no celebrity likeness, no copyrighted character, no franchise costume, no lookalike',
].join(', ');

export function buildCharacterArtPrompt(brief: CharacterArtBrief) {
  return `${sharedStyleGuide}. ${brief.name} is an original ${brief.role} from ${brief.world}, a ${brief.era} setting. Personality: ${brief.personality}. Movement signature: ${brief.movement}. Environment cues: ${brief.setting}. Key palette: ${brief.palette}. Full-body three-quarter pose, clean isolated background, consistent proportions, clear hands and face.`;
}

export function buildVoiceAvatarPrompt(brief: VoiceAvatarBrief) {
  return `${sharedStyleGuide}. Original fictional voice-direction portrait called ${brief.persona}. Cultural context: ${brief.region}; do not stereotype clothing, facial features, or props. Expression: ${brief.expression}. Energy: ${brief.energy}. Age feeling: ${brief.ageFeel}. Head-and-shoulders performance portrait, direct gaze, mouth and eyebrows clearly readable, simple contrasting background.`;
}

export const characterArtNegativePrompt = 'existing cartoon, famous mascot, trademark, franchise symbol, celebrity, real public figure, near-copy, text, watermark, extra fingers, duplicate face';
