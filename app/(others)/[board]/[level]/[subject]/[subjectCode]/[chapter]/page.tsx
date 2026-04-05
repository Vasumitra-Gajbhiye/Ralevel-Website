import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import connectDB from "@/lib/mongodb";
import subjectGuide from "@/models/subjectGuide";
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import ExpandableMistakes from "./components/ExpandableMistakes";
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
      { "chapters.$": 1 }
    )
    .lean()) as any;

  const foundChapter = chapterData?.chapters?.[0];

  const baseUrl = `/${board}/${level}/${subject}/${subjectCode}/${chapter}`;

  // console.log(foundChapter);
  return (
    <div className="max-w-4xl mx-auto px-6 pt-12 pb-16 space-y-12">
      <Breadcrumb className="mb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${board}`}>{board}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${board}/${level}`}>{level}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${board}/${level}/${subject}/${subjectCode}`}>
                {subject} {subjectCode}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>{chapter.replace(/-/g, " ")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Chapter Title */}
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          {foundChapter.title}
        </h1>
        <p className="text-neutral-600 text-lg leading-relaxed">
          {foundChapter.introduction}
        </p>
      </div>

      {/* Key Concepts */}
      <section className="space-y-6">
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

      <Separator className="my-12" />

      {/* Topics */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Topics in this Chapter</h2>

        <div className="grid gap-3">
          {foundChapter.topics.map((topic: any, i: number) => {
            // console.log(topic.title);
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

      <Separator className="my-12" />

      {/* Common Mistakes */}
      <section className="space-y-6">
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

      <Separator className="my-12" />

      {/* Exam Tips */}
      <section className="space-y-6">
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

      <Separator className="my-12" />

      {/* Practice Section */}
      <section className="space-y-6">
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

      <Separator className="my-12" />

      {/* Chapter Summary */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Chapter Summary</h2>
        <p className="text-neutral-600 leading-relaxed">
          {foundChapter.chapterSummary}
        </p>
      </section>
    </div>
  );
}
