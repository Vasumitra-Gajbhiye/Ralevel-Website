import MarkdownRenderer from "@/components/MarkdownRenderer";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Topic from "@/models/Topic";
import mongoose from "mongoose";
import Link from "next/link";

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
}

type Params = {
  board: string;
  level: string;
  subject: string;
  subjectCode: string;
  chapter: string;
  topic: string;
};

type TopicDoc = {
  title: string;
  detailedNotesMarkdown: string;
  topicId: string;
  slug: string;
};

export default async function TopicPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { board, level, subject, subjectCode, chapter, topic } = await params;

  await connectDB();

  const topicDoc = (await Topic.findOne({
    board,
    level,
    subject,
    chapterSlug: chapter,
    code: subjectCode,
    slug: topic,
    published: true,
  }).lean()) as TopicDoc | null;

  if (!topicDoc) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold mb-4">Topic not found</h1>
        <p className="text-neutral-600">
          The requested topic could not be found.
        </p>
      </div>
    );
  }

  const chapterTopics = await Topic.find({
    board,
    level,
    subject,
    chapterSlug: chapter,
    code: subjectCode,
    published: true,
  })
    .sort({ topicId: 1 })
    .lean();

  const index = chapterTopics.findIndex((t: any) => t.slug === topic);

  const prevTopic = index > 0 ? chapterTopics[index - 1] : null;
  const nextTopic =
    index < chapterTopics.length - 1 ? chapterTopics[index + 1] : null;

  return (
    <div className="max-w-3xl mx-auto px-6 pb-16 mt-12">
      <Breadcrumb className="my-4">
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
            <BreadcrumbLink asChild>
              <Link
                href={`/${board}/${level}/${subject}/${subjectCode}/${chapter}`}
              >
                {chapter.replace(/-/g, " ")}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>{topicDoc.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <MarkdownRenderer content={topicDoc.detailedNotesMarkdown} />

      <div className="flex justify-between items-center mt-16 pt-8 border-t">
        {prevTopic ? (
          <a
            href={`/${board}/${level}/${subject}/${subjectCode}/${chapter}/${prevTopic.slug}`}
            className="text-cyan-600 font-medium hover:underline"
          >
            ← {prevTopic.title}
          </a>
        ) : (
          <div />
        )}

        {nextTopic && (
          <a
            href={`/${board}/${level}/${subject}/${subjectCode}/${chapter}/${nextTopic.slug}`}
            className="text-cyan-600 font-medium hover:underline"
          >
            {nextTopic.title} →
          </a>
        )}
      </div>
    </div>
  );
}
