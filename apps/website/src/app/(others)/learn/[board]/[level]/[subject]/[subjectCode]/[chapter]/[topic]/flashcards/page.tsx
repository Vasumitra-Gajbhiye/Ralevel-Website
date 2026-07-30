import FlashcardSetsList from "@/components/flashcards/FlashcardSetsList";
import TopicNotFound from "@/components/curriculum/TopicNotFound";
import TopicSubPageShell from "@/components/curriculum/TopicSubPageShell";
import { dummyFlashcardSets } from "@/lib/data/topic-flashcards-dummy";
import { loadTopicSubPage } from "@/lib/topic-sub-page";

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

      <FlashcardSetsList sets={dummyFlashcardSets} />
    </TopicSubPageShell>
  );
}
