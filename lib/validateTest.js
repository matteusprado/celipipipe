import { readingTotalQuestions } from "./scoring.js";

/**
 * Coerce common Gemini JSON slip-ups (numeric fields as strings, part labels, etc.)
 * before validation. Mutates the object in place.
 */
export function normalizeReadingTest(test) {
  if (!test || typeof test !== "object" || !Array.isArray(test.parts)) return test;

  const coerceInt = (v, fallback) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : fallback;
  };

  for (const part of test.parts) {
    const partNo = coerceInt(part.number, NaN);
    part.number = Number.isFinite(partNo) ? partNo : part.number;
    const ts = coerceInt(part.timeSeconds, NaN);
    part.timeSeconds = Number.isFinite(ts) ? ts : part.timeSeconds;

    if (part.number === 3 && Array.isArray(part.paragraphs)) {
      for (const p of part.paragraphs) {
        if (p?.label != null) p.label = String(p.label).trim().toUpperCase();
      }
    }
    if (part.number === 3 && Array.isArray(part.matches)) {
      for (const m of part.matches) {
        if (m?.correctAnswer != null) {
          m.correctAnswer = String(m.correctAnswer).trim().toUpperCase();
        }
      }
    }
  }

  return test;
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function isDropdownLike(obj) {
  if (!obj || typeof obj !== "object") return false;
  if (!isNonEmptyString(obj.id)) return false;
  if (!isNonEmptyString(obj.correctAnswer)) return false;
  if (!Array.isArray(obj.options) || obj.options.length !== 4) return false;
  const optsList = obj.options.map((o) => String(o).trim());
  if (new Set(optsList).size !== 4) return false;
  const ca = String(obj.correctAnswer).trim();
  const match = optsList.find((o) => o === ca);
  if (!match) return false;
  obj.correctAnswer = match;
  obj.options = optsList;
  return true;
}

function validateSegments(segments, kind, expectedBlanks) {
  if (!Array.isArray(segments)) return `${kind}: segments must be an array`;
  let blanks = 0;
  for (const seg of segments) {
    if (!seg || typeof seg !== "object") return `${kind}: invalid segment`;
    if (seg.type === "text") {
      if (typeof seg.text !== "string") return `${kind}: text segment needs string text`;
    } else if (seg.type === "blank") {
      if (!isDropdownLike(seg)) return `${kind}: invalid blank segment`;
      blanks += 1;
    } else {
      return `${kind}: unknown segment type`;
    }
  }
  if (typeof expectedBlanks === "number" && blanks !== expectedBlanks) {
    return `${kind}: expected ${expectedBlanks} blanks, found ${blanks}`;
  }
  if (blanks < 1) return `${kind}: expected at least one blank`;
  return null;
}

export function validateReadingTest(test) {
  if (!test || typeof test !== "object") return "Test must be an object";
  if (test.section !== "reading") return "section must be 'reading'";
  if (!Array.isArray(test.parts) || test.parts.length !== 4) return "parts must be an array of length 4";

  const nums = test.parts.map((p) => Number(p.number)).join(",");
  if (nums !== "1,2,3,4") return "parts must be numbered 1–4 in order";

  const first = test.parts[0];
  if (Number(first.timeSeconds) !== 600) return "part 1 timeSeconds should be 600 (10 min)";
  if (!isNonEmptyString(first.passage)) return "part 1 needs passage";
  if (!Array.isArray(first.comprehension) || first.comprehension.length !== 6) {
    return "part 1 needs 6 comprehension questions";
  }
  for (const q of first.comprehension) {
    if (!isDropdownLike(q) || !isNonEmptyString(q.prompt)) return "part 1 comprehension item invalid";
  }
  const r = validateSegments(first.replySegments, "part1.replySegments", 5);
  if (r) return r;

  const second = test.parts[1];
  if (Number(second.timeSeconds) !== 540) return "part 2 timeSeconds should be 540 (9 min)";
  if (!Array.isArray(second.diagramItems) || second.diagramItems.length < 2) return "part 2 needs diagramItems";
  const e = validateSegments(second.emailSegments, "part2.emailSegments", 5);
  if (e) return e;
  if (!Array.isArray(second.comprehension) || second.comprehension.length !== 3) {
    return "part 2 needs 3 comprehension questions";
  }
  for (const q of second.comprehension) {
    if (!isDropdownLike(q) || !isNonEmptyString(q.prompt)) return "part 2 comprehension item invalid";
  }

  const third = test.parts[2];
  if (Number(third.timeSeconds) !== 600) return "part 3 timeSeconds should be 600 (10 min)";
  if (!Array.isArray(third.paragraphs) || third.paragraphs.length !== 4) return "part 3 needs 4 paragraphs";
  const labels = third.paragraphs.map((p) => p.label).join(",");
  if (labels !== "A,B,C,D") return "part 3 paragraph labels must be A,B,C,D";
  if (!Array.isArray(third.matches) || third.matches.length !== 9) return "part 3 needs 9 match questions";
  for (const m of third.matches) {
    if (!isNonEmptyString(m.id) || !isNonEmptyString(m.prompt)) return "part 3 match invalid";
    if (!Array.isArray(m.options) || m.options.length !== 5) return "part 3 match must have 5 options (A–E)";
    const set = new Set(m.options.map(String));
    if (set.size !== 5 || !["A", "B", "C", "D", "E"].every((x) => set.has(x))) {
      return "part 3 options must include A–E exactly once each";
    }
    if (!["A", "B", "C", "D", "E"].includes(String(m.correctAnswer).trim().toUpperCase())) {
      return "part 3 correctAnswer must be A–E";
    }
  }

  const fourth = test.parts[3];
  if (Number(fourth.timeSeconds) !== 780) return "part 4 timeSeconds should be 780 (13 min)";
  if (!isNonEmptyString(fourth.article)) return "part 4 needs article";
  if (!Array.isArray(fourth.viewQuestions) || fourth.viewQuestions.length !== 5) {
    return "part 4 needs 5 view questions";
  }
  for (const q of fourth.viewQuestions) {
    if (!isDropdownLike(q) || !isNonEmptyString(q.prompt)) return "part 4 view question invalid";
  }
  const c = validateSegments(fourth.commentSegments, "part4.commentSegments", 5);
  if (c) return c;

  let count = 0;
  const bump = (n) => {
    count += n;
  };

  bump(6);
  for (const seg of first.replySegments) if (seg.type === "blank") bump(1);
  for (const seg of second.emailSegments) if (seg.type === "blank") bump(1);
  bump(3);
  bump(9);
  bump(5);
  for (const seg of fourth.commentSegments) if (seg.type === "blank") bump(1);

  if (count !== readingTotalQuestions()) {
    return `expected ${readingTotalQuestions()} questions, counted ${count}`;
  }

  return null;
}
