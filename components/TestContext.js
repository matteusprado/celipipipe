"use client";

import { createContext, useContext, useMemo, useState } from "react";

const TestCtx = createContext(null);

export function TestProvider({ children }) {
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});

  const value = useMemo(
    () => ({
      test,
      setTest,
      answers,
      setAnswers,
      setAnswer(id, value) {
        setAnswers((prev) => ({ ...prev, [id]: value }));
      },
      resetSession() {
        setTest(null);
        setAnswers({});
      },
    }),
    [test, answers],
  );

  return <TestCtx.Provider value={value}>{children}</TestCtx.Provider>;
}

export function useTestSession() {
  const v = useContext(TestCtx);
  if (!v) throw new Error("useTestSession must be used within TestProvider");
  return v;
}
