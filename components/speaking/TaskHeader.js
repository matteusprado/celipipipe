"use client";

import styles from "./TaskHeader.module.css";

/**
 * The top bar visible on every task screen.
 * Matches the real CELPIP layout: task title on the left, timers + NEXT on the right.
 *
 * Props:
 *   taskLabel   – e.g. "Speaking Task 1: Giving Advice"
 *   prepSeconds – total prep time for this task
 *   recSeconds  – total recording time
 *   phase       – "prep" | "record" | "choice" | "instructions"
 *   onNext      – callback for the NEXT button
 */
export default function TaskHeader({ taskLabel, prepSeconds, recSeconds, phase, onNext }) {
  return (
    <div className={styles.bar}>
      <span className={styles.title}>{taskLabel}</span>
      <div className={styles.right}>
        <span className={`${styles.timer} ${phase === "prep" || phase === "choice" ? styles.active : ""}`}>
          Preparation: {prepSeconds} seconds
        </span>
        {recSeconds != null && (
          <span className={`${styles.timer} ${phase === "record" ? styles.active : ""}`}>
            Recording: {recSeconds} seconds
          </span>
        )}
        <button className={styles.nextBtn} type="button" onClick={onNext}>
          NEXT
        </button>
      </div>
    </div>
  );
}
