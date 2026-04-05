import { GoogleGenerativeAI } from "@google/generative-ai";
import sampleTest from "./sample-test.json";
import { getGeminiApiKey } from "./geminiEnv.js";
import { buildReadingGenerationPrompt } from "./prompts.js";
import { normalizeReadingTest, validateReadingTest } from "./validateTest.js";

function extractJsonObject(text) {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response did not contain a JSON object");
  }
  return trimmed.slice(start, end + 1);
}

function getResponseText(response) {
  const c0 = response.candidates?.[0];
  if (!c0) {
    const fb = response.promptFeedback;
    const reason = fb?.blockReason ? `Blocked: ${fb.blockReason}` : "Empty model response (no candidates)";
    throw new Error(reason);
  }
  if (c0.finishReason && c0.finishReason !== "STOP" && c0.finishReason !== "MAX_TOKENS") {
    throw new Error(`Generation stopped: ${c0.finishReason}`);
  }
  try {
    return response.text();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Could not read model text: ${msg}`);
  }
}

const FALLBACK_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];

async function generateWithModel(genAI, modelName, promptText) {
  const useSearch = process.env.GEMINI_USE_GOOGLE_SEARCH === "true";
  let model;
  if (useSearch) {
    try {
      model = genAI.getGenerativeModel({
        model: modelName,
        tools: [{ googleSearch: {} }],
      });
    } catch {
      model = genAI.getGenerativeModel({ model: modelName });
    }
  } else {
    model = genAI.getGenerativeModel({ model: modelName });
  }

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: promptText }] }],
    generationConfig: {
      temperature: 0.65,
      responseMimeType: "application/json",
    },
  });

  const text = getResponseText(result.response);
  const jsonText = extractJsonObject(text);
  const parsed = JSON.parse(jsonText);
  normalizeReadingTest(parsed);
  const err = validateReadingTest(parsed);
  if (err) {
    throw new Error(`Invalid generated test: ${err}`);
  }
  return parsed;
}

export async function generateReadingVariation() {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY (or GOOGLE_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY)");
  }

  const preferred = process.env.GEMINI_MODEL?.trim();
  const modelCandidates = preferred
    ? [preferred, ...FALLBACK_MODELS.filter((m) => m !== preferred)]
    : FALLBACK_MODELS;

  const genAI = new GoogleGenerativeAI(apiKey);
  const basePrompt = buildReadingGenerationPrompt(JSON.stringify(sampleTest));

  let lastErr = "Unknown error";

  for (const modelName of modelCandidates) {
    for (let attempt = 0; attempt < 3; attempt++) {
      let promptText = basePrompt;
      if (attempt > 0) {
        promptText = `${basePrompt}\n\n---\nRETRY ${attempt}/2. Previous output failed validation or parsing.\nLast error: ${lastErr}\nReturn ONLY a single corrected JSON object. Remember: timeSeconds must be numeric 600, 540, 600, 780 (not strings). correctAnswer for each blank/dropdown must exactly match one string in options. Part 3 match correctAnswer must be one letter A–E.\n---`;
      }
      try {
        return await generateWithModel(genAI, modelName, promptText);
      } catch (e) {
        lastErr = e instanceof Error ? e.message : String(e);
      }
    }
  }

  throw new Error(lastErr);
}

export function getSampleReadingTest() {
  return JSON.parse(JSON.stringify(sampleTest));
}
