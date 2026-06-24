import {
  getSubjectPathsForStaticParams,
  getSubjectTopics,
} from "@/lib/data/curriculum";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const revalidate = 86400;

export async function generateStaticParams() {
  return getSubjectPathsForStaticParams();
}

type Params = {
  board: string;
  level: string;
  subject: string;
  subjectCode: string;
};

export default async function SubjectHome({
  params,
}: {
  params: Promise<Params>;
}) {
  const { board, level, subject, subjectCode } = await params;

  const topics = await getSubjectTopics(board, level, subject, subjectCode);

  const chapters: Record<string, any[]> = {};

  for (const topic of topics) {
    const key = topic.chapterSlug;

    if (!chapters[key]) chapters[key] = [];

    chapters[key].push(topic);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pb-16 mt-12">
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
              <Link href={`/${level}`}>{level}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>
              {subject} {subjectCode}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-4xl font-semibold tracking-tight mb-12">
        {subject.toUpperCase()} {subjectCode}
      </h1>

      <div className="space-y-12">
        {Object.values(chapters).map((chapterTopics: any[]) => {
          const chapterTitle = chapterTopics[0].chapterTitle;
          const chapterSlug = chapterTopics[0].chapterSlug;

          return (
            <div key={chapterSlug}>
              <Link
                href={`/${board}/${level}/${subject}/${subjectCode}/${chapterSlug}`}
                className="inline-block"
              >
                <h2 className="text-2xl font-semibold mb-4 hover:underline">
                  {chapterTitle}
                </h2>
              </Link>

              <ul className="space-y-2">
                {chapterTopics.map((t) => (
                  <li key={t.slug}>
                    <Link
                      href={`/${board}/${level}/${subject}/${subjectCode}/${chapterSlug}/${t.slug}`}
                      className="text-cyan-600 hover:underline"
                    >
                      {t.topicId} {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
