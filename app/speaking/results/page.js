"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SPEAKING_SCORES_KEY } from "@/lib/speakingTasks";
import { computeOverallScore, SCORE_CATEGORIES, scoreColour } from "@/lib/speakingScoring";
import { clearAllImages } from "@/lib/imageStorage";
import styles from "./page.module.css";

export default function SpeakingResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [overall, setOverall] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(SPEAKING_SCORES_KEY);
    if (!raw) {
      router.replace("/speaking");
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setResults(parsed);
      setOverall(computeOverallScore(parsed));
    } catch {
      router.replace("/speaking");
    }
  }, [router]);

  const handleBackToHome = () => {
    clearAllImages().catch(console.error);
    router.push("/");
  };

  const handleRetakeTest = () => {
    clearAllImages().catch(console.error);
    router.push("/speaking");
  };

  if (!results || !overall) {
    return (
      <div className={styles.loading}>
        <span>Loading results…</span>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.h1}>Speaking Test — Results</h1>
        <p className={styles.subtitle}>
          Your responses were evaluated using the official CELPIP Performance Standards rubric.
        </p>
      </div>

      {/* Overall score banner */}
      <div className={`${styles.overallCard} ${styles[scoreColour(overall.overall)]}`}>
        <div className={styles.overallLeft}>
          <div className={styles.overallLabel}>Overall Score</div>
          <div className={styles.overallScore}>{overall.overall.toFixed(1)} / 12</div>
        </div>
        <div className={styles.overallRight}>
          <div className={styles.clbBadge}>{overall.clbLabel}</div>
          <div className={styles.clbDesc}>{overall.bandDescription}</div>
        </div>
      </div>

      {/* Rubric reminder */}
      <details className={styles.rubric}>
        <summary className={styles.rubricSummary}>About the CELPIP rubric</summary>
        <div className={styles.rubricBody}>
          <p>Each response is rated on 4 categories (1–12 each). The average is the task score. Eight task scores are averaged for the final result.</p>
          <ul>
            {SCORE_CATEGORIES.map((c) => (
              <li key={c.key}><strong>{c.label}</strong></li>
            ))}
          </ul>
        </div>
      </details>

      {/* Per-task breakdown */}
      <div className={styles.taskList}>
        {results.map((r, i) => (
          <div key={i} className={styles.taskCard}>
            <div className={styles.taskTop}>
              <div className={styles.taskMeta}>
                <span className={styles.taskNum}>Task {r.taskNumber}</span>
                <span className={styles.taskLabel}>{r.taskLabel}</span>
              </div>
              <div className={`${styles.taskScore} ${styles[scoreColour(r.taskScore)]}`}>
                {r.taskScore?.toFixed(1) ?? "—"}
              </div>
            </div>

            {r.prompt && <p className={styles.taskPrompt}>{r.prompt}</p>}

            <div className={styles.categoryGrid}>
              {SCORE_CATEGORIES.map((c) => (
                <div key={c.key} className={styles.catItem}>
                  <div className={styles.catLabel}>{c.label}</div>
                  <div className={`${styles.catScore} ${styles[scoreColour(r[c.key] ?? 0)]}`}>
                    {r[c.key] ?? "—"}
                  </div>
                </div>
              ))}
            </div>

            {r.transcript && (
              <div className={styles.transcript}>
                <div className={styles.transcriptLabel}>Your response (transcribed)</div>
                <p className={styles.transcriptText}>{r.transcript}</p>
              </div>
            )}

            {r.feedback && (
              <div className={styles.feedback}>
                <div className={styles.feedbackLabel}>Feedback</div>
                <p className={styles.feedbackText}>{r.feedback}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <button className={styles.retryBtn} onClick={handleRetakeTest}>
          Take another test
        </button>
        <button className={styles.homeBtn} onClick={handleBackToHome}>
          Back to Home
        </button>
      </div>
    </div>
  );
}
