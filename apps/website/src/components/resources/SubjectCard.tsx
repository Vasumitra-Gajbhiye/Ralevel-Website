import type { ResourceSubjectSummary } from "@/types/resources2";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function SubjectCard({
  subject,
}: {
  subject: ResourceSubjectSummary;
}) {
  const primary = subject.primary ?? "#475569";

  return (
    <li className="w-44 shrink-0 snap-start sm:w-52">
      <Link
        href={`/resources/${subject.slug}`}
        className="group flex h-full flex-col justify-between gap-6 rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md"
        style={{
          backgroundColor: subject.primaryLight ?? "#f8fafc",
          borderColor: subject.borderLighter ?? "#e2e8f0",
        }}
      >
        <div className="flex items-start justify-between">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-white"
            style={{ backgroundColor: primary }}
            aria-hidden
          >
            {subject.subject.charAt(0)}
          </span>
          <ArrowUpRight
            className="h-4 w-4 opacity-0 transition group-hover:opacity-100"
            style={{ color: primary }}
          />
        </div>
        <span
          className="text-base font-semibold leading-snug"
          style={{ color: subject.primaryTextStrong ?? "#0f172a" }}
        >
          {subject.subject}
        </span>
      </Link>
    </li>
  );
}
