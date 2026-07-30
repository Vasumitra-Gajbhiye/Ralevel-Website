import { getBoardBySlug } from "@/lib/boards";
import { getSubjectsForLevel } from "@/lib/data/curriculum";
import { boardPath, subjectPath } from "@/lib/curriculum-routes";
import Link from "next/link";

export const revalidate = 86400;

type Props = {
  params: Promise<{
    board: string;
    level: string;
  }>;
};

function formatLevelName(level: string) {
  return level.replace(/-/g, " ");
}

export default async function LevelPage({ params }: Props) {
  const { board, level } = await params;
  const subjects = await getSubjectsForLevel(board, level);
  const boardInfo = getBoardBySlug(board);
  const boardName = boardInfo?.name ?? board.replace(/-/g, " ");
  const levelName = formatLevelName(level);
  const hasSubjects = subjects.length > 0;

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <Link
        href={boardPath(board)}
        className="text-sm text-slate-500 hover:text-cyan-600 transition"
      >
        ← {boardName}
      </Link>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink capitalize">
        {boardName} · {levelName}
      </h1>

      {hasSubjects ? (
        <>
          <p className="mt-3 text-slate-600">
            Choose a subject to explore notes, practice questions, and
            resources.
          </p>

          <div className="mt-12 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Link
                key={subject.subjectName}
                href={subjectPath(
                  board,
                  level,
                  subject.subjectName.toLowerCase(),
                  subject.examCode,
                )}
                className="group rounded-xl border border-slate-200 p-5 hover:border-cyan-400 hover:shadow-sm transition"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-ink group-hover:text-cyan-600 transition">
                    {subject.subjectName}
                  </h2>

                  <span className="text-sm text-slate-400 group-hover:text-cyan-500 transition">
                    →
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  {subject.examCode}
                </p>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-12 rounded-xl border border-slate-200 bg-slate-50 p-8 sm:p-10">
          <h2 className="text-2xl font-semibold text-ink">
            No resources available yet
          </h2>

          <p className="mt-4 text-slate-600 leading-relaxed">
            We don&apos;t have notes, practice questions, or study materials for{" "}
            <span className="font-medium text-ink">
              {boardName} · {levelName}
            </span>{" "}
            right now.
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

          <p className="mt-6 text-sm text-slate-500">
            We will soon add resources to this page.
          </p>
        </div>
      )}
    </section>
  );
}
