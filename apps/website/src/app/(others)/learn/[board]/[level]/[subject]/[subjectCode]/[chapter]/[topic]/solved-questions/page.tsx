import MarkdownRenderer from "@/components/MarkdownRenderer";
import TopicNotFound from "@/components/curriculum/TopicNotFound";
import TopicSubPageShell from "@/components/curriculum/TopicSubPageShell";
import { loadTopicSubPage } from "@/lib/topic-sub-page";

const markdown = `
> [!solved-example]
> Q:
> Define a physical quantity.
>
> A:
> A physical quantity is a property that can be measured and expressed with a numerical value and a unit.

---

> [!solved-example]
> Q:
> A car accelerates from rest at 2 m/s² for 5 seconds. Find its final velocity.
>
> A:
> Using:
>
> $$
> v = u + at
> $$
>
> $$
> v = 0 + (2)(5) = 10 \\, m/s
> $$

---

> [!solved-example]
> Q:
> State the SI base units for length, mass, and time.
>
> A:
> Length: metre (m), Mass: kilogram (kg), Time: second (s).
`;

export default async function TopicSolvedQuestionsPage({
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
      pageTitle="Solved Questions"
      activeSlug="solved-questions"
    >
      <p className="text-slate-600 mb-8">
        Practice exam-style questions with detailed step-by-step solutions.
      </p>

      <MarkdownRenderer content={markdown} />
    </TopicSubPageShell>
  );
}
