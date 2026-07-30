import ResourceBrowsePage from "@/components/learn/browse/ResourceBrowsePage";
import { NOTES_BROWSE_CONFIG } from "@/lib/resource-browse-data";

export const metadata = {
  title: "Notes | r/alevel",
  description:
    "Browse structured syllabus notes organised by board, subject, chapter and topic.",
};

export default function NotesPage() {
  return <ResourceBrowsePage config={NOTES_BROWSE_CONFIG} />;
}
