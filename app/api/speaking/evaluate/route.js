import { NextResponse } from "next/server";
import { evaluateSpeakingResponse } from "@/lib/speakingGemini";
import { computeTaskScore } from "@/lib/speakingScoring";
import { hasGeminiApiKey } from "@/lib/geminiEnv";

export async function POST(request) {
  if (!hasGeminiApiKey()) {
    return NextResponse.json({ error: "No API key configured." }, { status: 400 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { audioBase64, mimeType, task } = body;

  if (!audioBase64 || !mimeType || !task) {
    return NextResponse.json(
      { error: "Missing required fields: audioBase64, mimeType, task." },
      { status: 400 },
    );
  }

  try {
    const scores = await evaluateSpeakingResponse(audioBase64, mimeType, task);
    const taskScore = computeTaskScore(scores);
    return NextResponse.json({ ...scores, taskScore });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Evaluation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
