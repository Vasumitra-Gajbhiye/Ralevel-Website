import type {
  ContinueLearningItem,
  PopularSubject,
  RecentUpdate,
} from "@/lib/learn-hub-data";
import { POPULAR_SUBJECTS } from "@/lib/learn-hub-data";
import { subjectPath } from "@/lib/curriculum-routes";
import type { LucideIcon } from "lucide-react";
import { Flame, Layers, Shuffle, Target, Timer, Trophy, Zap } from "lucide-react";

const DEFAULT_BOARD = "cambridge";
const DEFAULT_LEVEL = "as-level";

export type DailyReviewStat = {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
};

export type QuickPracticeItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export type ResourceBrowseSection =
  | {
      type: "continue";
      title: string;
      description?: string;
      items: ContinueLearningItem[];
    }
  | {
      type: "daily-review";
      title: string;
      description?: string;
      stats: DailyReviewStat[];
    }
  | {
      type: "quick-practice";
      title: string;
      description?: string;
      items: QuickPracticeItem[];
    }
  | {
      type: "popular-subjects";
      title?: string;
      description?: string;
      items?: PopularSubject[];
    }
  | { type: "browse-boards"; title?: string; description?: string }
  | {
      type: "recent";
      title: string;
      description?: string;
      items: RecentUpdate[];
    };

export type ResourceBrowseConfig = {
  hero: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
  };
  sections: ResourceBrowseSection[];
};

const NOTES_CONTINUE_ITEMS: ContinueLearningItem[] = [
  {
    id: "physics-forces",
    label: "Physics • Forces and Motion",
    status: "62% complete",
    progress: 62,
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "physics", "9702"),
    mode: "notes",
  },
  {
    id: "chemistry-organic",
    label: "Chemistry • Organic Chemistry",
    status: "Chapter 4",
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "chemistry", "9701"),
    mode: "notes",
  },
  {
    id: "biology-cells",
    label: "Biology • Cell Structure",
    status: "28% complete",
    progress: 28,
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "biology", "9700"),
    mode: "notes",
  },
];

const FLASHCARDS_CONTINUE_ITEMS: ContinueLearningItem[] = [
  {
    id: "physics-flashcards",
    label: "Physics • Waves and Optics",
    status: "34 cards remaining",
    progress: 72,
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "physics", "9702"),
    mode: "flashcards",
  },
  {
    id: "chemistry-flashcards",
    label: "Chemistry • Bonding",
    status: "18 cards remaining",
    progress: 55,
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "chemistry", "9701"),
    mode: "flashcards",
  },
  {
    id: "biology-flashcards",
    label: "Biology • Enzymes",
    status: "12 cards remaining",
    progress: 88,
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "biology", "9700"),
    mode: "flashcards",
  },
];

const MCQ_CONTINUE_ITEMS: ContinueLearningItem[] = [
  {
    id: "physics-mcq",
    label: "Physics • Electricity",
    status: "15 questions remaining",
    progress: 45,
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "physics", "9702"),
    mode: "mcq",
  },
  {
    id: "chemistry-mcq",
    label: "Chemistry • Energetics",
    status: "22 questions remaining",
    progress: 30,
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "chemistry", "9701"),
    mode: "mcq",
  },
  {
    id: "biology-mcq",
    label: "Biology • Transport in Plants",
    status: "8 questions remaining",
    progress: 80,
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "biology", "9700"),
    mode: "mcq",
  },
];

const THEORY_CONTINUE_ITEMS: ContinueLearningItem[] = [
  {
    id: "physics-theory",
    label: "Physics • Circular Motion",
    status: "3 questions remaining",
    progress: 60,
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "physics", "9702"),
    mode: "theory",
  },
  {
    id: "chemistry-theory",
    label: "Chemistry • Equilibria",
    status: "5 questions remaining",
    progress: 40,
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "chemistry", "9701"),
    mode: "theory",
  },
  {
    id: "biology-theory",
    label: "Biology • Photosynthesis",
    status: "2 questions remaining",
    progress: 85,
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "biology", "9700"),
    mode: "theory",
  },
];

const DAILY_REVIEW_STATS: DailyReviewStat[] = [
  {
    id: "due-today",
    label: "Cards due today",
    value: "48",
    icon: Layers,
  },
  {
    id: "mastered",
    label: "Cards mastered",
    value: "125",
    icon: Trophy,
  },
  {
    id: "streak",
    label: "Day streak",
    value: "6",
    icon: Flame,
  },
];

const QUICK_PRACTICE_ITEMS: QuickPracticeItem[] = [
  {
    id: "random-physics",
    title: "10 Random Physics Questions",
    description: "Test yourself across all Physics topics.",
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "physics", "9702"),
    icon: Shuffle,
  },
  {
    id: "mixed-chemistry",
    title: "25 Mixed Chemistry Questions",
    description: "A broader set covering key Chemistry chapters.",
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "chemistry", "9701"),
    icon: Zap,
  },
  {
    id: "timed-practice",
    title: "Timed Practice",
    description: "Answer questions against the clock.",
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "physics", "9702"),
    icon: Timer,
  },
  {
    id: "exam-mode",
    title: "Exam Mode",
    description: "Simulate exam conditions with no hints.",
    href: subjectPath(DEFAULT_BOARD, DEFAULT_LEVEL, "biology", "9700"),
    icon: Target,
  },
];

export const NOTES_BROWSE_CONFIG: ResourceBrowseConfig = {
  hero: {
    title: "Notes",
    subtitle:
      "Browse structured syllabus notes organised by board, subject, chapter and topic.",
    searchPlaceholder: "Search notes, subjects, chapters or topics...",
  },
  sections: [
    {
      type: "continue",
      title: "Continue Reading",
      description: "Pick up where you left off.",
      items: NOTES_CONTINUE_ITEMS,
    },
    {
      type: "popular-subjects",
      title: "Popular Subjects",
      description: "Jump straight into the most studied subjects.",
      items: POPULAR_SUBJECTS,
    },
    {
      type: "browse-boards",
      title: "Browse by Board",
      description:
        "Select your exam board to find resources tailored to your syllabus.",
    },
    {
      type: "recent",
      title: "Recently Updated Notes",
      description: "The latest notes added to the platform.",
      items: [
        {
          id: "electrolysis",
          text: "Added Electrolysis Notes",
          date: "2 days ago",
        },
        {
          id: "organic-chem",
          text: "Updated Organic Chemistry Notes",
          date: "4 days ago",
        },
        {
          id: "mechanics",
          text: "New Mechanics Revision Notes",
          date: "1 week ago",
        },
      ],
    },
  ],
};

export const FLASHCARDS_BROWSE_CONFIG: ResourceBrowseConfig = {
  hero: {
    title: "Flashcards",
    subtitle:
      "Master every topic using spaced repetition and active recall.",
    searchPlaceholder: "Search flashcards...",
  },
  sections: [
    {
      type: "continue",
      title: "Continue Flashcards",
      description: "Resume your flashcard decks.",
      items: FLASHCARDS_CONTINUE_ITEMS,
    },
    {
      type: "daily-review",
      title: "Daily Review",
      description: "Keep your streak going with today's review session.",
      stats: DAILY_REVIEW_STATS,
    },
    {
      type: "popular-subjects",
      title: "Popular Subjects",
      description: "Jump straight into the most studied subjects.",
      items: POPULAR_SUBJECTS,
    },
    {
      type: "browse-boards",
      title: "Browse by Board",
      description:
        "Select your exam board to find resources tailored to your syllabus.",
    },
    {
      type: "recent",
      title: "Recently Added Flashcards",
      description: "The latest flashcard decks added to the platform.",
      items: [
        {
          id: "waves-flashcards",
          text: "Added Waves and Optics Flashcards",
          date: "1 day ago",
        },
        {
          id: "bonding-flashcards",
          text: "New Bonding Flashcard Deck",
          date: "3 days ago",
        },
        {
          id: "enzymes-flashcards",
          text: "Updated Enzymes Flashcard Set",
          date: "5 days ago",
        },
      ],
    },
  ],
};

export const MCQ_BROWSE_CONFIG: ResourceBrowseConfig = {
  hero: {
    title: "MCQ Practice",
    subtitle:
      "Practice thousands of exam-style multiple choice questions.",
    searchPlaceholder: "Search MCQ topics...",
  },
  sections: [
    {
      type: "continue",
      title: "Continue Practice",
      description: "Pick up where you left off.",
      items: MCQ_CONTINUE_ITEMS,
    },
    {
      type: "quick-practice",
      title: "Quick Practice",
      description: "Jump straight into a practice session.",
      items: QUICK_PRACTICE_ITEMS,
    },
    {
      type: "popular-subjects",
      title: "Popular Subjects",
      description: "Jump straight into the most studied subjects.",
      items: POPULAR_SUBJECTS,
    },
    {
      type: "browse-boards",
      title: "Browse by Board",
      description:
        "Select your exam board to find resources tailored to your syllabus.",
    },
    {
      type: "recent",
      title: "Recently Added Question Banks",
      description: "The latest MCQ sets added to the platform.",
      items: [
        {
          id: "electricity-mcqs",
          text: "Added 80 Electricity MCQs",
          date: "2 days ago",
        },
        {
          id: "energetics-mcqs",
          text: "New Energetics Question Bank",
          date: "4 days ago",
        },
        {
          id: "transport-mcqs",
          text: "Updated Transport in Plants MCQs",
          date: "1 week ago",
        },
      ],
    },
  ],
};

export const THEORY_BROWSE_CONFIG: ResourceBrowseConfig = {
  hero: {
    title: "Theory Practice",
    subtitle:
      "Improve your written answers with structured theory questions.",
    searchPlaceholder: "Search theory questions...",
  },
  sections: [
    {
      type: "continue",
      title: "Continue Practice",
      description: "Pick up where you left off.",
      items: THEORY_CONTINUE_ITEMS,
    },
    {
      type: "popular-subjects",
      title: "Popular Subjects",
      description: "Jump straight into the most studied subjects.",
      items: POPULAR_SUBJECTS,
    },
    {
      type: "browse-boards",
      title: "Browse by Board",
      description:
        "Select your exam board to find resources tailored to your syllabus.",
    },
    {
      type: "recent",
      title: "Recently Added Theory Questions",
      description: "The latest theory questions added to the platform.",
      items: [
        {
          id: "circular-motion",
          text: "Added Circular Motion Theory Questions",
          date: "3 days ago",
        },
        {
          id: "equilibria",
          text: "New Equilibria Question Set",
          date: "5 days ago",
        },
        {
          id: "photosynthesis",
          text: "Updated Photosynthesis Theory Questions",
          date: "1 week ago",
        },
      ],
    },
  ],
};
