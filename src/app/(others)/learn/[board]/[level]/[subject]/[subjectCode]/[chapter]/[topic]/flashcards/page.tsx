import TopicFlashcards from "@/components/curriculum/TopicFlashcards";
import TopicNotFound from "@/components/curriculum/TopicNotFound";
import TopicSubPageShell from "@/components/curriculum/TopicSubPageShell";
import { loadTopicSubPage } from "@/lib/topic-sub-page";

const dummyFlashcards = [
  {
    id: "1",
    question: "What is a physical quantity?",
    answer:
      "A property that can be measured and expressed with a numerical value and a unit.",
  },
  {
    id: "2",
    question: "What are base quantities?",
    answer:
      "Fundamental physical quantities from which all other quantities are derived (e.g. length, mass, time).",
  },
  {
    id: "3",
    question: "What is the SI unit of length?",
    answer: "The metre (m).",
  },
  {
    id: "4",
    question: "Define a derived quantity.",
    answer:
      "A quantity defined in terms of base quantities, such as speed (m/s) or force (N).",
  },
  {
    id: "5",
    question: "What is the difference between accuracy and precision?",
    answer:
      "Accuracy is how close a measurement is to the true value; precision is how consistent repeated measurements are.",
  },
];

export default async function TopicFlashcardsPage({
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
      pageTitle="Flashcards"
      activeSlug="flashcards"
    >
      <p className="text-slate-600 mb-8">
        Revise key concepts from this topic using flashcards.
      </p>

      <TopicFlashcards cards={dummyFlashcards} />
    </TopicSubPageShell>
  );
}
