import { synthesizeSpeech } from '../lib/speakingGemini.js';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'audio');

const CUES = [
  { text: 'Start speaking now.', filename: 'start-speaking.wav' },
  { text: 'Time is up.',          filename: 'time-is-up.wav'      },
];

await mkdir(outDir, { recursive: true });
for (const { text, filename } of CUES) {
  const buffer = await synthesizeSpeech(text);
  await writeFile(join(outDir, filename), buffer);
  console.log(`Saved public/audio/${filename}`);
}
