import ResourceBrowsePage from "@/components/learn/browse/ResourceBrowsePage";
import { THEORY_BROWSE_CONFIG } from "@/lib/resource-browse-data";

export const metadata = {
  title: "Theory Practice | r/alevel",
  description:
    "Improve your written answers with structured theory questions.",
};

export default function TheoryPracticePage() {
  return <ResourceBrowsePage config={THEORY_BROWSE_CONFIG} />;
}
