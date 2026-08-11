// Lightweight, fast pre-filter for user-submitted TTS scripts.
// This is NOT a substitute for a real moderation pipeline - it's a cheap
// first line of defense to block the most obvious abusive/defamatory
// submissions before they hit the TTS API. Pair this with a proper
// moderation API (e.g. OpenAI moderation endpoint) before scaling up.

const ABUSIVE_PATTERNS: RegExp[] = [
  /\b(rand[i|y]|chutiya|madarchod|behenchod|bhosdi)\b/i,
  // extend with a maintained profanity list per target language
];

// Block attempts to name real public figures/celebrities explicitly  -
// keeps voices squarely in "generic accent" territory, not impersonation.
const REAL_PERSON_HINT_PATTERNS: RegExp[] = [
  /\b(manoj tiwari|khesari lal|pawan singh|modi|rahul gandhi)\b/i,
];

export interface ContentCheckResult {
  allowed: boolean;
  reason?: string;
}

export function checkScriptText(text: string): ContentCheckResult {
  const normalized = text.trim();

  if (normalized.length === 0) {
    return { allowed: false, reason: 'Script text cannot be empty' };
  }
  if (normalized.length > 200) {
    return { allowed: false, reason: 'Script text must be under 200 characters' };
  }

  for (const pattern of ABUSIVE_PATTERNS) {
    if (pattern.test(normalized)) {
      return { allowed: false, reason: 'Script contains disallowed language' };
    }
  }

  for (const pattern of REAL_PERSON_HINT_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        allowed: false,
        reason: 'Please avoid naming real public figures - use generic character voices instead',
      };
    }
  }

  return { allowed: true };
}
