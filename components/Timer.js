"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Timer.module.css";

export default function Timer({ seconds, onExpire, active }) {
  const [left, setLeft] = useState(seconds);
  const firedRef = useRef(false);

  useEffect(() => {
    setLeft(seconds);
    firedRef.current = false;
  }, [seconds]);

  useEffect(() => {
    if (!active) return;
    if (left <= 0) return;
    const id = setInterval(() => {
      setLeft((v) => v - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [active, left]);

  useEffect(() => {
    if (!active) return;
    if (left > 0) return;
    if (firedRef.current) return;
    firedRef.current = true;
    onExpire?.();
  }, [active, left, onExpire]);

  const safe = Math.max(left, 0);
  const mm = String(Math.floor(safe / 60)).padStart(2, "0");
  const ss = String(safe % 60).padStart(2, "0");
  const urgent = safe <= 60;

  return (
    <div className={`${styles.wrap} ${urgent ? styles.urgent : ""}`} role="status" aria-live="polite">
      <span className={styles.label}>Time remaining</span>
      <span className={styles.time}>
        {mm}:{ss}
      </span>
    </div>
  );
}
