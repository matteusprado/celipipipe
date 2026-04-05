"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { STORAGE_ANSWERS, STORAGE_RESULTS, STORAGE_TEST } from "@/lib/storageKeys";
import styles from "./page.module.css";



export default function HomePage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);

  async function startReading() {
    setBusy(true);
    setNote(null);
    sessionStorage.removeItem("celpip_generate_warning");
    try {
      const res = await fetch("/api/generate-test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!data?.test) {
        const err =
          data?.error ||
          (res.status === 400
            ? "Add GEMINI_API_KEY to .env.local and restart `npm run dev`."
            : "Could not generate a new test. Check the API key and model name.");
        setNote(err);
        setBusy(false);
        return;
      }
      sessionStorage.setItem(STORAGE_TEST, JSON.stringify(data.test));
      sessionStorage.setItem(STORAGE_ANSWERS, JSON.stringify({}));
      sessionStorage.removeItem(STORAGE_RESULTS);
      sessionStorage.removeItem("celpip_last_source");
      router.push("/test");
    } catch {
      setNote("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function startSampleOnly() {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/generate-test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ useSample: true }),
      });
      const data = await res.json();
      sessionStorage.setItem(STORAGE_TEST, JSON.stringify(data.test));
      sessionStorage.setItem(STORAGE_ANSWERS, JSON.stringify({}));
      sessionStorage.removeItem(STORAGE_RESULTS);
      sessionStorage.setItem("celpip_last_source", "sample");
      router.push("/test");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <div>
        <h1 className="h1">CELPIP Practice Simulator</h1>
        <p className="muted">
          Start with Reading (four timed parts). Writing, Speaking, and Listening can be added later.
        </p>
      </div>

      <section className="surface stack">
        <h2 className="h2">Sections</h2>
        <div className={styles.sectionRow}>
          <div className={styles.sectionCard}>
            <div className={styles.sectionTitle}>Reading</div>
            <div className="muted">Available — 38 questions, 4 parts, sequential delivery.</div>
            <div className={styles.actions}>
              <button className="btn" type="button" disabled={busy} onClick={startReading}>
                {busy ? "Starting…" : "Start new Reading test"}
              </button>
              <button className="btn btnSecondary" type="button" disabled={busy} onClick={startSampleOnly}>
                Use built-in sample (offline-style)
              </button>
            </div>
          </div>
          <div className={`${styles.sectionCard} ${styles.disabled}`}>
            <div className={styles.sectionTitle}>Writing</div>
            <div className="muted">Coming soon</div>
          </div>
          <div className={styles.sectionCard}>
            <div className={styles.sectionTitle}>Speaking</div>
            <div className="muted">Available — 8 tasks, ~15 minutes, AI-evaluated with CELPIP rubric.</div>
            <div className={styles.actions}>
              <button
                className="btn"
                type="button"
                disabled={busy}
                onClick={() => router.push("/speaking")}
              >
                Start Speaking test
              </button>
            </div>
          </div>
          <div className={`${styles.sectionCard} ${styles.disabled}`}>
            <div className={styles.sectionTitle}>Listening</div>
            <div className="muted">Coming soon</div>
          </div>
        </div>
        {note ? <div className={styles.note}>{note}</div> : null}
      </section>
    </div>
  );
}
