import { getBoardBySlug, levelToSlug } from "@/lib/boards";
import { boardPath, levelPath } from "@/lib/curriculum-routes";
import Link from "next/link";

type Props = {
  params: Promise<{ board: string }>;
};

const LEVEL_COLORS = [
  "bg-sky-100 hover:bg-sky-200/80",
  "bg-emerald-100 hover:bg-emerald-200/80",
  "bg-violet-100 hover:bg-violet-200/80",
];

export default async function BoardPage({ params }: Props) {
  const { board: boardSlug } = await params;
  const board = getBoardBySlug(boardSlug)!;

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <Link
        href="/learn"
        className="text-sm text-slate-500 hover:text-cyan-600 transition"
      >
        ← All boards
      </Link>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
        {board.name}
      </h1>
      <p className="mt-3 text-slate-600">Choose your level to get started.</p>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {board.levels.map((level, index) => (
          <Link
            key={level}
            href={levelPath(board.slug, levelToSlug(level))}
            className={`group flex items-center justify-center rounded-2xl px-6 py-10 text-center shadow-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-md ${
              LEVEL_COLORS[index] ?? "bg-slate-100 hover:bg-slate-200/80"
            }`}
          >
            <span className="text-xl font-semibold text-ink group-hover:text-slate-900 transition-colors">
              {level}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
