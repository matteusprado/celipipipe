"use client";

import { useEffect, useState } from "react";
import styles from "./PreparationPhase.module.css";

const HINTS = [
  "Your Preparation Time starts once you see the question.",
  "Read the question and think about your answer.",
];

/**
 * Preparation phase component.
 * Shows the task question, a countdown clock widget, and reveals hints one by one.
 *
 * Props:
 *   task        – full task object { prompt, sceneDescription?, options?, ... }
 *   seconds     – countdown duration in seconds
 *   onExpire    – called when countdown reaches 0
 */
export default function PreparationPhase({ task, seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    setRemaining(seconds);
    setHintIndex(0);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire?.();
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, onExpire]);

  useEffect(() => {
    if (remaining === seconds - 3 && hintIndex < 1) setHintIndex(1);
    if (remaining === seconds - 7 && hintIndex < 2) setHintIndex(2);
  }, [remaining, seconds, hintIndex]);

  return (
    <div className={styles.wrap}>
      <div className={styles.questionBox}>
        <span className={styles.infoIcon}>ℹ</span>
        <p className={styles.questionText}>{task.prompt}</p>
      </div>

      {task.sceneImageBase64 && (
        <div className={styles.sceneBox}>
          <div className={styles.sceneLabel}>Scene</div>
          <img
            src={`data:image/png;base64,${task.sceneImageBase64}`}
            alt="Scene to describe"
            className={styles.sceneImage}
          />
        </div>
      )}

      <div className={styles.timerWidget}>
        <span className={styles.clockIcon}>🕐</span>
        <div>
          <div className={styles.timerLabel}>Preparation Time</div>
          <div className={styles.timerCount}>{remaining}</div>
        </div>
      </div>

      <ol className={styles.hints}>
        {HINTS.slice(0, hintIndex + 1).map((h, i) => (
          <li key={i} className={i === hintIndex ? styles.bold : styles.muted}>
            {h}
          </li>
        ))}
      </ol>
    </div>
  );
}
