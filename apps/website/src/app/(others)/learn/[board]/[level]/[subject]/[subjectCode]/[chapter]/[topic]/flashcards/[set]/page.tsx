import FlashcardPracticeSession from "@/components/flashcards/FlashcardPracticeSession";
import { getTopicFlashcardSet } from "@/lib/data/topic-flashcards-dummy";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageParams = {
  board: string;
  level: string;
  subject: string;
  subjectCode: string;
  chapter: string;
  topic: string;
  set: string;
};

export default async function TopicFlashcardSetPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const resolved = await params;
  const flashcardSet = getTopicFlashcardSet(resolved.set);

  if (!flashcardSet) {
    notFound();
  }

  const backHref = `/learn/${resolved.board}/${resolved.level}/${resolved.subject}/${resolved.subjectCode}/${resolved.chapter}/${resolved.topic}/flashcards`;

  return (
    <FlashcardPracticeSession set={flashcardSet} backHref={backHref} />
  );
}
