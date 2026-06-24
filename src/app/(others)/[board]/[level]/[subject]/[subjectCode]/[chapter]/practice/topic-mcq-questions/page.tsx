import Link from "next/link";
import Back from "../../components/back";
const mcqSets = [
  {
    id: "set-1",
    title: "Topic Practice",
    description: "Mixed questions covering all key concepts in this chapter.",
    questions: 20,
    difficulty: "Easy",
  },
  {
    id: "set-2",
    title: "Concept Check",
    description: "Test your understanding of core ideas and definitions.",
    questions: 15,
    difficulty: "Medium",
  },
  {
    id: "set-3",
    title: "Exam Challenge",
    description: "Higher difficulty questions based on past paper trends.",
    questions: 25,
    difficulty: "Hard",
  },
];

function getDifficultyStyle(level: string) {
  if (level === "Easy") return "bg-green-100 text-green-700";
  if (level === "Medium") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

export default function MCQHomePage() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-3">
        <Back />
      </div>
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-semibold tracking-tight text-ink">
          MCQ Practice
        </h1>

        <p className="mt-3 text-slate-600 max-w-2xl">
          Test your understanding with multiple choice questions. Track your
          accuracy, improve speed, and identify weak areas.
        </p>
      </div>

      {/* Sets */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mcqSets.map((set) => (
          <Link
            key={set.id}
            href={`./topic-mcq-questions/${set.id}`}
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-cyan-400 transition"
          >
            {/* Title */}
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-ink group-hover:text-cyan-600 transition">
                {set.title}
              </h2>

              <span
                className={`text-xs px-2 py-1 rounded-md font-medium ${getDifficultyStyle(
                  set.difficulty
                )}`}
              >
                {set.difficulty}
              </span>
            </div>

            {/* Description */}
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              {set.description}
            </p>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
              <span>{set.questions} questions</span>
              <span className="group-hover:text-cyan-600 transition">
                Start →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Modes Section */}
      <div className="mt-16 grid md:grid-cols-2 gap-6">
        {/* Learning Mode */}
        <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-6">
          <h3 className="text-lg font-semibold text-cyan-900">Learning Mode</h3>
          <ul className="mt-3 text-sm text-cyan-800 space-y-2">
            <li>• Instant feedback after each question</li>
            <li>• Explanations to build understanding</li>
            <li>• Best for first-time learning</li>
          </ul>
        </div>

        {/* Exam Mode */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-ink">Exam Mode</h3>
          <ul className="mt-3 text-sm text-slate-600 space-y-2">
            <li>• No immediate feedback</li>
            <li>• Attempt all questions freely</li>
            <li>• Review results at the end</li>
          </ul>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 rounded-xl border border-cyan-100 bg-cyan-50 p-6 text-center">
        <h3 className="text-lg font-semibold text-cyan-900">Tip</h3>
        <p className="text-sm text-cyan-700 mt-2">
          Don’t just guess — review explanations carefully to improve long-term
          retention.
        </p>
      </div>
    </section>
  );
}
