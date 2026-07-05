import { BOARDS } from "@/lib/boards";
import Link from "next/link";

export const metadata = {
  title: "Choose Your Board | r/alevel",
  description:
    "Access structured notes, questions, and resources by exam board.",
};

export default function BoardsPage() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-semibold tracking-tight text-ink">
        Choose Your Board
      </h1>
      <p className="mt-3 text-slate-600">
        Access structured notes, questions, and resources by exam board.
      </p>

      <div className="mt-12 space-y-10">
        {BOARDS.map((board) => (
          <div key={board.slug}>
            <Link
              href={`/${board.slug}`}
              className="text-2xl font-semibold text-ink hover:text-cyan-600 transition"
            >
              {board.name}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
