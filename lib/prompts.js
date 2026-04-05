export function buildReadingGenerationPrompt(sampleTestJsonString) {
  return `You are generating a NEW CELPIP-General Reading practice test variation.

CRITICAL RULES:
- Output MUST be a single valid JSON object only (no markdown fences, no commentary).
- The JSON MUST match the SAME schema as the example below (same keys, types, and counts).
- Use NEW fictional content (new names, places, employers, topics). Do NOT copy sentences from the example.
- Every dropdown/blank MUST have exactly 4 options EXCEPT Part 3 paragraph matches, which MUST have exactly 5 options: ["A","B","C","D","E"] in that order.
- Every correctAnswer MUST exactly equal one element from options (string match).
- Part 3 correctAnswer must be exactly one letter: A, B, C, D, or E.
- Keep Part 2 as a diagram-style comparison across four travel/method options (or a similar practical chart with 4 rows). Each row must have: mode, bullets (array of strings), price (string), duration (string).
- Timings must be exactly JSON numbers (not strings): part1 timeSeconds=600, part2=540, part3=600, part4=780.
- part.number must be JSON numbers 1,2,3,4 (not strings).
- section must be "reading", version must be 1.
- variantLabel should briefly describe your new scenario.

When factual claims might require verification, prefer widely known, generic facts OR clearly fictional-but-plausible details. Do not invent precise real-world statistics.

TOOL USE:
- If your environment supports browsing/Grounding/Google Search tools, you MAY use them to sanity-check any real-world entity you choose to mention (e.g., city facts, well-known definitions). If tools are unavailable, stay generic.

EXAMPLE (structure reference only — generate different content):
${sampleTestJsonString}`;
}
