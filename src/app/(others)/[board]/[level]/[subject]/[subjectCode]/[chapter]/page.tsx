import connectDB from "@/lib/mongodb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SubjectBreadcrumb from "@/components/curriculum/SubjectBreadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import subjectGuide from "@/models/subjectGuide";
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import ExpandableMistakes from "./components/ExpandableMistakes";
import { Fragment } from "react";

function hasItems<T>(value: T[] | undefined | null): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

function hasText(value: string | undefined | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{
    board: string;
    level: string;
    subject: string;
    subjectCode: string;
    chapter: string;
  }>;
}) {
  const { board, level, subject, subjectCode, chapter } = await params;
  await connectDB();
  const chapterData = (await subjectGuide
    .findOne(
      { examCode: subjectCode, "chapters.slug": chapter },
      { "chapters.$": 1 },
    )
    .lean()) as any;

  const foundChapter = chapterData?.chapters?.[0];

  const baseUrl = `/${board}/${level}/${subject}/${subjectCode}/${chapter}`;
  const chapterTitle =
    foundChapter?.title ?? chapter.replace(/-/g, " ");

  const hasKeyConcepts = hasItems(foundChapter?.keyConcepts);
  const hasTopics = hasItems(foundChapter?.topics);
  const hasCommonMistakes = hasItems(foundChapter?.commonMistakes);
  const hasExamTips = hasItems(foundChapter?.examinerTips);
  const hasChapterSummary = hasText(foundChapter?.chapterSummary);
  const hasIntroduction = hasText(foundChapter?.introduction);

  const hasAnyContent =
    hasKeyConcepts ||
    hasTopics ||
    hasCommonMistakes ||
    hasExamTips ||
    hasChapterSummary;

  const contentSections = [
    hasKeyConcepts ? (
      <section key="key-concepts" className="space-y-6">
        <h2 className="text-2xl font-semibold">Key Concepts</h2>

        <ExpandableMistakes size={410}>
          <div className="grid gap-4 md:grid-cols-2">
            {foundChapter.keyConcepts.map((concept: any, i: number) => {
              return (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle>{concept.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-neutral-600">
                    {concept.description}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ExpandableMistakes>
      </section>
    ) : null,
    hasTopics ? (
      <section key="topics" className="space-y-6">
        <h2 className="text-2xl font-semibold">Topics in this Chapter</h2>

        <div className="grid gap-3">
          {foundChapter.topics.map((topic: any, i: number) => {
            return (
              <Link href={`${baseUrl}/${topic.slug}`} key={i}>
                <Button
                  variant="outline"
                  className="w-full flex justify-between"
                >
                  {topic.title} <SquareArrowOutUpRight className="ml-2" />
                </Button>
              </Link>
            );
          })}
        </div>
      </section>
    ) : null,
    hasCommonMistakes ? (
      <section key="common-mistakes" className="space-y-6">
        <h2 className="text-2xl font-semibold">Common Mistakes</h2>

        <ExpandableMistakes size={250}>
          <Accordion type="single" collapsible>
            {foundChapter.commonMistakes.map((mistake: any, i: number) => (
              <AccordionItem value={`item-${i + 1}`} key={i}>
                <AccordionTrigger>{mistake.mistakeTitle}</AccordionTrigger>
                <AccordionContent>{mistake.explanation}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ExpandableMistakes>
      </section>
    ) : null,
    hasExamTips ? (
      <section key="exam-tips" className="space-y-6">
        <h2 className="text-2xl font-semibold">Exam Tips</h2>

        {foundChapter.examinerTips.map((tip: any, i: number) => {
          return (
            <Card key={i}>
              <CardContent className="pt-6 text-neutral-600 leading-relaxed">
                {tip}
              </CardContent>
            </Card>
          );
        })}
      </section>
    ) : null,
    hasAnyContent ? (
      <section key="practice" className="space-y-6">
        <h2 className="text-2xl font-semibold">Practice</h2>

        <div className="flex flex-wrap gap-3">
          <Link href={`${baseUrl}/practice/topic-mcq-questions`}>
            <Button>
              Practice Topic MCQs <SquareArrowOutUpRight />{" "}
            </Button>
          </Link>

          <Link href={`${baseUrl}/flashcards`}>
            <Button variant="outline">
              Flashcards <SquareArrowOutUpRight />
            </Button>
          </Link>
          <Link href={`${baseUrl}/solved-questions`}>
            <Button variant="outline">
              Solved Questions <SquareArrowOutUpRight />
            </Button>
          </Link>
          <Link href={`${baseUrl}/practice/theory-topic-questions`}>
            <Button variant="outline">
              Theory Topic Questions <SquareArrowOutUpRight />
            </Button>
          </Link>
          <Link href={`${baseUrl}/diagrams-explained`}>
            <Button variant="outline">
              Diagrams Explained <SquareArrowOutUpRight />
            </Button>
          </Link>
        </div>
      </section>
    ) : null,
    hasChapterSummary ? (
      <section key="chapter-summary" className="space-y-4">
        <h2 className="text-2xl font-semibold">Chapter Summary</h2>
        <p className="text-neutral-600 leading-relaxed">
          {foundChapter.chapterSummary}
        </p>
      </section>
    ) : null,
  ].filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto px-6 pt-12 pb-16 space-y-12">
      <SubjectBreadcrumb
        className="mb-2"
        board={board}
        level={level}
        subject={subject}
        subjectCode={subjectCode}
        currentPage={chapterTitle}
      />

      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">{chapterTitle}</h1>
        {hasIntroduction && (
          <p className="text-neutral-600 text-lg leading-relaxed">
            {foundChapter.introduction}
          </p>
        )}
      </div>

      {hasAnyContent ? (
        contentSections.map((section, index) => (
          <Fragment key={index}>
            {index > 0 && <Separator className="my-12" />}
            {section}
          </Fragment>
        ))
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 sm:p-10">
          <h2 className="text-2xl font-semibold text-ink">
            No resources available yet
          </h2>

          <p className="mt-4 text-slate-600 leading-relaxed">
            We don&apos;t have notes, practice questions, or study materials for{" "}
            <span className="font-medium text-ink">{chapterTitle}</span> right
            now.
          </p>

          <p className="mt-4 text-slate-600 leading-relaxed">
            You can still find helpful materials in our{" "}
            <Link
              href="/resources"
              className="font-medium text-cyan-600 hover:text-cyan-700 hover:underline"
            >
              resource repository
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
