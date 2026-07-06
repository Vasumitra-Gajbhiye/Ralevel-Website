import type { QuickPracticeItem } from "@/lib/resource-browse-data";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import LearnSectionHeading from "../LearnSectionHeading";

type QuickPracticeSectionProps = {
  title: string;
  description?: string;
  items: QuickPracticeItem[];
};

export default function QuickPracticeSection({
  title,
  description,
  items,
}: QuickPracticeSectionProps) {
  return (
    <section>
      <div className="space-y-6">
        <LearnSectionHeading title={title} description={description} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-cyan-400 hover:shadow-md"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 transition-colors group-hover:bg-cyan-100">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex flex-1 items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900 group-hover:text-cyan-600 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-sm text-slate-500">{item.description}</p>
                  </div>
                  <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-slate-300 transition-colors group-hover:text-cyan-500" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
