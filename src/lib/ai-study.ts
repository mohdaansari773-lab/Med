/** Client-safe constants shared by the AI Study Mode UI and server function. */
export const STUDY_MODES = [
  { key: "explain", label: "Explain", hint: "Step-by-step explanation" },
  { key: "quiz", label: "Quiz Me", hint: "5 questions with answers" },
  { key: "flashcard", label: "Flashcard Me", hint: "Front/back cards" },
  { key: "mnemonic", label: "Give Mnemonic", hint: "Memory aid" },
  { key: "simplify", label: "Simplify", hint: "Very simple language" },
  { key: "compare", label: "Compare", hint: "Side-by-side differences" },
  { key: "revise", label: "Revise", hint: "High-yield recap" },
] as const;

export type StudyMode = (typeof STUDY_MODES)[number]["key"];

export const STUDY_MODE_KEYS = STUDY_MODES.map((m) => m.key) as unknown as [
  StudyMode,
  ...StudyMode[],
];
