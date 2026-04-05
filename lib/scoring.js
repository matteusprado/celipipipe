const READING_TOTAL_QUESTIONS = 38;

export function readingTotalQuestions() {
  return READING_TOTAL_QUESTIONS;
}

export function computeScoresFromAnswers(test, answers) {
  const details = [];
  let raw = 0;

  for (const part of test.parts) {
    const partNumber = part.number;

    const record = (id, prompt, correctAnswer, userAnswer) => {
      const ua = userAnswer ?? "";
      const ok = normalizeAnswer(ua) === normalizeAnswer(correctAnswer);
      if (ok) raw += 1;
      details.push({
        id,
        partNumber,
        prompt,
        userAnswer: ua,
        correctAnswer,
        correct: ok,
      });
    };

    if (partNumber === 1) {
      for (const q of part.comprehension ?? []) {
        record(q.id, q.prompt, q.correctAnswer, answers[q.id]);
      }
      for (const seg of part.replySegments ?? []) {
        if (seg.type === "blank") {
          record(seg.id, `Reply blank (${seg.id})`, seg.correctAnswer, answers[seg.id]);
        }
      }
    } else if (partNumber === 2) {
      for (const seg of part.emailSegments ?? []) {
        if (seg.type === "blank") {
          record(seg.id, `Email blank (${seg.id})`, seg.correctAnswer, answers[seg.id]);
        }
      }
      for (const q of part.comprehension ?? []) {
        record(q.id, q.prompt, q.correctAnswer, answers[q.id]);
      }
    } else if (partNumber === 3) {
      for (const m of part.matches ?? []) {
        record(m.id, m.prompt, m.correctAnswer, answers[m.id]);
      }
    } else if (partNumber === 4) {
      for (const q of part.viewQuestions ?? []) {
        record(q.id, q.prompt, q.correctAnswer, answers[q.id]);
      }
      for (const seg of part.commentSegments ?? []) {
        if (seg.type === "blank") {
          record(seg.id, `Comment blank (${seg.id})`, seg.correctAnswer, answers[seg.id]);
        }
      }
    }
  }

  const celpip = rawToCelpipLevel(raw);
  return {
    raw,
    total: READING_TOTAL_QUESTIONS,
    celpipLevel: celpip.level,
    clbLevel: celpip.clb,
    bandLabel: celpip.label,
    details,
  };
}

export function normalizeAnswer(value) {
  if (value == null) return "";
  let s = String(value).trim().replace(/\s+/g, " ");
  s = s.replace(/[\u2018\u2019]/g, "'");
  s = s.replace(/[\u201C\u201D]/g, '"');
  return s.toLowerCase();
}

export function rawToCelpipLevel(raw) {
  if (raw >= 35 && raw <= 38) return { level: 12, clb: 12, label: "Advanced (near-native range)" };
  if (raw >= 33 && raw <= 34) return { level: 11, clb: 11, label: "Advanced" };
  if (raw >= 31 && raw <= 32) return { level: 10, clb: 10, label: "Advanced" };
  if (raw >= 29 && raw <= 30) return { level: 9, clb: 9, label: "Effective proficiency" };
  if (raw >= 26 && raw <= 28) return { level: 8, clb: 8, label: "Good proficiency" };
  if (raw >= 23 && raw <= 25) return { level: 7, clb: 7, label: "Adequate proficiency" };
  if (raw >= 19 && raw <= 22) return { level: 6, clb: 6, label: "Developing proficiency" };
  if (raw >= 15 && raw <= 18) return { level: 5, clb: 5, label: "Initial intermediate" };
  if (raw >= 11 && raw <= 14) return { level: 4, clb: 4, label: "Basic proficiency" };
  if (raw >= 8 && raw <= 10) return { level: 3, clb: 3, label: "Limited proficiency" };
  if (raw >= 0 && raw <= 7) return { level: "M", clb: "0–2", label: "Minimal / not yet at CLB 3" };
  return { level: "M", clb: "0–2", label: "Minimal / not yet at CLB 3" };
}
