export type BlogRecommendation = {
  id: string;
  author: string;
  publication?: string;
  dateLabel: string;
  title: string;
  description: string;
  claps: number;
  comments: number;
  starred?: boolean;
};

export const DUMMY_AUTHOR_RECOMMENDATIONS: BlogRecommendation[] = [
  {
    id: "a1",
    author: "Mark Andrews",
    dateLabel: "2d ago",
    title: "Why inherited dread works better than jump scares",
    description:
      "Slow-burn horror lives in what you don't show. Here's how restraint builds tension across a full game.",
    claps: 142,
    comments: 18,
    starred: true,
  },
  {
    id: "a2",
    author: "Mark Andrews",
    publication: "Bootcamp",
    dateLabel: "Oct 2, 2025",
    title: "Designing puzzles that teach without lecturing",
    description:
      "Good puzzle design doesn't explain the mechanic first — it lets the player discover the rule through play.",
    claps: 89,
    comments: 7,
  },
  {
    id: "a3",
    author: "Mark Andrews",
    dateLabel: "Nov 14, 2025",
    title: "A-level revision: the 80/20 approach that actually sticks",
    description:
      "Most students over-index on content coverage. Focus on the topics that move grades instead.",
    claps: 256,
    comments: 31,
  },
  {
    id: "a4",
    author: "Mark Andrews",
    dateLabel: "Jan 5, 2026",
    title: "Building an indie game while teaching full-time",
    description:
      "Time-boxing, scope control, and why weekends are for prototyping — not polishing.",
    claps: 67,
    comments: 12,
  },
];

export const DUMMY_RALEVEL_RECOMMENDATIONS: BlogRecommendation[] = [
  {
    id: "r1",
    author: "Sophie L",
    dateLabel: "1d ago",
    title: "CAIE Biology Paper 2: the topics students miss every year",
    description:
      "Photosynthesis graphs, enzyme kinetics, and the mark-scheme phrases examiners look for.",
    claps: 94,
    comments: 14,
  },
  {
    id: "r2",
    author: "James K",
    dateLabel: "3d ago",
    title: "How I went from a C to an A* in A-level Maths",
    description:
      "Past papers, error logs, and why understanding proofs beat memorising methods.",
    claps: 312,
    comments: 42,
    starred: true,
  },
  {
    id: "r3",
    author: "Aisha M",
    dateLabel: "5d ago",
    title: "Edexcel Chemistry: enthalpy cycles without the panic",
    description:
      "A visual framework for Hess's law questions that stops you losing easy marks.",
    claps: 78,
    comments: 9,
  },
  {
    id: "r4",
    author: "Tom R",
    dateLabel: "1w ago",
    title: "Physics practical write-ups that examiners actually like",
    description:
      "Uncertainty, significant figures, and the conclusion paragraph most students skip.",
    claps: 45,
    comments: 6,
  },
  {
    id: "r5",
    author: "Priya N",
    dateLabel: "2w ago",
    title: "Economics essays: structure beats vocabulary every time",
    description:
      "Define, diagram, apply, evaluate — a repeatable template for 20-mark questions.",
    claps: 121,
    comments: 19,
  },
  {
    id: "r6",
    author: "Chris W",
    dateLabel: "Jun 10",
    title: "What r/alevel taught me about studying smarter",
    description:
      "Community tips on spaced repetition, burnout, and choosing the right resources.",
    claps: 203,
    comments: 27,
  },
];
