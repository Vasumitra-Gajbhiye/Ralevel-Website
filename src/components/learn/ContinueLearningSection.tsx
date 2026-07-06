import type { ContinueLearningItem } from "@/lib/learn-hub-data";
import { CONTINUE_LEARNING_ITEMS } from "@/lib/learn-hub-data";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import LearnSectionHeading from "./LearnSectionHeading";

type ContinueLearningSectionProps = {
  title?: string;
  description?: string;
  items?: ContinueLearningItem[];
};

export default function ContinueLearningSection({
  title = "Continue Learning",
  description = "Pick up where you left off.",
  items = CONTINUE_LEARNING_ITEMS,
}: ContinueLearningSectionProps) {
  return (
    <section>
      <div className="space-y-6">
        <LearnSectionHeading title={title} description={description} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-cyan-400 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900 group-hover:text-cyan-600 transition-colors">
                    {item.label}
                  </p>
                  <p className="text-sm text-slate-500">{item.status}</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition-colors group-hover:text-cyan-500" />
              </div>

              {typeof item.progress === "number" && (
                <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-cyan-600 transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
