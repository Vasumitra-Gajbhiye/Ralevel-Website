import { POPULAR_SUBJECTS } from "@/lib/learn-hub-data";
import Link from "next/link";
import LearnSectionHeading from "./LearnSectionHeading";

export default function PopularSubjectsSection() {
  return (
    <section>
      <div className="space-y-6">
        <LearnSectionHeading
          title="Popular Subjects"
          description="Jump straight into the most studied subjects."
        />

        <div className="flex flex-wrap gap-3">
          {POPULAR_SUBJECTS.map((subject) => (
            <Link
              key={subject.name}
              href={subject.href}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700"
            >
              {subject.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
