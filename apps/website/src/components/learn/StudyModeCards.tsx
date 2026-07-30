import { Button } from "@/components/ui/button";
import { STUDY_MODES } from "@/lib/learn-hub-data";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import LearnSectionHeading from "./LearnSectionHeading";

export default function StudyModeCards() {
  return (
    <section aria-labelledby="study-modes-heading">
      <div className="space-y-8">
        <LearnSectionHeading
          id="study-modes-heading"
          title="Study Modes"
          description="Choose how you want to learn. Pick a mode and dive in."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {STUDY_MODES.map((mode) => {
            const Icon = mode.icon;

            return (
              <Link
                key={mode.slug}
                href={mode.href}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 transition-colors group-hover:bg-cyan-100">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-5 text-xl font-semibold text-slate-900">
                  {mode.title}
                </h3>

                <p className="mt-2 flex-1 text-slate-600 leading-relaxed">
                  {mode.description}
                </p>

                <Button className="mt-6 w-fit pointer-events-none" tabIndex={-1}>
                  {mode.cta}
                  <ArrowRight />
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
