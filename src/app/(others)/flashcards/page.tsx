import ResourceBrowsePage from "@/components/learn/browse/ResourceBrowsePage";
import { FLASHCARDS_BROWSE_CONFIG } from "@/lib/resource-browse-data";

export const metadata = {
  title: "Flashcards | r/alevel",
  description:
    "Master every topic using spaced repetition and active recall.",
};

export default function FlashcardsPage() {
  return <ResourceBrowsePage config={FLASHCARDS_BROWSE_CONFIG} />;
}
