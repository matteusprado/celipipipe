"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import TaskHeader from "@/components/speaking/TaskHeader";
import PreparationPhase from "@/components/speaking/PreparationPhase";
import RecordingPhase from "@/components/speaking/RecordingPhase";
import Task5Selection from "@/components/speaking/Task5Selection";
import { TASK_METADATA, SPEAKING_TEST_KEY, SPEAKING_SCORES_KEY } from "@/lib/speakingTasks";
import { computeTaskScore } from "@/lib/speakingScoring";
import { getImage } from "@/lib/imageStorage";
import styles from "./page.module.css";

/**
 * Phase state machine per task:
 *
 * Standard tasks:        prep → record → evaluating → (next task)
 * Task 5 (comparing):   instructions → choice → prep → record → evaluating → (next task)
 */
const PHASES = {
  INSTRUCTIONS: "instructions", // Task 5 only: task instructions screen
  CHOICE: "choice",             // Task 5 only: pick an option
  PREP: "prep",                 // Preparation countdown
  RECORD: "record",             // Recording + TTS cues
  EVALUATING: "evaluating",     // Waiting for Gemini evaluation
};

export default function SpeakingTestPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState(null);
  const [taskIndex, setTaskIndex] = useState(0);
  const [phase, setPhase] = useState(PHASES.PREP);
  const [chosenOptionIndex, setChosenOptionIndex] = useState(null);
  const [scores, setScores] = useState([]); // accumulated per-task results
  const [evalError, setEvalError] = useState(null);
  const recordingRef = useRef(null); // ref to RecordingPhase — exposes stop()

  // ── Load tasks from sessionStorage ──────────────────────────────────────────
  useEffect(() => {
    const raw = sessionStorage.getItem(SPEAKING_TEST_KEY);
    if (!raw) {
      router.replace("/speaking");
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length !== 8) throw new Error("bad");
      
      const loadImages = async () => {
        const tasksWithImages = await Promise.all(
          parsed.map(async (task) => {
            if (task.sceneImageKey) {
              const imageData = await getImage(task.sceneImageKey);
              return { ...task, sceneImageBase64: imageData };
            }
            return task;
          })
        );
        setTasks(tasksWithImages);
      };
      
      loadImages().catch((err) => {
        console.error("Failed to load images:", err);
        router.replace("/speaking");
      });
    } catch {
      router.replace("/speaking");
    }
  }, [router]);

  // ── Initialise phase when task changes ────────────────────────────────────
  useEffect(() => {
    if (!tasks) return;
    const meta = TASK_METADATA[taskIndex];
    if (meta?.taskType === "comparingPersuading") {
      setPhase(PHASES.INSTRUCTIONS);
    } else {
      setPhase(PHASES.PREP);
    }
    setChosenOptionIndex(null);
    setEvalError(null);
  }, [taskIndex, tasks]);

  // ── Derived task data ──────────────────────────────────────────────────────
  const meta = tasks ? TASK_METADATA[taskIndex] : null;
  const aiTask = tasks ? tasks[taskIndex] : null;

  // Merge AI-generated content with static metadata
  const task = aiTask
    ? {
        ...meta,
        ...aiTask,
        chosenOptionIndex,
      }
    : null;

  // ── Advance to next task or results ──────────────────────────────────────
  const advance = useCallback(
    (newScores) => {
      const updatedScores = newScores || scores;
      if (taskIndex >= 7) {
        sessionStorage.setItem(SPEAKING_SCORES_KEY, JSON.stringify(updatedScores));
        router.push("/speaking/results");
      } else {
        setTaskIndex((i) => i + 1);
      }
    },
    [taskIndex, router, scores],
  );

  // ── NEXT button handler ────────────────────────────────────────────────────
  function handleNext() {
    if (phase === PHASES.INSTRUCTIONS) {
      setPhase(PHASES.CHOICE);
    } else if (phase === PHASES.CHOICE) {
      setPhase(PHASES.PREP);
    } else if (phase === PHASES.PREP) {
      setPhase(PHASES.RECORD);
    } else if (phase === PHASES.RECORD) {
      // Stop the recording immediately; onstop → onRecordingComplete → submitRecording
      recordingRef.current?.stop();
    }
    // EVALUATING: NEXT does nothing (we wait for the API)
  }

  // ── Prep phase expires → go to record ─────────────────────────────────────
  function onPrepExpire() {
    setPhase(PHASES.RECORD);
  }

  // ── Task 5 option selected → go to prep ───────────────────────────────────
  function onOptionSelected(idx) {
    setChosenOptionIndex(idx);
    setPhase(PHASES.PREP);
  }

  // ── Recording complete → evaluate ────────────────────────────────────────
  function onRecordingComplete(blob, mimeType) {
    submitRecording(blob, mimeType);
  }

  async function submitRecording(blob, mimeType) {
    setPhase(PHASES.EVALUATING);
    setEvalError(null);

    try {
      const base64 = await blobToBase64(blob);
      const res = await fetch("/api/speaking/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64: base64,
          mimeType,
          task: {
            ...task,
            chosenOptionIndex,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed");

      const taskScore = data.taskScore ?? computeTaskScore(data);
      const result = {
        taskNumber: taskIndex + 1,
        taskLabel: meta?.label,
        prompt: aiTask?.prompt,
        coherence: data.coherence,
        vocabulary: data.vocabulary,
        listenability: data.listenability,
        taskFulfillment: data.taskFulfillment,
        taskScore,
        transcript: data.transcript,
        feedback: data.feedback,
      };

      const newScores = [...scores, result];
      setScores(newScores);
      advance(newScores);
    } catch (e) {
      setEvalError(e.message || "Evaluation error. You can skip to the next task.");
    }
  }

  function skipTask() {
    const result = {
      taskNumber: taskIndex + 1,
      taskLabel: meta?.label,
      prompt: aiTask?.prompt,
      coherence: 0,
      vocabulary: 0,
      listenability: 0,
      taskFulfillment: 0,
      taskScore: 0,
      transcript: "",
      feedback: "Task was skipped.",
    };
    const newScores = [...scores, result];
    setScores(newScores);
    advance(newScores);
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!tasks || !task) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.loadingText}>Loading test…</div>
      </div>
    );
  }

  const taskLabel = `Speaking Task ${taskIndex + 1}: ${meta?.label}`;
  const prepSec = meta?.prepSeconds ?? 30;
  const recSec = meta?.recordSeconds ?? 60;
  const choiceSec = meta?.choiceSeconds ?? 60;

  return (
    <div className={styles.page}>
      <TaskHeader
        taskLabel={taskLabel}
        prepSeconds={phase === PHASES.CHOICE ? choiceSec : prepSec}
        recSeconds={recSec}
        phase={phase === PHASES.CHOICE ? "choice" : phase === PHASES.PREP ? "prep" : "record"}
        onNext={handleNext}
      />

      <div className={styles.content}>
        {phase === PHASES.INSTRUCTIONS && (
          <div className={styles.instructionsScreen}>
            <div className={styles.instrHeader}>
              <span className={styles.infoIcon}>ℹ</span>
              <span className={styles.instrTitle}>Instructions</span>
            </div>
            <p className={styles.instrBody}>This task is made up of THREE parts:</p>
            <ol className={styles.instrList}>
              <li>Choose an option</li>
              <li>Preparation time</li>
              <li>Speaking</li>
            </ol>
            <p className={styles.instrCta}>Click next to continue.</p>
          </div>
        )}

        {phase === PHASES.CHOICE && (
          <Task5Selection task={task} seconds={choiceSec} onSelect={onOptionSelected} />
        )}

        {phase === PHASES.PREP && (
          <PreparationPhase task={task} seconds={prepSec} onExpire={onPrepExpire} />
        )}

        {phase === PHASES.RECORD && (
          <RecordingPhase
            key={taskIndex}
            ref={recordingRef}
            task={task}
            seconds={recSec}
            onComplete={onRecordingComplete}
          />
        )}

        {phase === PHASES.EVALUATING && (
          <div className={styles.evaluatingScreen}>
            {evalError ? (
              <div className={styles.evalError}>
                <p>{evalError}</p>
                <button className={styles.skipBtn} type="button" onClick={skipTask}>
                  Skip to next task
                </button>
              </div>
            ) : (
              <div className={styles.evalSpinner}>
                <div className={styles.spinner} />
                <p>Evaluating your response…</p>
                <p className={styles.evalSub}>This may take a few seconds.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.progressBar}>
        {TASK_METADATA.map((m, i) => (
          <div
            key={i}
            className={`${styles.progressDot} ${
              i < taskIndex ? styles.done : i === taskIndex ? styles.current : ""
            }`}
          />
        ))}
        <span className={styles.progressLabel}>
          Task {taskIndex + 1} of 8
        </span>
      </div>
    </div>
  );
}

async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
