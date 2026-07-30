/** Number of columns in the image grid (1–4). Images fill left-to-right, top-to-bottom. */
export type FlashcardImageColumnLayout = 1 | 2 | 3 | 4;

export type FlashcardImage = {
  src: string;
  alt: string;
};

export type FlashcardMedia = {
  images: FlashcardImage[];
  columns: FlashcardImageColumnLayout;
};

export type TopicFlashcard = {
  id: string;
  /** Markdown string with optional inline ($...$) and block ($$...$$) LaTeX. */
  question: string;
  answer: string;
  hint?: string;
  tags?: string[];
  questionMedia?: FlashcardMedia;
  answerMedia?: FlashcardMedia;
};

export type TopicFlashcardSetSummary = {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  cards: TopicFlashcard[];
  stats: {
    totalCards: number;
    masteredCards: number;
    newCards: number;
    dueCards: number;
    lastPracticedAt: string | null;
  };
};
