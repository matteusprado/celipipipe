/**
 * CELPIP Speaking Test — task definitions, timings, and type constants.
 * All timings are in seconds as per the official test.
 */

export const TASK_TYPES = {
  GIVING_ADVICE: "givingAdvice",
  PERSONAL_EXPERIENCE: "personalExperience",
  DESCRIBING_SCENE: "describingScene",
  MAKING_PREDICTIONS: "makingPredictions",
  COMPARING_PERSUADING: "comparingPersuading",
  DIFFICULT_SITUATION: "difficultSituation",
  EXPRESSING_OPINIONS: "expressingOpinions",
  UNUSUAL_SITUATION: "unusualSituation",
};

/**
 * Static metadata for each of the 8 tasks.
 * The `prompt` fields are placeholders; actual content is AI-generated at runtime.
 */
export const TASK_METADATA = [
  {
    taskNumber: 1,
    taskType: TASK_TYPES.GIVING_ADVICE,
    label: "Giving Advice",
    prepSeconds: 30,
    recordSeconds: 90,
    hasImage: false,
    hasOptions: false,
    instruction: "A friend is asking for your advice. Read the situation below and advise them as clearly and thoroughly as you can.",
  },
  {
    taskNumber: 2,
    taskType: TASK_TYPES.PERSONAL_EXPERIENCE,
    label: "Talking about a Personal Experience",
    prepSeconds: 30,
    recordSeconds: 60,
    hasImage: false,
    hasOptions: false,
    instruction: "Talk about a personal experience. Be specific and explain what happened and why it was meaningful.",
  },
  {
    taskNumber: 3,
    taskType: TASK_TYPES.DESCRIBING_SCENE,
    label: "Describing a Scene",
    prepSeconds: 30,
    recordSeconds: 60,
    hasImage: true,
    hasOptions: false,
    instruction: "Describe some things that are happening in the scene below as well as you can. The person with whom you are speaking cannot see the picture.",
  },
  {
    taskNumber: 4,
    taskType: TASK_TYPES.MAKING_PREDICTIONS,
    label: "Making Predictions",
    prepSeconds: 30,
    recordSeconds: 60,
    hasImage: true,
    hasOptions: false,
    instruction: "In this picture, what do you think will most probably happen next?",
  },
  {
    taskNumber: 5,
    taskType: TASK_TYPES.COMPARING_PERSUADING,
    label: "Comparing and Persuading",
    prepSeconds: 30,
    recordSeconds: 60,
    choiceSeconds: 60,
    hasImage: false,
    hasOptions: true,
    instruction: "Choose the option you prefer, then persuade a family member that your choice is the better one.",
  },
  {
    taskNumber: 6,
    taskType: TASK_TYPES.DIFFICULT_SITUATION,
    label: "Dealing with a Difficult Situation",
    prepSeconds: 60,
    recordSeconds: 60,
    hasImage: false,
    hasOptions: false,
    instruction: "Read the situation below. Choose ONE option and speak to the appropriate person.",
  },
  {
    taskNumber: 7,
    taskType: TASK_TYPES.EXPRESSING_OPINIONS,
    label: "Expressing Opinions",
    prepSeconds: 30,
    recordSeconds: 90,
    hasImage: false,
    hasOptions: false,
    instruction: "Answer the following question and explain your reasons.",
  },
  {
    taskNumber: 8,
    taskType: TASK_TYPES.UNUSUAL_SITUATION,
    label: "Describing an Unusual Situation",
    prepSeconds: 30,
    recordSeconds: 60,
    hasImage: true,
    hasOptions: false,
    instruction: "You see an unusual object. Phone a member of your family. Provide a full and clear description and ask for their opinion.",
  },
];

/** Storage key for the generated speaking test */
export const SPEAKING_TEST_KEY = "celpip_speaking_test";

/** Storage key for the accumulated task scores */
export const SPEAKING_SCORES_KEY = "celpip_speaking_scores";
