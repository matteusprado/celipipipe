"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ScoreCard from "@/components/ScoreCard";
import { STORAGE_RESULTS } from "@/lib/storageKeys";
import styles from "./page.module.css";

export default function ResultsPage() {
  const router = useRouter();
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_RESULTS);
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      setPayload(JSON.parse(raw));
    } catch {
      router.replace("/");
    }
  }, [router]);

  if (!payload) {
    return (
      <div className="surface">
        <div className="muted">Loading results…</div>
      </div>
    );
  }

  return (
    <div className="stack">
      <div>
        <h1 className="h1">Results</h1>
        {payload.meta?.variantLabel ? (
          <p className="muted">
            Variant: <strong>{payload.meta.variantLabel}</strong>
            {payload.meta.source ? (
              <>
                {" "}
                · Source: <strong>{payload.meta.source}</strong>
              </>
            ) : null}
          </p>
        ) : (
          <p className="muted">Review each item below. Green means correct, red means incorrect.</p>
        )}
      </div>

      <ScoreCard summary={payload.summary} />

      <section className="surface stack">
        <h2 className="h2">Question review</h2>
        <div className={styles.list}>
          {payload.details.map((d) => (
            <div
              key={d.id}
              className={`${styles.item} ${d.correct ? styles.ok : styles.bad}`}
            >
              <div className={styles.itemTop}>
                <div className={styles.badge}>Part {d.partNumber}</div>
                <div className={styles.id}>{d.id}</div>
                <div className={styles.mark}>{d.correct ? "Correct" : "Incorrect"}</div>
              </div>
              <div className={styles.prompt}>{d.prompt}</div>
              <div className={styles.grid2}>
                <div>
                  <div className={styles.k}>Your answer</div>
                  <div className={styles.v}>{d.userAnswer || "—"}</div>
                </div>
                <div>
                  <div className={styles.k}>Correct answer</div>
                  <div className={styles.v}>{d.correctAnswer}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.footer}>
        <Link className="btn" href="/">
          Try again
        </Link>
      </div>
    </div>
  );
}
