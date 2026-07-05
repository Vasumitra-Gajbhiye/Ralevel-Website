import { BOARDS } from "@/lib/boards";
import Link from "next/link";

export const metadata = {
  title: "Home | r/alevel",
  description:
    "Access structured notes, questions, and resources by exam board.",
};

const BOARD_COLORS: Record<string, string> = {
  cambridge: "bg-sky-100 hover:bg-sky-200/80",
  "edexcel-ial": "bg-emerald-100 hover:bg-emerald-200/80",
  "edexcel-uk": "bg-violet-100 hover:bg-violet-200/80",
  aqa: "bg-rose-100 hover:bg-rose-200/80",
  ocr: "bg-amber-100 hover:bg-amber-200/80",
  wjec: "bg-teal-100 hover:bg-teal-200/80",
};

export default function HomePage() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-semibold tracking-tight text-ink">
        Choose Your Board
      </h1>
      <p className="mt-3 text-slate-600">
        Access structured notes, questions, and resources by exam board.
      </p>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {BOARDS.map((board) => (
          <Link
            key={board.slug}
            href={`/${board.slug}`}
            className={`group flex items-center justify-center rounded-2xl px-6 py-10 text-center shadow-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-md ${
              BOARD_COLORS[board.slug] ?? "bg-slate-100 hover:bg-slate-200/80"
            }`}
          >
            <span className="text-xl font-semibold text-ink group-hover:text-slate-900 transition-colors">
              {board.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
