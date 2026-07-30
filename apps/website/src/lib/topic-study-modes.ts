import type { LucideIcon } from "lucide-react";
import {
  CircleCheck,
  Image,
  Layers,
  ListChecks,
  PenLine,
} from "lucide-react";

export type TopicStudyModeSlug =
  | "mcq-practice"
  | "theory-practice"
  | "flashcards"
  | "solved-questions"
  | "diagrams";

export type TopicStudyMode = {
  slug: TopicStudyModeSlug;
  label: string;
  icon: LucideIcon;
};

export const TOPIC_STUDY_MODES: TopicStudyMode[] = [
  {
    slug: "mcq-practice",
    label: "Practice MCQ",
    icon: CircleCheck,
  },
  {
    slug: "theory-practice",
    label: "Practice Theory",
    icon: PenLine,
  },
  {
    slug: "flashcards",
    label: "Flashcards",
    icon: Layers,
  },
  {
    slug: "solved-questions",
    label: "Solved Questions",
    icon: ListChecks,
  },
  {
    slug: "diagrams",
    label: "Diagrams",
    icon: Image,
  },
];

export function getTopicStudyMode(slug: TopicStudyModeSlug) {
  return TOPIC_STUDY_MODES.find((mode) => mode.slug === slug);
}
