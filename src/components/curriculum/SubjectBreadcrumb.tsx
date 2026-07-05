import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  formatBoardLabel,
  formatChapterLabel,
  formatLevelLabel,
  formatSubjectLabel,
} from "@/lib/curriculum-labels";
import Link from "next/link";
import { Fragment } from "react";

type BreadcrumbSegment = {
  label: string;
  href?: string;
};

type SubjectBreadcrumbProps = {
  board: string;
  level: string;
  subject: string;
  subjectCode: string;
  chapter?: { slug: string; title?: string };
  currentPage: string;
  className?: string;
};

export function getSubjectBreadcrumbSegments({
  board,
  level,
  subject,
  subjectCode,
  chapter,
  currentPage,
}: Omit<SubjectBreadcrumbProps, "className">): BreadcrumbSegment[] {
  const subjectHref = `/${board}/${level}/${subject}/${subjectCode}`;
  const subjectLabel = `${formatSubjectLabel(subject)} ${subjectCode}`;

  const segments: BreadcrumbSegment[] = [
    { label: formatBoardLabel(board), href: `/${board}` },
    { label: formatLevelLabel(level), href: `/${board}/${level}` },
  ];

  if (chapter) {
    segments.push({ label: subjectLabel, href: subjectHref });
    segments.push({
      label: chapter.title ?? formatChapterLabel(chapter.slug),
      href: `${subjectHref}/${chapter.slug}`,
    });
  } else if (currentPage !== subjectLabel) {
    segments.push({ label: subjectLabel, href: subjectHref });
  }

  segments.push({ label: currentPage });

  return segments;
}

export default function SubjectBreadcrumb(props: SubjectBreadcrumbProps) {
  const segments = getSubjectBreadcrumbSegments(props);

  return (
    <Breadcrumb className={props.className}>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;

          return (
            <Fragment key={`${segment.label}-${index}`}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem>
                {isLast || !segment.href ? (
                  <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={segment.href}>{segment.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
