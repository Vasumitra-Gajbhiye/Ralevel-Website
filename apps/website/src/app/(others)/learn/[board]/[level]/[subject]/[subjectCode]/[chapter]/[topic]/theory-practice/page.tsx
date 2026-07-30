import TopicNotFound from "@/components/curriculum/TopicNotFound";
import TopicSubPageShell from "@/components/curriculum/TopicSubPageShell";
import { loadTopicSubPage } from "@/lib/topic-sub-page";

const theorySets = [
  {
    id: "set-1",
    title: "Short Answer",
    description: "Practice concise written responses on core concepts.",
    questions: 5,
    difficulty: "Easy",
  },
  {
    id: "set-2",
    title: "Extended Response",
    description: "Exam-style questions requiring detailed explanations.",
    questions: 3,
    difficulty: "Hard",
  },
];

function getDifficultyStyle(level: string) {
  if (level === "Easy") return "bg-green-100 text-green-700";
  if (level === "Medium") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

export default async function TopicTheoryPracticePage({
  params,
}: {
  params: Promise<{
    board: string;
    level: string;
    subject: string;
    subjectCode: string;
    chapter: string;
    topic: string;
  }>;
}) {
  const { topicDoc, chapterTitle, ...route } = await loadTopicSubPage(params);

  if (!topicDoc) {
    return <TopicNotFound />;
  }

  return (
    <TopicSubPageShell
      {...route}
      topicTitle={topicDoc.title}
      chapterTitle={chapterTitle}
      pageTitle="Practice Theory"
      activeSlug="theory-practice"
    >
      <p className="text-slate-600 mb-8">
        Test your understanding with written-answer questions for this topic.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {theorySets.map((set) => (
          <div
            key={set.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-semibold text-ink">{set.title}</h2>
              <span
                className={`text-xs px-2 py-1 rounded-md font-medium shrink-0 ${getDifficultyStyle(
                  set.difficulty,
                )}`}
              >
                {set.difficulty}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{set.description}</p>
            <p className="mt-4 text-sm text-slate-500">
              {set.questions} questions
            </p>
            <p className="mt-4 text-sm text-cyan-600 font-medium">
              Coming soon — placeholder set
            </p>
          </div>
        ))}
      </div>
    </TopicSubPageShell>
  );
}
