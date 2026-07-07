import { Button } from "@/components/ui/button";
import type { TopicFlashcardSetSummary } from "@/types/topic-flashcards";
import { Play } from "lucide-react";

function getDifficultyStyle(level: string) {
  if (level === "Easy") return "bg-green-100 text-green-700";
  if (level === "Medium") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

type FlashcardSetCardProps = {
  set: TopicFlashcardSetSummary;
  onPractice: () => void;
};

export default function FlashcardSetCard({
  set,
  onPractice,
}: FlashcardSetCardProps) {
  const { stats } = set;

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-cyan-400 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink group-hover:text-cyan-600 transition">
          {set.title}
        </h2>
        <span
          className={`text-xs px-2 py-1 rounded-md font-medium shrink-0 ${getDifficultyStyle(set.difficulty)}`}
        >
          {set.difficulty}
        </span>
      </div>

      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
        {set.description}
      </p>

      <p className="mt-4 text-sm text-slate-500">
        {stats.totalCards} cards · {stats.masteredCards} mastered ·{" "}
        {stats.dueCards} due
      </p>

      {stats.lastPracticedAt && (
        <p className="mt-1 text-xs text-slate-400">
          Last practiced {stats.lastPracticedAt}
        </p>
      )}

      <Button
        onClick={onPractice}
        className="mt-5 w-full rounded-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold"
      >
        <Play className="h-4 w-4 mr-2" />
        Practice
      </Button>
    </div>
  );
}
