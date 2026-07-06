import SubjectBreadcrumb from "@/components/curriculum/SubjectBreadcrumb";
import TopicStudyModeButtons from "@/components/curriculum/TopicStudyModeButtons";
import { topicPath } from "@/lib/curriculum-routes";
import type { TopicStudyModeSlug } from "@/lib/topic-study-modes";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type TopicRouteParams = {
  board: string;
  level: string;
  subject: string;
  subjectCode: string;
  chapter: string;
  topic: string;
};

type TopicSubPageShellProps = TopicRouteParams & {
  topicTitle: string;
  chapterTitle?: string;
  pageTitle: string;
  activeSlug: TopicStudyModeSlug;
  children: React.ReactNode;
};

export default function TopicSubPageShell({
  board,
  level,
  subject,
  subjectCode,
  chapter,
  topic,
  topicTitle,
  chapterTitle,
  pageTitle,
  activeSlug,
  children,
}: TopicSubPageShellProps) {
  const topicHubHref = topicPath(
    board,
    level,
    subject,
    subjectCode,
    chapter,
    topic,
  );

  return (
    <div className="max-w-3xl mx-auto px-6 pb-16 mt-12">
      <SubjectBreadcrumb
        className="my-4"
        board={board}
        level={level}
        subject={subject}
        subjectCode={subjectCode}
        chapter={{
          slug: chapter,
          title: chapterTitle,
        }}
        currentPage={pageTitle}
      />

      <Link
        href={topicHubHref}
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-cyan-600 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {topicTitle}
      </Link>

      <h1 className="text-3xl font-semibold tracking-tight text-ink mb-4">
        {pageTitle}
      </h1>

      <div className="mb-8">
        <TopicStudyModeButtons
          board={board}
          level={level}
          subject={subject}
          subjectCode={subjectCode}
          chapter={chapter}
          topic={topic}
          activeSlug={activeSlug}
        />
      </div>

      {children}
    </div>
  );
}
