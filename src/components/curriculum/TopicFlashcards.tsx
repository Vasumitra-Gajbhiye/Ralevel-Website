"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useState } from "react";

type Flashcard = {
  id: string;
  question: string;
  answer: string;
};

type TopicFlashcardsProps = {
  cards: Flashcard[];
};

export default function TopicFlashcards({ cards }: TopicFlashcardsProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = cards[index];
  const isFirst = index === 0;
  const isLast = index === cards.length - 1;

  function goTo(newIndex: number) {
    setIndex(newIndex);
    setFlipped(false);
  }

  if (!current) {
    return <p className="text-slate-600">No flashcards available.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Card {index + 1} of {cards.length}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            goTo(0);
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className={cn(
          "w-full min-h-[200px] rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-cyan-400",
          flipped && "bg-cyan-50/50",
        )}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-3">
          {flipped ? "Answer" : "Question"}
        </p>
        <p className="text-lg text-ink leading-relaxed">
          {flipped ? current.answer : current.question}
        </p>
        <p className="mt-6 text-sm text-slate-400">Click to flip</p>
      </button>

      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          disabled={isFirst}
          onClick={() => goTo(index - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isLast}
          onClick={() => goTo(index + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
