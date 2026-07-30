export const PASTEL_COLORS = [
  "#F7C9B6",
  "#F4DEA6",
  "#CBE8D8",
  "#BFDDF5",
  "#D9D0F8",
  "#F6D2E0",
] as const;

export type PracticeRating = "hard" | "medium" | "easy";

export type FlashcardProgress = {
  attempts: number;
  mediumCount: number;
  hardCount: number;
  easyCount: number;
  consecutiveCorrect: number;
  learningStep: number;
  masteryScore: number;
  lastRating: PracticeRating | null;
  lastReviewedAt: string | null;
  nextDueAt: string | null;
  masteredAt: string | null;
};

export type Flashcard = {
  id: string;
  question: string;
  answer: string;
  hint: string;
  tags: string[];
  progress: FlashcardProgress;
  createdAt: string;
  updatedAt: string;
};

export type FlashcardSet = {
  id: string;
  title: string;
  description: string;
  color: (typeof PASTEL_COLORS)[number];
  cards: Flashcard[];
  createdAt: string;
  updatedAt: string;
};

export type FlashcardLibrary = {
  version: 1;
  sets: FlashcardSet[];
};

export type PracticeHistoryEntry = {
  cardId: string;
  rating: PracticeRating;
  reviewedAt: string;
  masteryScoreAfterReview: number;
};

export type PracticeSessionState = {
  activeQueue: string[];
  reviewQueue: string[];
  revealed: boolean;
  history: PracticeHistoryEntry[];
  masteredCardIds: string[];
};

export type SetReadiness =
  | "empty"
  | "fresh"
  | "review"
  | "almost-ready"
  | "ready";

export type SetAnalytics = {
  totalCards: number;
  practicedCards: number;
  newCards: number;
  masteredCards: number;
  dueCards: number;
  strugglingCards: number;
  averageMasteryScore: number;
  lastPracticedAt: string | null;
  readiness: SetReadiness;
  recommendationTitle: string;
  recommendationBody: string;
};
