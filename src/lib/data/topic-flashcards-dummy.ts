import type { TopicFlashcardSetSummary } from "@/types/topic-flashcards";

const TAJ_MAHAL_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg";

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
        question:
          "State the SI base unit for mass and write its symbol using LaTeX.",
        answer: "The kilogram, written as $\\text{kg}$.",
        hint: "It is one of the seven SI base units.",
        tags: ["units", "mass"],
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
        question:
          "Write the derived unit for speed using base units: $v = \\frac{\\Delta s}{\\Delta t}$.",
        answer: "Speed has SI unit $\\text{m s}^{-1}$ (metres per second).",
        hint: "Distance divided by time.",
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
        question:
          "What does the prefix **kilo** ($k$) represent? Give the factor in scientific notation.",
        answer: "A factor of $10^3$ (1000).",
        hint: "Think kilogram or kilometre.",
        tags: ["prefixes", "units"],
      },
      {
        id: "up-2",
        question:
          "What does the prefix **milli** ($m$) represent? Give the factor in scientific notation.",
        answer: "A factor of $10^{-3}$ (0.001).",
        hint: "Used in millimetre and millisecond.",
        tags: ["prefixes", "units"],
      },
      {
        id: "up-3",
        question: "Convert $3.2\\ \\text{km}$ into metres.",
        answer: "$3200\\ \\text{m}$",
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
        answer: "A quantity that has both magnitude and direction.",
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
  {
    id: "rich-content",
    title: "Rich Content Examples",
    description:
      "Test cards with LaTeX equations and image layouts (1–4 rows).",
    difficulty: "Easy",
    cards: [
      {
        id: "rc-1",
        question:
          "Recall Newton's second law. Write the equation relating force, mass, and acceleration.",
        answer: "$$F = ma$$ where $F$ is force (N), $m$ is mass (kg), and $a$ is acceleration ($\\text{m s}^{-2}$).",
        hint: "Force equals mass times acceleration.",
        tags: ["equations", "forces"],
      },
      {
        id: "rc-2",
        question: "Identify this landmark and state which country it is in.",
        answer: "The Taj Mahal, located in Agra, India.",
        hint: "A famous white marble mausoleum.",
        tags: ["images", "1-row"],
        questionMedia: {
          rows: 1,
          images: [
            {
              src: TAJ_MAHAL_IMAGE,
              alt: "The Taj Mahal viewed from the main garden pathway",
            },
          ],
        },
      },
      {
        id: "rc-3",
        question:
          "This card uses a **2-row** image layout. What is the kinetic energy formula?",
        answer: "$$E_k = \\frac{1}{2}mv^2$$",
        tags: ["images", "2-row", "equations"],
        questionMedia: {
          rows: 2,
          images: [
            { src: TAJ_MAHAL_IMAGE, alt: "Taj Mahal — row 1, image 1" },
            { src: TAJ_MAHAL_IMAGE, alt: "Taj Mahal — row 2, image 1" },
          ],
        },
      },
      {
        id: "rc-4",
        question:
          "This card uses a **3-row** image layout. State the equation for gravitational field strength.",
        answer: "$$g = \\frac{GM}{r^2}$$",
        tags: ["images", "3-row", "equations"],
        questionMedia: {
          rows: 3,
          images: [
            { src: TAJ_MAHAL_IMAGE, alt: "Taj Mahal — row 1" },
            { src: TAJ_MAHAL_IMAGE, alt: "Taj Mahal — row 2" },
            { src: TAJ_MAHAL_IMAGE, alt: "Taj Mahal — row 3" },
          ],
        },
      },
      {
        id: "rc-5",
        question:
          "This card uses a **4-row** image layout (maximum). What is the density formula?",
        answer: "$$\\rho = \\frac{m}{V}$$",
        tags: ["images", "4-row", "equations"],
        questionMedia: {
          rows: 4,
          images: [
            { src: TAJ_MAHAL_IMAGE, alt: "Taj Mahal — row 1" },
            { src: TAJ_MAHAL_IMAGE, alt: "Taj Mahal — row 2" },
            { src: TAJ_MAHAL_IMAGE, alt: "Taj Mahal — row 3" },
            { src: TAJ_MAHAL_IMAGE, alt: "Taj Mahal — row 4" },
          ],
        },
        answerMedia: {
          rows: 1,
          images: [
            {
              src: TAJ_MAHAL_IMAGE,
              alt: "Taj Mahal on the answer side",
            },
          ],
        },
      },
    ],
    stats: {
      totalCards: 5,
      masteredCards: 0,
      newCards: 5,
      dueCards: 0,
      lastPracticedAt: null,
    },
  },
];
