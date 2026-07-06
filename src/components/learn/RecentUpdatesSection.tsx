import type { RecentUpdate } from "@/lib/learn-hub-data";
import { RECENT_UPDATES } from "@/lib/learn-hub-data";
import { Check } from "lucide-react";
import LearnSectionHeading from "./LearnSectionHeading";

type RecentUpdatesSectionProps = {
  title?: string;
  description?: string;
  items?: RecentUpdate[];
};

export default function RecentUpdatesSection({
  title = "Recent Updates",
  description = "The latest content added to the platform.",
  items = RECENT_UPDATES,
}: RecentUpdatesSectionProps) {
  return (
    <section>
      <div className="space-y-6">
        <LearnSectionHeading title={title} description={description} />

        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 space-y-4">
          {items.map((update) => (
            <div
              key={update.id}
              className="flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                <p className="text-slate-700">{update.text}</p>
              </div>
              <span className="shrink-0 text-sm text-slate-400">
                {update.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
