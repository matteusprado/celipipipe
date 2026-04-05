import { NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/speakingGemini";
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

  const { text, voice } = body;
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Missing or invalid 'text' field." }, { status: 400 });
  }

  try {
    const wavBuffer = await synthesizeSpeech(text, voice || "Kore");
    return new NextResponse(wavBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(wavBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "TTS failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
