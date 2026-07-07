"use client";

import FlashcardPracticeModal from "@/components/flashcards/FlashcardPracticeModal";
import FlashcardSetCard from "@/components/flashcards/FlashcardSetCard";
import type { TopicFlashcardSetSummary } from "@/types/topic-flashcards";
import { useState } from "react";

type FlashcardSetsListProps = {
  sets: TopicFlashcardSetSummary[];
};

export default function FlashcardSetsList({ sets }: FlashcardSetsListProps) {
  const [activeSet, setActiveSet] = useState<TopicFlashcardSetSummary | null>(
    null,
  );

  return (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        {sets.map((set) => (
          <FlashcardSetCard
            key={set.id}
            set={set}
            onPractice={() => setActiveSet(set)}
          />
        ))}
      </div>

      {activeSet && (
        <FlashcardPracticeModal
          set={activeSet}
          open={!!activeSet}
          onOpenChange={(open) => {
            if (!open) setActiveSet(null);
          }}
        />
      )}
    </>
  );
}
