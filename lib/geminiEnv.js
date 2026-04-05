function stripQuotes(s) {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1).trim();
  }
  return t;
}

/**
 * Resolves API key from env (Google AI Studio / common alternate names).
 * Trims whitespace — pasted keys often include a trailing newline.
 */
export function getGeminiApiKey() {
  const raw =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    "";
  const key = stripQuotes(String(raw));
  return key.length ? key : "";
}

export function hasGeminiApiKey() {
  return getGeminiApiKey().length > 0;
}
