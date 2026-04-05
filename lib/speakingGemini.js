/**
 * CELPIP Speaking — Gemini AI integration.
 *
 * Four responsibilities:
 *   1. generateSpeakingTest()   – generate all 8 task prompts via gemini-2.5-flash
 *   2. generateSceneImage()     – generate images from scene descriptions via gemini-2.5-flash-image
 *   3. synthesizeSpeech()       – TTS via gemini-2.5-flash-preview-tts REST API
 *   4. evaluateSpeakingResponse() – multimodal audio eval via gemini-2.5-flash
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGeminiApiKey } from "./geminiEnv.js";

// ─── Question generation ──────────────────────────────────────────────────────

const GENERATION_PROMPT = `You are building a CELPIP General Speaking Test simulator.

Generate exactly 8 task prompts — one per task type — at an intermediate-to-advanced difficulty level (equivalent to CLB 7–10). Use realistic, original scenarios that differ from official sample tests. Return ONLY a valid JSON array with no markdown.

Task specifications (follow strictly):

1. taskType "givingAdvice"
   - prompt: A friend/colleague/neighbour presents a real-life problem and asks for your advice.
   - ttsText: A short sentence reading the prompt aloud, starting with "A..."
   - Example: "A close friend has recently been laid off and is struggling to manage her finances. Advise her about practical steps she can take to reduce expenses and find new income."

2. taskType "personalExperience"
   - prompt: Ask the speaker to talk about a specific personal memory or event with a family member or friend.
   - ttsText: Short spoken version of the prompt.

3. taskType "describingScene"
   - prompt: "Describe some things that are happening in the scene below as well as you can. The person with whom you are speaking cannot see the picture."
   - sceneDescription: A richly detailed description of a busy real-world scene (50–80 words), e.g. a farmer's market, a busy hospital waiting room, a construction site, a school cafeteria at lunch. Include at least 5 distinct visible actions/people.
   - ttsText: "Describe some things that are happening in the scene as well as you can."

4. taskType "makingPredictions"
   - prompt: "In this picture, what do you think will most probably happen next?"
   - sceneDescription: Use the SAME scene as task 3 but frame it as a moment just before something significant happens.
   - ttsText: "In this picture, what do you think will most probably happen next?"

5. taskType "comparingPersuading"
   - prompt: A realistic comparison scenario (two vacation destinations, two job offers, two neighbourhoods, two cars, etc.)
   - ttsText: Short intro sentence read aloud.
   - options: array of exactly 2 objects: { title, details: [string, string, string, string] }
     Each detail bullet should be a realistic spec (price, size, distance, feature, etc.)
   - choiceInstruction: "Choose the option that you prefer. In the next section, you will need to persuade a family member that your choice is the better choice. If you do not choose an option, the computer will choose one for you."

6. taskType "difficultSituation"
   - prompt: A realistic interpersonal conflict scenario (e.g. a neighbour's dog, a noisy roommate, a miscommunication at work).
   - ttsText: Short spoken intro of the scenario.
   - eitherOption: What to say if they choose to speak to person A.
   - orOption: What to say if they choose to speak to person B.

7. taskType "expressingOpinions"
   - prompt: A debatable social/civic question phrased as "Do you think that... Explain your reasons."
   - ttsText: "Answer the following question and explain your reasons."

8. taskType "unusualSituation"
   - prompt: You are in a specific public place and you see an unusual/unexpected object. You cannot take a photo. Phone a family member and describe it clearly so they can decide whether to buy/recommend it.
   - sceneDescription: Describe the unusual object in 40–60 words (shape, colour, material, unexpected feature, approximate size). Make it genuinely unusual but plausible (e.g. a chair with transparent walls, a lamp shaped like a tree).
   - ttsText: Short spoken prompt sentence.

Return a JSON array with exactly these 8 objects. Each object MUST have: taskNumber (1–8), taskType, prompt, ttsText, and the additional fields listed above where required. Do not include any other keys.`;

function extractJsonArray(text) {
  const trimmed = text.trim();
  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("No JSON array found in model response");
  return trimmed.slice(start, end + 1);
}

/**
 * Generate the full 8-task speaking test using Gemini text generation.
 * @returns {Promise<Array>} Array of 8 task objects
 */
export async function generateSpeakingTest() {
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: GENERATION_PROMPT }] }],
    generationConfig: {
      temperature: 0.8,
      responseMimeType: "application/json",
    },
  });

  const text = result.response.text();
  const jsonText = extractJsonArray(text);
  const tasks = JSON.parse(jsonText);

  if (!Array.isArray(tasks) || tasks.length !== 8) {
    throw new Error(`Expected 8 tasks, got ${Array.isArray(tasks) ? tasks.length : "non-array"}`);
  }

  return tasks;
}

// ─── Image generation ─────────────────────────────────────────────────────────

/**
 * Generate an image from a scene description using gemini-2.5-flash-image.
 * Returns a base64-encoded PNG image.
 *
 * @param {string} sceneDescription - Detailed description of the scene to generate
 * @returns {Promise<string>} Base64-encoded image data
 */
export async function generateSceneImage(sceneDescription) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

  const prompt = `Generate a photorealistic image based on this description: ${sceneDescription}`;

  const result = await model.generateContent(prompt);

  const imagePart = result.response.candidates?.[0]?.content?.parts?.find(
    (part) => part.inlineData
  );

  if (!imagePart?.inlineData?.data) {
    console.error("Image generation response:", JSON.stringify(result.response, null, 2));
    throw new Error("Image generation response contained no image data");
  }

  return imagePart.inlineData.data;
}

// ─── TTS ──────────────────────────────────────────────────────────────────────

/**
 * Convert text to speech using gemini-2.5-flash-preview-tts via REST.
 * Returns a Buffer containing a WAV file (PCM @ 24 kHz, 16-bit mono).
 *
 * @param {string} text
 * @param {string} [voiceName="Kore"]
 * @returns {Promise<Buffer>}
 */
export async function synthesizeSpeech(text, voiceName = "Kore") {
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`TTS API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const b64 = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!b64) throw new Error("TTS response contained no audio data");

  const pcmBuffer = Buffer.from(b64, "base64");
  return pcmToWav(pcmBuffer, 1, 24000, 16);
}

/** Build a minimal WAV file from raw PCM bytes */
function pcmToWav(pcm, channels = 1, sampleRate = 24000, bitsPerSample = 16) {
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const dataSize = pcm.length;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcm]);
}

// ─── Audio evaluation ─────────────────────────────────────────────────────────

const EVAL_SYSTEM_PROMPT = `You are a certified CELPIP Speaking Test rater with 10+ years of experience. 
Evaluate the candidate's spoken response using the official CELPIP Performance Standards rubric.

Rate EACH of the four categories on a scale of 1–12 (whole numbers only):

1. COHERENCE/MEANING
   - Are there enough ideas, clearly explained?
   - Are ideas well organised so the listener can follow?
   - Does the speaker express precise meaning?

2. VOCABULARY
   - Is the range of words sufficient?
   - Are words chosen to express precise ideas with minimal hesitation?
   - Can the speaker combine words to express precise meaning?

3. LISTENABILITY
   - How much do rhythm, pronunciation, and intonation interfere?
   - How fluent is the response (note hesitations, interjections, self-corrections)?
   - Does grammar/syntax control interfere with or improve listenability?
   - Is there complexity and variety in sentence structure?

4. TASK FULFILLMENT
   - How well does the response address the task?
   - How complete is the response?
   - Is the tone appropriate for the social context?
   - Is the response long enough?

Score guide:
- 10–12: Expert. Minimal to no errors. Highly fluent, sophisticated vocabulary, fully addresses task.
- 7–9:   Competent/Adequate. Minor errors. Generally fluent, good range, mostly fulfills task.
- 5–6:   Intermediate. Noticeable errors. Some hesitation, limited range, partially fulfills task.
- 3–4:   Basic. Frequent errors. Significant hesitation, basic vocabulary, partially misses task.
- 1–2:   Developing. Very frequent errors. Barely intelligible or very limited content.

Return ONLY a JSON object with this exact shape — no markdown, no extra text:
{
  "coherence": <1-12>,
  "vocabulary": <1-12>,
  "listenability": <1-12>,
  "taskFulfillment": <1-12>,
  "transcript": "<verbatim transcription of what was said>",
  "feedback": "<2-3 sentences of specific, actionable feedback mentioning strengths and areas to improve>"
}`;

/**
 * Evaluate a user's spoken response using Gemini multimodal.
 *
 * @param {string} audioBase64 - Base64-encoded audio (webm or wav)
 * @param {string} mimeType    - e.g. "audio/webm" or "audio/wav"
 * @param {object} task        - The task object { taskType, prompt, ... }
 * @returns {Promise<{ coherence, vocabulary, listenability, taskFulfillment, transcript, feedback }>}
 */
export async function evaluateSpeakingResponse(audioBase64, mimeType, task) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const taskContext = buildTaskContext(task);

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: EVAL_SYSTEM_PROMPT },
          { text: `\n\nTASK CONTEXT:\n${taskContext}\n\nPlease evaluate the audio response below:` },
          { inlineData: { mimeType, data: audioBase64 } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });

  const text = result.response.text();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Evaluation response did not contain JSON");

  const parsed = JSON.parse(text.slice(start, end + 1));

  return {
    coherence: clamp(Number(parsed.coherence), 1, 12),
    vocabulary: clamp(Number(parsed.vocabulary), 1, 12),
    listenability: clamp(Number(parsed.listenability), 1, 12),
    taskFulfillment: clamp(Number(parsed.taskFulfillment), 1, 12),
    transcript: parsed.transcript || "",
    feedback: parsed.feedback || "",
  };
}

function clamp(n, min, max) {
  if (isNaN(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function buildTaskContext(task) {
  const lines = [
    `Task Number: ${task.taskNumber}`,
    `Task Type: ${task.taskType}`,
    `Task Prompt shown to the candidate: "${task.prompt}"`,
  ];
  if (task.sceneDescription) {
    lines.push(`Scene Description (visible to candidate): ${task.sceneDescription}`);
  }
  if (task.options) {
    lines.push(`Options presented: ${JSON.stringify(task.options)}`);
    lines.push(`Candidate chose option index: ${task.chosenOptionIndex ?? "unknown"}`);
  }
  if (task.eitherOption) {
    lines.push(`EITHER option: ${task.eitherOption}`);
    lines.push(`OR option: ${task.orOption}`);
  }
  return lines.join("\n");
}
