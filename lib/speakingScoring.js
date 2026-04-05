/**
 * CELPIP Speaking — scoring and CLB-level conversion utilities.
 *
 * Official rubric: 4 categories (Coherence/Meaning, Vocabulary, Listenability,
 * Task Fulfillment) each scored 1–12. The four scores are averaged to produce
 * a single task score. The 8 task scores are then averaged to give the final
 * CELPIP Speaking level (which maps 1:1 to a CLB level).
 */

/** Category keys used in score objects */
export const SCORE_CATEGORIES = [
  { key: "coherence", label: "Coherence / Meaning" },
  { key: "vocabulary", label: "Vocabulary" },
  { key: "listenability", label: "Listenability" },
  { key: "taskFulfillment", label: "Task Fulfillment" },
];

/**
 * Compute the single task score (average of the 4 category scores).
 * @param {{ coherence: number, vocabulary: number, listenability: number, taskFulfillment: number }} scores
 * @returns {number} rounded to 1 decimal place
 */
export function computeTaskScore(scores) {
  const vals = SCORE_CATEGORIES.map((c) => Number(scores[c.key]) || 0);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(avg * 10) / 10;
}

/**
 * Compute the overall test score from an array of per-task results.
 * @param {Array<{ taskScore: number }>} taskResults
 * @returns {{ overall: number, clbLevel: number, clbLabel: string, bandDescription: string }}
 */
export function computeOverallScore(taskResults) {
  if (!taskResults || taskResults.length === 0) {
    return { overall: 0, clbLevel: 0, clbLabel: "—", bandDescription: "No data" };
  }
  const scores = taskResults.map((r) => Number(r.taskScore) || 0);
  const overall = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  return { overall, ...scoreToCLB(overall) };
}

/**
 * Map a CELPIP numeric score (1–12) to a CLB level and descriptive label.
 * CELPIP and CLB are 1:1 for the speaking section.
 */
export function scoreToCLB(score) {
  if (score >= 10) return { clbLevel: 10, clbLabel: "CLB 10–12", bandDescription: "Expert / Advanced Professional" };
  if (score >= 9)  return { clbLevel: 9,  clbLabel: "CLB 9",     bandDescription: "Competent" };
  if (score >= 8)  return { clbLevel: 8,  clbLabel: "CLB 8",     bandDescription: "Competent" };
  if (score >= 7)  return { clbLevel: 7,  clbLabel: "CLB 7",     bandDescription: "Adequate" };
  if (score >= 6)  return { clbLevel: 6,  clbLabel: "CLB 6",     bandDescription: "Adequate" };
  if (score >= 5)  return { clbLevel: 5,  clbLabel: "CLB 5",     bandDescription: "Intermediate" };
  if (score >= 4)  return { clbLevel: 4,  clbLabel: "CLB 4",     bandDescription: "Basic" };
  if (score >= 3)  return { clbLevel: 3,  clbLabel: "CLB 3",     bandDescription: "Developing Basic" };
  return { clbLevel: 2, clbLabel: "CLB 1–2", bandDescription: "Developing" };
}

/**
 * Returns a colour hint string based on a 1–12 score, used for UI badges.
 */
export function scoreColour(score) {
  if (score >= 9) return "ok";
  if (score >= 7) return "warn";
  return "danger";
}
