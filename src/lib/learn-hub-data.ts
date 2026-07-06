import { subjectPath } from "@/lib/curriculum-routes";
import type { LucideIcon } from "lucide-react";
import { BookOpen, CircleCheck, Layers, PenLine } from "lucide-react";

export type StudyModeSlug = "notes" | "flashcards" | "mcq" | "theory-quiz";

export type StudyMode = {
  slug: StudyModeSlug;
  title: string;
  description: string;
  cta: string;
  href: string;
  icon: LucideIcon;
};

export type ContinueLearningItem = {
  id: string;
  label: string;
  status: string;
  progress?: number;
  href: string;
  mode: "notes" | "flashcards" | "mcq" | "theory";
};

export type PopularSubject = {
  name: string;
  href: string;
};

export type RecentUpdate = {
  id: string;
  text: string;
  date: string;
};

const DEFAULT_BOARD = "cambridge";
const DEFAULT_LEVEL = "as-level";

export const STUDY_MODES: StudyMode[] = [
  {
    slug: "notes",
    title: "Notes",
    description: "Structured syllabus notes with examples and diagrams.",
    cta: "Start studying",
    href: "/learn/modes/notes",
    icon: BookOpen,
  },
  {
    slug: "flashcards",
    title: "Flashcards",
    description: "Memorise concepts using spaced repetition.",
    cta: "Start studying",
    href: "/learn/modes/flashcards",
    icon: Layers,
  },
  {
    slug: "mcq",
    title: "MCQ Practice",
    description: "Practice topic-wise multiple choice questions.",
    cta: "Start practicing",
    href: "/learn/modes/mcq",
    icon: CircleCheck,
  },
  {
    slug: "theory-quiz",
    title: "Theory Quiz",
    description: "Test your understanding with written-answer questions.",
    cta: "Take a quiz",
    href: "/learn/modes/theory-quiz",
    icon: PenLine,
  },
];

export const CONTINUE_LEARNING_ITEMS: ContinueLearningItem[] = [
  {
    id: "physics-flashcards",
    label: "Continue Physics Flashcards",
    status: "58% Complete",
    progress: 58,
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "physics", "9702"),
    mode: "flashcards",
  },
  {
    id: "chemistry-notes",
    label: "Continue Chemistry Notes",
    status: "Chapter 6",
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "chemistry", "9701"),
    mode: "notes",
  },
  {
    id: "biology-mcqs",
    label: "Continue Biology MCQs",
    status: "42 Questions Remaining",
    progress: 35,
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "biology", "9700"),
    mode: "mcq",
  },
];

export const POPULAR_SUBJECTS: PopularSubject[] = [
  {
    name: "Physics",
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "physics", "9702"),
  },
  {
    name: "Chemistry",
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "chemistry", "9701"),
  },
  {
    name: "Biology",
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "biology", "9700"),
  },
  {
    name: "Mathematics",
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "mathematics", "9709"),
  },
  {
    name: "Economics",
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "economics", "9708"),
  },
  {
    name: "Computer Science",
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "computer-science", "9618"),
  },
];

export const RECENT_UPDATES: RecentUpdate[] = [
  {
    id: "physics-mcqs",
    text: "Added 120 new Physics MCQs",
    date: "2 days ago",
  },
  {
    id: "chemistry-flashcards",
    text: "Updated Chemistry Flashcards",
    date: "5 days ago",
  },
  {
    id: "biology-notes",
    text: "New Biology Notes",
    date: "1 week ago",
  },
  {
    id: "mechanics-theory",
    text: "New Theory Quiz for Mechanics",
    date: "2 weeks ago",
  },
];

const STUDY_MODE_MAP = new Map(
  STUDY_MODES.map((mode) => [mode.slug, mode]),
);

export function getStudyMode(slug: string): StudyMode | undefined {
  return STUDY_MODE_MAP.get(slug as StudyModeSlug);
}

export function isValidStudyModeSlug(slug: string): slug is StudyModeSlug {
  return STUDY_MODE_MAP.has(slug as StudyModeSlug);
}
