import { NextResponse } from "next/server";
import { generateReadingVariation, getSampleReadingTest } from "@/lib/gemini";
import { hasGeminiApiKey } from "@/lib/geminiEnv";

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const useSample = body.useSample === true;
  if (useSample) {
    return NextResponse.json({
      test: getSampleReadingTest(),
      source: "sample",
    });
  }

  if (!hasGeminiApiKey()) {
    return NextResponse.json(
      {
        error:
          "No API key found. Add GEMINI_API_KEY to .env.local (see .env.example), then restart `npm run dev`. Aliases: GOOGLE_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY.",
        test: null,
        source: "sample_fallback_no_api_key",
      },
      { status: 400 },
    );
  }

  try {
    const test = await generateReadingVariation();
    return NextResponse.json({ test, source: "gemini" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json(
      {
        error: message,
        test: null,
        source: "error",
      },
      { status: 502 },
    );
  }
}
