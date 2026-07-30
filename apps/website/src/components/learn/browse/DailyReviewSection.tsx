import type { DailyReviewStat } from "@/lib/resource-browse-data";
import LearnSectionHeading from "../LearnSectionHeading";

type DailyReviewSectionProps = {
  title: string;
  description?: string;
  stats: DailyReviewStat[];
};

export default function DailyReviewSection({
  title,
  description,
  stats,
}: DailyReviewSectionProps) {
  return (
    <section>
      <div className="space-y-6">
        <LearnSectionHeading title={title} description={description} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-3xl font-semibold text-slate-900">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
