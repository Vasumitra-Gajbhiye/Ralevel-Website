import FlashcardSetCard from "@/components/flashcards/FlashcardSetCard";
import type { TopicFlashcardSetSummary } from "@/types/topic-flashcards";

type FlashcardSetsListProps = {
  sets: TopicFlashcardSetSummary[];
};

export default function FlashcardSetsList({ sets }: FlashcardSetsListProps) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {sets.map((set) => (
        <FlashcardSetCard
          key={set.id}
          set={set}
          practiceHref={`./${set.id}`}
        />
      ))}
    </div>
  );
}
