import { Button } from "@/components/ui/button";
import { BOARDS, levelToSlug } from "@/lib/boards";
import { getBoardColor } from "@/lib/board-colors";
import { levelPath } from "@/lib/curriculum-routes";
import Link from "next/link";
import LearnSectionHeading from "./LearnSectionHeading";

type BrowseBoardsSectionProps = {
  title?: string;
  description?: string;
  id?: string;
};

export default function BrowseBoardsSection({
  title = "Browse by Board",
  description = "Pick your board and level to browse subjects.",
  id = "browse-boards",
}: BrowseBoardsSectionProps) {
  return (
    <section id={id}>
      <div className="space-y-8">
        <LearnSectionHeading title={title} description={description} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BOARDS.map((board) => (
            <div
              key={board.slug}
              className={`flex flex-col rounded-2xl px-6 py-8 shadow-sm transition-shadow duration-200 hover:shadow-md ${getBoardColor(board.slug)}`}
            >
              <h3 className="text-xl font-semibold text-slate-900">
                {board.name}
              </h3>

              <div className="mt-4 flex flex-wrap gap-2">
                {board.levels.map((level) => (
                  <Button
                    key={level}
                    variant="outline"
                    size="sm"
                    asChild
                    className={`border-slate-200/80 bg-white/80 text-slate-900 shadow-sm hover:bg-white hover:text-slate-950 ${
                      board.levels.length === 1
                        ? "w-full"
                        : "min-w-[calc(50%-0.25rem)] flex-1"
                    }`}
                  >
                    <Link href={levelPath(board.slug, levelToSlug(level))}>
                      {level}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
