import Link from "next/link";
import Back from "../../components/back";
const theorySets = [
  {
    id: "set-1",
    title: "Core Definitions",
    description: "Practice writing precise definitions and key concepts.",
    questions: 12,
    type: "Short Answers",
  },
  {
    id: "set-2",
    title: "Conceptual Questions",
    description: "Explain ideas clearly in your own words.",
    questions: 15,
    type: "Explanation",
  },
  {
    id: "set-3",
    title: "Exam Style Questions",
    description: "Structured answers based on past paper patterns.",
    questions: 10,
    type: "Long Answer",
  },
];

function getTypeStyle(type: string) {
  if (type === "Short Answers") return "bg-green-100 text-green-700";
  if (type === "Explanation") return "bg-yellow-100 text-yellow-700";
  return "bg-purple-100 text-purple-700";
}

export default function TheoryHomePage() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-3">
        <Back />
      </div>
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-semibold tracking-tight text-ink">
          Theory Practice
        </h1>

        <p className="mt-3 text-slate-600 max-w-2xl">
          Practice writing structured answers for theory-based questions.
          Improve clarity, accuracy, and exam technique.
        </p>
      </div>

      {/* Sets */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {theorySets.map((set) => (
          <Link
            key={set.id}
            href={`./theory-topic-questions/${set.id}`}
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-cyan-400 transition"
          >
            {/* Title */}
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-ink group-hover:text-cyan-600 transition">
                {set.title}
              </h2>

              <span
                className={`text-xs px-2 py-1 rounded-md font-medium ${getTypeStyle(
                  set.type
                )}`}
              >
                {set.type}
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

      {/* Writing Tip Section */}
      <div className="mt-16 rounded-xl border border-cyan-100 bg-cyan-50 p-6">
        <h3 className="text-lg font-semibold text-cyan-900">
          How to approach theory questions
        </h3>

        <ul className="mt-3 text-sm text-cyan-800 space-y-2">
          <li>• Use precise definitions — avoid vague wording</li>
          <li>• Include key terms and units where relevant</li>
          <li>• Structure longer answers logically</li>
          <li>• Think like an examiner — clarity matters</li>
        </ul>
      </div>
    </section>
  );
}
