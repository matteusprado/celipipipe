# CELPIP Reading Simulator

Next.js app: timed Reading practice (4 parts, 38 questions), optional Gemini-generated variations, and score estimate from the published raw-score bands.

## Setup

1. Use Node via [nvm](https://github.com/nvm-sh/nvm) (LTS recommended).
2. `npm install`
3. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` (or `GOOGLE_API_KEY`).
4. Restart the dev server whenever you change `.env.local`.
5. `npm run dev` → open [http://localhost:3000](http://localhost:3000)

**Start new Reading test** calls Gemini each time and requires a valid API key. If the key is missing, you’ll see an error on the home page. Use **Use built-in sample** for offline practice without an API key.

## Optional env

| Variable | Description |
| --- | --- |
| `GEMINI_API_KEY` | Primary key (Google AI Studio) |
| `GOOGLE_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` | Accepted aliases |
| `GEMINI_MODEL` | Default `gemini-2.0-flash` |
| `GEMINI_USE_GOOGLE_SEARCH` | Set to `true` to request Google Search grounding when your account/model supports it |

## Scripts

- `npm run dev` — development server
- `npm run build` / `npm start` — production
- `npm run lint` — ESLint

## Structure

- [`lib/sample-test.json`](lib/sample-test.json) — reference test (official practice structure + answer pattern)
- [`app/api/generate-test/route.js`](app/api/generate-test/route.js) — generates or returns sample
- [`lib/scoring.js`](lib/scoring.js) — raw score → CELPIP / CLB band (practice chart)

Writing, Speaking, and Listening are stubbed on the home page for future work.
