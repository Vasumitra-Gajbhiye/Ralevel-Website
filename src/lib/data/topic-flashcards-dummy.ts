export type TopicFlashcard = {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  tags?: string[];
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

export const dummyFlashcardSets: TopicFlashcardSetSummary[] = [
  {
    id: "core-definitions",
    title: "Core Definitions",
    description:
      "Key definitions and fundamental ideas about physical quantities you must know.",
    difficulty: "Easy",
    cards: [
      {
        id: "pq-1",
        question: "What is a physical quantity?",
        answer:
          "A property that can be measured and expressed with a numerical value and a unit.",
        hint: "Think about things like length, mass, or time.",
        tags: ["definitions", "quantities"],
      },
      {
        id: "pq-2",
        question: "What are base quantities?",
        answer:
          "Fundamental physical quantities from which all other quantities are derived (e.g. length, mass, time).",
        hint: "They form the foundation of the SI system.",
        tags: ["definitions", "base quantities"],
      },
      {
        id: "pq-3",
        question: "What is the SI unit of length?",
        answer: "The metre (m).",
        hint: "It is one of the seven SI base units.",
        tags: ["units", "length"],
      },
      {
        id: "pq-4",
        question: "Define a derived quantity.",
        answer:
          "A quantity defined in terms of base quantities, such as speed (m/s) or force (N).",
        hint: "Speed combines length and time.",
        tags: ["definitions", "derived quantities"],
      },
      {
        id: "pq-5",
        question: "What is the difference between accuracy and precision?",
        answer:
          "Accuracy is how close a measurement is to the true value; precision is how consistent repeated measurements are.",
        hint: "One is about correctness, the other about repeatability.",
        tags: ["measurements", "errors"],
      },
    ],
    stats: {
      totalCards: 5,
      masteredCards: 2,
      newCards: 2,
      dueCards: 1,
      lastPracticedAt: "2 days ago",
    },
  },
  {
    id: "units-prefixes",
    title: "Units & Prefixes",
    description:
      "Focus on SI units, standard prefixes, conversions, and measurement accuracy.",
    difficulty: "Medium",
    cards: [
      {
        id: "up-1",
        question: "What does the prefix 'kilo' (k) represent?",
        answer: "A factor of 10³ (1000).",
        hint: "Think kilogram or kilometre.",
        tags: ["prefixes", "units"],
      },
      {
        id: "up-2",
        question: "What does the prefix 'milli' (m) represent?",
        answer: "A factor of 10⁻³ (0.001).",
        hint: "Used in millimetre and millisecond.",
        tags: ["prefixes", "units"],
      },
      {
        id: "up-3",
        question: "Convert 3.2 km into metres.",
        answer: "3200 m",
        hint: "Multiply by 1000.",
        tags: ["conversions", "length"],
      },
      {
        id: "up-4",
        question: "What is a scalar quantity?",
        answer:
          "A quantity that has magnitude only, with no associated direction.",
        hint: "Mass and temperature are examples.",
        tags: ["definitions", "scalars"],
      },
      {
        id: "up-5",
        question: "What is a vector quantity?",
        answer:
          "A quantity that has both magnitude and direction.",
        hint: "Velocity and force are examples.",
        tags: ["definitions", "vectors"],
      },
    ],
    stats: {
      totalCards: 5,
      masteredCards: 0,
      newCards: 4,
      dueCards: 1,
      lastPracticedAt: null,
    },
  },
];
