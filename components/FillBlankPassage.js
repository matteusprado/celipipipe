"use client";

import styles from "./FillBlankPassage.module.css";

export default function FillBlankPassage({ segments, answers, onChange, disabled }) {
  return (
    <div className={styles.passage}>
      {segments.map((seg, idx) => {
        if (seg.type === "text") {
          return (
            <span key={`t-${idx}`} className={styles.text}>
              {seg.text}
            </span>
          );
        }
        if (seg.type === "blank") {
          return (
            <span key={seg.id} className={styles.blankWrap}>
              <select
                aria-label={`Blank ${seg.id}`}
                value={answers[seg.id] ?? ""}
                disabled={disabled}
                onChange={(e) => onChange(seg.id, e.target.value)}
              >
                <option value="">—</option>
                {seg.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </span>
          );
        }
        return null;
      })}
    </div>
  );
}
