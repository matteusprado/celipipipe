"use client";

import styles from "./ScoreCard.module.css";

export default function ScoreCard({ summary }) {
  return (
    <div className={`surface ${styles.card}`}>
      <div className={styles.grid}>
        <div>
          <div className={styles.k}>Raw score</div>
          <div className={styles.v}>
            {summary.raw}/{summary.total}
          </div>
        </div>
        <div>
          <div className={styles.k}>CELPIP Reading level (practice estimate)</div>
          <div className={styles.v}>Level {summary.celpipLevel}</div>
        </div>
        <div>
          <div className={styles.k}>CLB (approx.)</div>
          <div className={styles.v}>{summary.clbLevel}</div>
        </div>
      </div>
      <p className={styles.note}>
        Band description: <span className="muted">{summary.bandLabel}</span>
      </p>
      <p className={styles.disclaimer}>
        This maps your correct answers to the commonly published raw-score-to-level chart for CELPIP Reading. It is
        practice-only; real exams may use additional scaling/calibration.
      </p>
    </div>
  );
}
