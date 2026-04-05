# CELPIP Speaking Test — Context Summary

This file documents the structure and behaviour of the real CELPIP Speaking Test,
derived from the reference screenshots. It is the single source of truth used when
building or maintaining the simulator.

---

## 1. Global Test Overview

- **Total duration**: 15 minutes
- **Number of tasks**: 8 (always sequential, no going back)
- **Cannot skip or stop** recording once it has started
- The test is fully audio-based: the system plays audio cues; the user records spoken responses

---

## 2. Page/Screen Layout (Exact)

### 2a. Pre-test Instructions Screen
Plain white page, no header bar.
- Title: **"Speaking Test Instructions"**
- Three numbered bullet points (items 1 and 2 are greyed/muted, item 3 is bold):
  1. The Speaking Test is 15 minutes.
  2. There are 8 tasks in the Speaking Test.
  3. **Please try your best to answer all the questions.**

### 2b. Task Screen — Shared Header Bar (top of every task)
Light-grey top bar containing:
- **Left**: Task title, e.g. `Practice Test A – Speaking Task 1: Giving Advice`
- **Right**: `Preparation: 30 seconds   Recording: 90 seconds   [NEXT]`
  - The currently active phase (Preparation or Recording) is highlighted with a red/orange border
  - NEXT button is always visible (blue, top-right)

### 2c. Preparation Phase
- Main heading (bold): **"This is how much time you have to prepare."**  
  *(or just the question text if we want to match the later-task style)*
- Question box: blue information icon + question text (blue, left-aligned)
- A horizontal rule under the question
- Countdown widget (centred): light-grey card with clock icon + label **"Preparation Time"** + number in blue (counting down in seconds)
- Below widget, numbered hints appear one-by-one in bold as time passes:
  1. Your Preparation Time starts once you see the question.
  2. Read the question and think about your answer.
  *(hint 1 appears immediately; hint 2 appears after a couple of seconds)*
- No recording during this phase

### 2d. Recording Phase
- Main heading (bold): **"This is how much time you have to record your answer."**
- Same question box visible (question stays on screen)
- Recording widget (centred): grey card with microphone icon + label **"Recording…"** + animated blue progress bar (fills left-to-right)
- Below widget, numbered instructions appear one-by-one in bold:
  1. When you hear "Start speaking now," start to answer.
  2. When you hear "Time is up," stop talking.
  3. You cannot stop or skip the recording.
- Audio cues: system plays TTS "Start speaking now" at recording start, "Time is up" when time expires

---

## 3. The 8 Tasks — Full Specification

| # | Task Type | Prep | Recording | Special |
|---|-----------|------|-----------|---------|
| 1 | **Giving Advice** | 30 s | 90 s | Text-only prompt |
| 2 | **Talking about a Personal Experience** | 30 s | 60 s | Text-only prompt |
| 3 | **Describing a Scene** | 30 s | 60 s | Scene image/description |
| 4 | **Making Predictions** | 30 s | 60 s | Scene image/description (same or related scene) |
| 5 | **Comparing and Persuading** | 60 s choose + 30 s prep | 60 s | 3-part sub-flow (see below) |
| 6 | **Dealing with a Difficult Situation** | 60 s | 60 s | Text with EITHER/OR choice |
| 7 | **Expressing Opinions** | 30 s | 90 s | Question: format + "Explain your reasons." |
| 8 | **Describing an Unusual Situation** | 30 s | 60 s | Unusual object image/description |

### Task 5 Sub-flow (Comparing and Persuading)
1. **Instructions screen** (no timer, click NEXT):  
   "This task is made up of THREE parts: 1. Choose an option  2. Preparation time  3. Speaking"  
   Click next to continue.
2. **Choice screen** (60 s countdown, Preparation: 60 seconds header):  
   Two side-by-side cards, each with image + title + bullet-point specs.  
   Instruction: "Using the pictures and information below, choose the option you prefer. In the next section, you will need to persuade a family member that your choice is the better choice."  
   Note: "If you do not choose an option, the computer will choose one for you. You do not need to speak for this part."  
   User clicks a card to select. Timer counts down.
3. **Speaking phase** (normal prep/rec cycle with the chosen option context)

### Task 6 Format (Dealing with a Difficult Situation)
The question gives a scenario then says:
> Choose ONE:  
> EITHER  
> [Option A — talk to person X]  
> OR  
> [Option B — talk to person Y]

---

## 4. Scoring Rubric (Official CELPIP)

### Four Categories (each scored 1–12)
1. **Coherence / Meaning**  
   - Are there enough ideas, clearly explained?  
   - Are ideas well organised so the listener can follow?  
   - Can the test taker express precise / deeper meaning?

2. **Vocabulary**  
   - Is the range of words sufficient to complete the task?  
   - Are words chosen that help express precise ideas with minimal pausing?  
   - Can the test taker combine words to express precise meaning?

3. **Listenability**  
   - How much do rhythm, pronunciation, and intonation problems interfere?  
   - How fluent is the response (hesitations, interjections, self-corrections)?  
   - Does grammar/syntax control interfere with or improve listenability?  
   - Is there complexity and variety in sentence structure?

4. **Task Fulfillment**  
   - How well does the response address the task?  
   - How complete is the response?  
   - Is the tone appropriate for the social context?  
   - Is the response long enough?

### Score Combination
- One rater scores 4 of the 8 tasks; a second rater scores the other 4.
- Each task has one combined score from the four category ratings.
- The 8 task scores are combined into one overall Speaking score (CLB level 1–12).

### CLB Mapping (approximate)
| CELPIP Score (avg) | CLB Level | Label |
|---|---|---|
| 1–2 | 3 | Developing |
| 3–4 | 4–5 | Basic |
| 5–6 | 6–7 | Intermediate |
| 7–8 | 8–9 | Adequate |
| 9–10 | 10–11 | Competent |
| 11–12 | 12 | Expert |

---

## 5. Gemini Models Used

| Purpose | Model ID |
|---------|----------|
| Generate 8 task questions (JSON) | `gemini-2.5-flash` |
| Text-to-speech audio cues | `gemini-2.5-flash-preview-tts` |
| Transcribe + evaluate user audio | `gemini-2.5-flash` (multimodal) |

---

## 6. Sample Task Prompts (from screenshots)

- **Task 1**: "A friend is looking for a summer job. Advise him about different ways he can find work for the summer."
- **Task 2**: "Talk about a great time you had with a family member or friend. Maybe you can talk about a party, something you did together at school, a time you travelled with a friend, or anything else you can remember. What happened and why was it memorable?"
- **Task 3**: Classroom image — "Describe some things that are happening in the picture below as well as you can. The person with whom you are speaking cannot see the picture."
- **Task 4**: Same classroom image — "In this picture, what do you think will most probably happen next?"
- **Task 5**: Two house options — "Your family is relocating to another area, and you are looking for a new home there. You found two suitable options. Using the pictures and information below, choose the option that you prefer."
- **Task 6**: Cousin/roommate situation — "A close cousin who lives in another country is coming to visit for a year…" with EITHER/OR choice
- **Task 7**: "Do you think that young adults should pay rent to their parents if they do not move out by the age of 21? Explain your reasons."
- **Task 8**: Unusual watermelon table — "You are in a furniture store and you see a table you would like to buy, but the store clerk won't let you take a photo. Phone a member of your family. Provide a full and clear description of the table and ask if you can buy the table."
