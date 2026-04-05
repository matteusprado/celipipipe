"use client";

import { useEffect, useState } from "react";
import styles from "./Task5Selection.module.css";

/**
 * Task 5 — Comparing and Persuading: option selection screen.
 * Shows two side-by-side option cards. User clicks to select; auto-selects on timer expiry.
 *
 * Props:
 *   task         – task object with { prompt, choiceInstruction, options: [{title, details}] }
 *   seconds      – countdown for the choice phase (60)
 *   onSelect     – (chosenIndex: 0 | 1) => void
 */
export default function Task5Selection({ task, seconds, onSelect }) {
  const [remaining, setRemaining] = useState(seconds);
  const [chosen, setChosen] = useState(null);

  useEffect(() => {
    setRemaining(seconds);
    setChosen(null);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      const idx = chosen ?? 0;
      onSelect?.(idx);
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, chosen, onSelect]);

  function handleSelect(idx) {
    setChosen(idx);
    onSelect?.(idx);
  }

  const options = task.options || [];

  return (
    <div className={styles.wrap}>
      <div className={styles.questionBox}>
        <span className={styles.infoIcon}>ℹ</span>
        <div>
          <p className={styles.questionText}>{task.prompt}</p>
          <p className={styles.subText}>
            {task.choiceInstruction ||
              "Choose the option that you prefer. In the next section, you will need to persuade a family member that your choice is the better choice. If you do not choose an option, the computer will choose one for you. You do not need to speak for this part."}
          </p>
        </div>
      </div>

      <div className={styles.optionsRow}>
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.optionCard} ${chosen === i ? styles.selected : ""}`}
            onClick={() => handleSelect(i)}
          >
            <div className={styles.optionImagePlaceholder}>
              <span className={styles.optionImageIcon}>{i === 0 ? "🏠" : "🏡"}</span>
            </div>
            <div className={styles.optionTitle}>{opt.title}</div>
            <ul className={styles.optionDetails}>
              {(opt.details || []).map((d, j) => (
                <li key={j}>- {d}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <div className={styles.timerWidget}>
        <span className={styles.clockIcon}>🕐</span>
        <div>
          <div className={styles.timerLabel}>Preparation Time</div>
          <div className={styles.timerCount}>{remaining}</div>
        </div>
      </div>
    </div>
  );
}
