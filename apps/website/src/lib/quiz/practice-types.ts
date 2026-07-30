export type PracticeQuestion = {
  id: number;
  question: string;
  options: string[];
  answer: number;
  hints?: string[];
  explain: string;
  mockAnswer?: string;
};

export type PracticeSetStats = {
  totalQuestions: number;
  totalMarks: number;
  estimatedMinutes: number;
};

export type McqPracticeSet = {
  title: string;
  description: string;
  questions: PracticeQuestion[];
  stats: PracticeSetStats;
};
