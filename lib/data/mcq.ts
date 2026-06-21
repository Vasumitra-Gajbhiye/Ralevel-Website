import connectDB from "@/lib/mongodb";
import MCQ from "@/models/MCQ";
import type {
  McqPracticeSet,
  PracticeQuestion,
  PracticeSetStats,
} from "@/lib/quiz/practice-types";

const DEMO_QUESTIONS: PracticeQuestion[] = [
  {
    id: 1,
    question:
      "A transverse wave travels along a stretched string. What is the phase difference between two points on the string that are separated by a distance of $\\frac{\\lambda}{2}$?",
    options: [
      "0 \\text{ rad}",
      "\\frac{\\pi}{2} \\text{ rad}",
      "\\pi \\text{ rad}",
      "2\\pi \\text{ rad}",
    ],
    answer: 2,
    hints: [
      "Remember that a full wavelength corresponds to a complete cycle.",
      "A complete cycle in radians is $2\\pi$.",
    ],
    explain:
      "A full wavelength ($\\lambda$) corresponds to a phase difference of $2\\pi$. Therefore, a distance of $\\frac{\\lambda}{2}$ corresponds exactly to half of that phase difference, which is $\\pi$ radians.",
    mockAnswer:
      "Model Concept: Phase difference $\\Delta\\phi$ is related to path difference $\\Delta x$ by the formula $\\Delta\\phi = \\frac{2\\pi}{\\lambda} \\Delta x$. Substituting $\\Delta x = \\frac{\\lambda}{2}$ yields $\\pi$ radians.",
  },
  {
    id: 2,
    question:
      "Which of the following correctly describes the principle of superposition?",
    options: [
      "When two waves meet, their amplitudes multiply.",
      "When two waves meet, the resultant displacement is the vector sum of their individual displacements.",
      "Waves always reflect when they meet another wave.",
      "Two waves can never occupy the same space at the same time.",
    ],
    answer: 1,
    hints: [
      "Think about what happens to the height (displacement) of the water when two ripples crash into each other.",
      "Is it a scalar addition or a vector addition?",
    ],
    explain:
      "The principle of superposition states that when two or more waves overlap, the resultant displacement at any point is the vector sum of the displacements of the individual waves at that point.",
    mockAnswer:
      "Model Concept: Superposition is a fundamental property of all linear wave systems (light, sound, water). Constructive interference occurs when displacements are in the same direction, and destructive when opposite.",
  },
  {
    id: 3,
    question:
      "In a stationary wave, what is the specific term for a point of minimum or zero amplitude?",
    options: ["Antinode", "Crest", "Trough", "Node"],
    answer: 3,
    hints: [],
    explain:
      "A node is a point along a stationary wave where the wave has minimum (or zero) amplitude. This occurs due to continuous destructive interference between the incident and reflected waves.",
    mockAnswer:
      "Model Concept: Stationary waves are characterized by alternating Nodes (zero amplitude) and Antinodes (maximum amplitude). The distance between two adjacent nodes is exactly $\\frac{\\lambda}{2}$.",
  },
];

function buildStats(questions: PracticeQuestion[]): PracticeSetStats {
  return {
    totalQuestions: questions.length,
    totalMarks: questions.length,
    estimatedMinutes: Math.max(5, Math.ceil(questions.length * 1.5)),
  };
}

function toPracticeQuestion(
  doc: {
    _id: { toString(): string };
    stem: string;
    options: string[];
    answer: number;
    explain: string;
  },
  index: number
): PracticeQuestion {
  return {
    id: index + 1,
    question: doc.stem,
    options: doc.options,
    answer: doc.answer,
    explain: doc.explain,
    hints: [],
  };
}

type McqSetParams = {
  board: string;
  level: string;
  subject: string;
  subjectCode: string;
  chapter: string;
  set: string;
};

export async function getMcqPracticeSet(
  params: McqSetParams
): Promise<McqPracticeSet> {
  const fallback: McqPracticeSet = {
    title: "Physics Multiple Choice",
    description: "Test your understanding of wave mechanics and superposition.",
    questions: DEMO_QUESTIONS,
    stats: buildStats(DEMO_QUESTIONS),
  };

  try {
    await connectDB();

    const docs = await MCQ.find({
      board: params.board,
      level: params.level,
      subject: params.subject,
      code: params.subjectCode,
      chapterSlug: params.chapter,
      type: "calculation",
      published: true,
    })
      .sort({ createdAt: 1 })
      .limit(50)
      .lean();

    if (!docs.length) return fallback;

    const questions = docs.map((doc, index) =>
      toPracticeQuestion(
        doc as unknown as {
          _id: { toString(): string };
          stem: string;
          options: string[];
          answer: number;
          explain: string;
        },
        index
      )
    );

    return {
      title: "MCQ Practice",
      description: `Practice set for ${params.chapter.replace(/-/g, " ")}.`,
      questions,
      stats: buildStats(questions),
    };
  } catch {
    return fallback;
  }
}
