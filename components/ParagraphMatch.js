"use client";

import styles from "./ParagraphMatch.module.css";

export default function ParagraphMatch({ id, prompt, options, value, onChange, disabled }) {
  return (
    <div className={styles.block}>
      <div className={styles.prompt}>{prompt}</div>
      <select
        id={id}
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(id, e.target.value)}
      >
        <option value="">Select…</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
