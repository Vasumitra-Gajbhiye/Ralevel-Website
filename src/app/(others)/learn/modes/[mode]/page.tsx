import { Button } from "@/components/ui/button";
import { getStudyMode, isValidStudyModeSlug } from "@/lib/learn-hub-data";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ mode: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { mode } = await params;
  const studyMode = getStudyMode(mode);

  if (!studyMode) {
    return { title: "Not Found | r/alevel" };
  }

  return {
    title: `${studyMode.title} | Learn | r/alevel`,
    description: studyMode.description,
  };
}

export default async function StudyModePlaceholderPage({ params }: Props) {
  const { mode } = await params;

  if (!isValidStudyModeSlug(mode)) {
    notFound();
  }

  const studyMode = getStudyMode(mode)!;
  const Icon = studyMode.icon;

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <Link
        href="/learn"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-cyan-600 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Learn
      </Link>

      <div className="mt-8 space-y-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
          <Icon className="h-7 w-7" />
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            {studyMode.title}
          </h1>
          <p className="max-w-xl text-slate-600 leading-relaxed">
            {studyMode.description}
          </p>
        </div>

        <p className="max-w-xl text-slate-600 leading-relaxed">
          To get started, choose your exam board. We&apos;ll take you to
          resources tailored to your syllabus.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild>
            <Link href="/learn#browse-boards">
              Choose your board
              <ArrowRight />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/learn">Back to Learn hub</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
