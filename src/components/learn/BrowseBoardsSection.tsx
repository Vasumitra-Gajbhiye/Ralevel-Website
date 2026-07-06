import { BOARDS } from "@/lib/boards";
import { getBoardColor } from "@/lib/board-colors";
import { boardPath } from "@/lib/curriculum-routes";
import Link from "next/link";
import LearnSectionHeading from "./LearnSectionHeading";

type BrowseBoardsSectionProps = {
  title?: string;
  description?: string;
  id?: string;
};

export default function BrowseBoardsSection({
  title = "Browse by Board",
  description = "Select your exam board to find resources tailored to your syllabus.",
  id = "browse-boards",
}: BrowseBoardsSectionProps) {
  return (
    <section id={id}>
      <div className="space-y-8">
        <LearnSectionHeading title={title} description={description} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BOARDS.map((board) => (
            <Link
              key={board.slug}
              href={boardPath(board.slug)}
              className={`group flex flex-col justify-center rounded-2xl px-6 py-10 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${getBoardColor(board.slug)}`}
            >
              <span className="text-xl font-semibold text-slate-900 transition-colors group-hover:text-slate-950">
                {board.name}
              </span>
              <span className="mt-1 text-sm text-slate-600">
                {board.levels.length}{" "}
                {board.levels.length === 1 ? "level" : "levels"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
