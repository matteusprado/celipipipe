"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import styles from "./RecordingPhase.module.css";

const INSTRUCTIONS = [
  'When you hear "Start speaking now," start to answer.',
  'When you hear "Time is up," stop talking.',
  "Click NEXT to end your response early.",
];

/**
 * Recording phase component.
 * Manages MediaRecorder, plays static audio cues, shows animated progress bar,
 * and calls onComplete with the recorded audio blob when done.
 *
 * Props:
 *   task         – task object (used for display)
 *   seconds      – recording duration
 *   onComplete   – (audioBlob, mimeType) => void
 *
 * Ref methods:
 *   stop() – immediately stop the recording (e.g. when user clicks NEXT early)
 */
const RecordingPhase = forwardRef(function RecordingPhase({ task, seconds, onComplete }, ref) {
  const [elapsed, setElapsed] = useState(0);
  const [instrIndex, setInstrIndex] = useState(0);
  const [status, setStatus] = useState("waiting"); // waiting | recording | done
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const mimeTypeRef = useRef("audio/webm");

  const progress = Math.min(elapsed / seconds, 1);

  useEffect(() => {
    let active = true;
    let localStream = null;
    let localRecorder = null;

    async function run() {
      setElapsed(0);
      setInstrIndex(0);
      setStatus("waiting");
      chunksRef.current = [];

      try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        if (!active) return;
        setStatus("recording");
        runTimer(null);
        return;
      }

      if (!active) {
        localStream?.getTracks().forEach((t) => t.stop());
        return;
      }

      await playAudioCue("start-speaking.wav");

      if (!active) {
        localStream?.getTracks().forEach((t) => t.stop());
        return;
      }

      setStatus("recording");
      setInstrIndex(1);

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/ogg";

      mimeTypeRef.current = mimeType;

      const recorder = new MediaRecorder(localStream, { mimeType });
      localRecorder = recorder;
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        if (!active) return;
        localStream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        onComplete?.(blob, mimeType.split(";")[0]);
      };

      recorder.start(250);
      startTimeRef.current = Date.now();
      runTimer(recorder);
    }

    run();

    return () => {
      active = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      localStream?.getTracks().forEach((t) => t.stop());
      if (localRecorder?.state !== "inactive") {
        localRecorder?.stop();
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    stop() {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      } else if (!mediaRecorderRef.current) {
        onComplete?.(new Blob([], { type: "audio/webm" }), "audio/webm");
      }
    },
  }));

  async function playAudioCue(filename) {
    try {
      const audio = new Audio(`/audio/${filename}`);
      await audio.play();
      await new Promise((resolve) => {
        audio.onended = resolve;
        audio.onerror = resolve;
      });
    } catch {
      // silently continue if audio fails
    }
  }

  function runTimer(recorder) {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      const now = Math.round((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
      setElapsed(now);
      if (now >= 2) setInstrIndex(2);
      if (now >= 5) setInstrIndex(3);

      if (now >= seconds) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        finishRecording(recorder);
      }
    }, 500);
  }

  async function finishRecording(recorder) {
    setStatus("done");
    await playAudioCue("time-is-up.wav");
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    } else if (!recorder) {
      onComplete?.(new Blob([], { type: "audio/webm" }), "audio/webm");
    }
  }

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

      <div className={styles.recWidget}>
        <span className={styles.micIcon}>🎤</span>
        <div className={styles.recRight}>
          <div className={styles.recLabel}>
            {status === "waiting" ? "Preparing…" : status === "done" ? "Done" : "Recording…"}
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      <ol className={styles.instructions}>
        {INSTRUCTIONS.slice(0, instrIndex + 1).map((instr, i) => (
          <li key={i} className={i === instrIndex ? styles.bold : styles.muted}>
            {instr}
          </li>
        ))}
      </ol>
    </div>
  );
});

export default RecordingPhase;
