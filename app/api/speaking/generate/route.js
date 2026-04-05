import { NextResponse } from "next/server";
import { generateSpeakingTest, generateSceneImage } from "@/lib/speakingGemini";
import { hasGeminiApiKey } from "@/lib/geminiEnv";

export async function POST() {
  if (!hasGeminiApiKey()) {
    return NextResponse.json(
      { error: "No API key found. Add GEMINI_API_KEY to .env.local and restart the dev server." },
      { status: 400 },
    );
  }

  try {
    const tasks = await generateSpeakingTest();

    for (const task of tasks) {
      if (task.sceneDescription && [3, 4, 8].includes(task.taskNumber)) {
        try {
          const imageBase64 = await generateSceneImage(task.sceneDescription);
          task.sceneImageBase64 = imageBase64;
        } catch (imageError) {
          console.error(`Failed to generate image for task ${task.taskNumber}:`, imageError);
        }
      }
    }

    return NextResponse.json({ tasks });
  } catch (e) {
    console.error("Test generation error:", e);
    const message = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
