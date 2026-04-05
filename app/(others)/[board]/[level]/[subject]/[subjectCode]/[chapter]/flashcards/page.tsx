// const flashcardSets = [
//   {
//     id: "set-1",
//     title: "Core Concepts",
//     description: "Key definitions and fundamental ideas you must know.",
//     cards: 24,
//     difficulty: "Easy",
//   },
//   {
//     id: "set-2",
//     title: "Units & Measurements",
//     description: "Focus on SI units, conversions, and accuracy.",
//     cards: 18,
//     difficulty: "Medium",
//   },
//   {
//     id: "set-3",
//     title: "Exam Practice",
//     description: "High-yield flashcards based on past paper patterns.",
//     cards: 20,
//     difficulty: "Hard",
//   },
// ];

// function getDifficultyColor(level: string) {
//   if (level === "Easy") return "bg-green-100 text-green-700";
//   if (level === "Medium") return "bg-yellow-100 text-yellow-700";
//   return "bg-red-100 text-red-700";
// }

// export default function FlashcardsHome() {
//   return (
//     <section className="max-w-5xl mx-auto px-6 py-12">
//       {/* Header */}
//       <div className="mb-10">
//         <h1 className="text-4xl font-semibold tracking-tight text-ink">
//           Flashcards
//         </h1>
//         <p className="mt-3 text-slate-600 max-w-2xl">
//           Revise key concepts from this chapter using structured flashcard sets.
//           Start with fundamentals, then move to exam-level recall.
//         </p>
//       </div>

//       {/* Sets */}
//       <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {flashcardSets.map((set) => (
//           <a
//             key={set.id}
//             href={`flashcards/${set.id}`}
//             className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-cyan-400 transition"
//           >
//             {/* Title */}
//             <div className="flex items-start justify-between">
//               <h2 className="text-lg font-semibold text-ink group-hover:text-cyan-600 transition">
//                 {set.title}
//               </h2>

//               <span
//                 className={`text-xs px-2 py-1 rounded-md font-medium ${getDifficultyColor(
//                   set.difficulty
//                 )}`}
//               >
//                 {set.difficulty}
//               </span>
//             </div>

//             {/* Description */}
//             <p className="mt-3 text-sm text-slate-600 leading-relaxed">
//               {set.description}
//             </p>

//             {/* Footer */}
//             <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
//               <span>{set.cards} cards</span>
//               <span className="group-hover:text-cyan-600 transition">
//                 Start →
//               </span>
//             </div>
//           </a>
//         ))}
//       </div>

//       {/* Bottom CTA */}
//       <div className="mt-16 rounded-xl border border-cyan-100 bg-cyan-50 p-6 text-center">
//         <h3 className="text-lg font-semibold text-cyan-900">
//           Want to revise faster?
//         </h3>
//         <p className="text-sm text-cyan-700 mt-2">
//           Use flashcards daily to improve recall and exam performance.
//         </p>
//       </div>
//     </section>
//   );
// }
import Topic from "@/models/Topic";
import Back from "../components/back";
const flashcardSets = [
  {
    id: "set-1",
    title: "Core Concepts",
    description: "Key definitions and fundamental ideas you must know.",
    cards: 24,
    difficulty: "Easy",
  },
  {
    id: "set-2",
    title: "Units & Measurements",
    description: "Focus on SI units, conversions, and accuracy.",
    cards: 18,
    difficulty: "Medium",
  },
  {
    id: "set-3",
    title: "Exam Practice",
    description: "High-yield flashcards based on past paper patterns.",
    cards: 20,
    difficulty: "Hard",
  },
];

function getDifficultyColor(level: string) {
  if (level === "Easy") return "bg-green-100 text-green-700";
  if (level === "Medium") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

type Props = {
  params: Promise<{
    board: string;
    level: string;
    subject: string;
    subjectCode: string;
    chapter: string;
  }>;
};
export default async function FlashcardsHome({ params }: Props) {
  const { board, level, subject, subjectCode, chapter } = await params;
  const flashcards = await Topic.find({
    board,
    level,
    subject,
    chapterSlug: chapter,
    code: subjectCode,
  })
    .select("flashcards title slug")
    .lean();

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-3">
          <Back />
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-ink">
          Flashcards
        </h1>
        <p className="mt-3 text-slate-600 max-w-2xl">
          Revise key concepts from this chapter using structured flashcard sets.
          Start with fundamentals, then move to exam-level recall.
        </p>
      </div>

      {/* Sets */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {flashcards.map((set) => (
          <a
            key={set.slug}
            href={`flashcards/${set.slug}`}
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-cyan-400 transition"
          >
            {/* Title */}
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-ink group-hover:text-cyan-600 transition">
                {set.title}
              </h2>

              <span
                className={`text-xs px-2 py-1 rounded-md font-medium ${getDifficultyColor(
                  set.flashcards.difficulty
                )}`}
              >
                {set.flashcards.difficulty}
              </span>
            </div>

            {/* Description */}
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              {set.flashcards.description}
            </p>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
              <span>{set.cards} cards</span>
              <span className="group-hover:text-cyan-600 transition">
                Start →
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 rounded-xl border border-cyan-100 bg-cyan-50 p-6 text-center">
        <h3 className="text-lg font-semibold text-cyan-900">
          Want to revise faster?
        </h3>
        <p className="text-sm text-cyan-700 mt-2">
          Use flashcards daily to improve recall and exam performance.
        </p>
      </div>
    </section>
  );
}
