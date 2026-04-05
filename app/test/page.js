"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import TestPart from "@/components/TestPart";
import Timer from "@/components/Timer";
import { computeScoresFromAnswers } from "@/lib/scoring";
import { STORAGE_ANSWERS, STORAGE_RESULTS, STORAGE_TEST } from "@/lib/storageKeys";
import styles from "./page.module.css";

export default function TestPage() {
  const router = useRouter();
  const [test, setTest] = useState(null);
  const [partIndex, setPartIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_TEST);
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setTest(parsed);
    } catch {
      router.replace("/");
      return;
    }
    const ansRaw = sessionStorage.getItem(STORAGE_ANSWERS);
    if (ansRaw) {
      try {
        setAnswers(JSON.parse(ansRaw));
      } catch {
        setAnswers({});
      }
    }
  }, [router]);

  const part = test?.parts?.[partIndex] ?? null;
  const timerSeconds = part?.timeSeconds ?? 0;

  const onAnswerChange = useCallback(
    (id, value) => {
      setAnswers((prev) => {
        const next = { ...prev, [id]: value };
        sessionStorage.setItem(STORAGE_ANSWERS, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const goResults = useCallback(() => {
    if (!test) return;
    let finalAnswers = answers;
    try {
      const raw = sessionStorage.getItem(STORAGE_ANSWERS);
      if (raw) finalAnswers = { ...JSON.parse(raw) };
    } catch {
      finalAnswers = answers;
    }
    const scored = computeScoresFromAnswers(test, finalAnswers);
    const payload = {
      summary: {
        raw: scored.raw,
        total: scored.total,
        celpipLevel: scored.celpipLevel,
        clbLevel: scored.clbLevel,
        bandLabel: scored.bandLabel,
      },
      details: scored.details,
      meta: {
        variantLabel: test.variantLabel ?? null,
        source: sessionStorage.getItem("celpip_last_source"),
      },
    };
    sessionStorage.setItem(STORAGE_RESULTS, JSON.stringify(payload));
    router.push("/results");
  }, [router, test, answers]);

  const advance = useCallback(() => {
    if (!test) return;
    if (partIndex >= test.parts.length - 1) {
      goResults();
      return;
    }
    setPartIndex((i) => i + 1);
  }, [goResults, partIndex, test]);

  const onExpire = useCallback(() => {
    advance();
  }, [advance]);

  const header = useMemo(() => {
    if (!part) return "";
    return `${part.title} — Part ${partIndex + 1} of ${test?.parts?.length ?? 4}`;
  }, [part, partIndex, test?.parts?.length]);

  if (!test || !part) {
    return (
      <div className="surface">
        <div className="muted">Loading test…</div>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className={styles.topBar}>
        <div>
          <div className="h2" style={{ margin: 0 }}>
            {header}
          </div>
        </div>
        <Timer key={`${part.number}-${partIndex}`} seconds={timerSeconds} onExpire={onExpire} active />
      </div>

      <TestPart part={part} answers={answers} onAnswerChange={onAnswerChange} />

      <div className={styles.footer}>
        <button className="btn btnSecondary" type="button" onClick={() => router.push("/")}>
          Exit
        </button>
        <button className="btn" type="button" onClick={advance}>
          {partIndex >= test.parts.length - 1 ? "Finish & view results" : "Next part"}
        </button>
      </div>
    </div>
  );
}
