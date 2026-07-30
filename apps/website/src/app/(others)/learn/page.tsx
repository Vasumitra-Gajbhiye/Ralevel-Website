import BrowseBoardsSection from "@/components/learn/BrowseBoardsSection";
import ContinueLearningSection from "@/components/learn/ContinueLearningSection";
import LearnHero from "@/components/learn/LearnHero";
import PopularSubjectsSection from "@/components/learn/PopularSubjectsSection";
import RecentUpdatesSection from "@/components/learn/RecentUpdatesSection";
import StudyModeCards from "@/components/learn/StudyModeCards";

export const metadata = {
  title: "Learn | r/alevel",
  description:
    "Your central hub for A Level notes, flashcards, MCQ practice, theory quizzes, and more.",
};

export default function LearnPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-28 md:gap-36">
      <LearnHero />
      <StudyModeCards />
      <ContinueLearningSection />
      <BrowseBoardsSection />
      <PopularSubjectsSection />
      <RecentUpdatesSection />
    </div>
  );
}
