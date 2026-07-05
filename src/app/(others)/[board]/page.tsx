import { getBoardBySlug, levelToSlug } from "@/lib/boards";
import Link from "next/link";

type Props = {
  params: Promise<{ board: string }>;
};

export default async function BoardPage({ params }: Props) {
  const { board: boardSlug } = await params;
  const board = getBoardBySlug(boardSlug)!;

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <Link
        href="/boards"
        className="text-sm text-slate-500 hover:text-cyan-600 transition"
      >
        ← All boards
      </Link>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
        {board.name}
      </h1>
      <p className="mt-3 text-slate-600">Choose your level to get started.</p>

      <div className="mt-12 space-y-2">
        {board.levels.map((level) => (
          <Link
            key={level}
            href={`/${board.slug}/${levelToSlug(level)}`}
            className="block text-cyan-600 text-lg hover:text-cyan-800 transition"
          >
            {level}
          </Link>
        ))}
      </div>
    </section>
  );
}
