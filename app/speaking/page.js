"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SPEAKING_TEST_KEY, SPEAKING_SCORES_KEY } from "@/lib/speakingTasks";
import { storeImage, clearAllImages } from "@/lib/imageStorage";
import styles from "./page.module.css";

export default function SpeakingInstructionsPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function startTest() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/speaking/generate", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.tasks) {
        setError(data.error || "Failed to generate test. Check your API key.");
        setBusy(false);
        return;
      }
      
      await clearAllImages();
      
      const tasksWithoutImages = [];
      for (const task of data.tasks) {
        if (task.sceneImageBase64) {
          const imageKey = `task_${task.taskNumber}_image`;
          await storeImage(imageKey, task.sceneImageBase64);
          
          tasksWithoutImages.push({
            ...task,
            sceneImageBase64: undefined,
            sceneImageKey: imageKey
          });
        } else {
          tasksWithoutImages.push(task);
        }
      }
      
      sessionStorage.setItem(SPEAKING_TEST_KEY, JSON.stringify(tasksWithoutImages));
      sessionStorage.removeItem(SPEAKING_SCORES_KEY);
      router.push("/speaking/test");
    } catch (e) {
      console.error("Test generation error:", e);
      setError("Failed to prepare test. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Speaking Test Instructions</h1>

        <ol className={styles.list}>
          <li className={styles.muted}>The Speaking Test is 15 minutes.</li>
          <li className={styles.muted}>There are 8 tasks in the Speaking Test.</li>
          <li className={styles.bold}>Please try your best to answer all the questions.</li>
        </ol>

        <div className={styles.notice}>
          <strong>Before you begin:</strong> This simulator uses your microphone to record your
          responses and Gemini AI to evaluate them. Please allow microphone access when prompted.
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button
            className={styles.startBtn}
            type="button"
            disabled={busy}
            onClick={startTest}
          >
            {busy ? "Generating test questions and images…" : "Start Speaking Test"}
          </button>
          <button
            className={styles.backBtn}
            type="button"
            onClick={() => router.push("/")}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
