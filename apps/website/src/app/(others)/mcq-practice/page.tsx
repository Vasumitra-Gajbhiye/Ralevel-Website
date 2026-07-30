import ResourceBrowsePage from "@/components/learn/browse/ResourceBrowsePage";
import { MCQ_BROWSE_CONFIG } from "@/lib/resource-browse-data";

export const metadata = {
  title: "MCQ Practice | r/alevel",
  description:
    "Practice thousands of exam-style multiple choice questions.",
};

export default function McqPracticePage() {
  return <ResourceBrowsePage config={MCQ_BROWSE_CONFIG} />;
}
