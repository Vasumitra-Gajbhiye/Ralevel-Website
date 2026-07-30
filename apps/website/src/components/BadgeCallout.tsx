import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Lightbulb,
  Sigma,
} from "lucide-react";
// Assuming ICONS and TITLES are imported here

type CalloutType =
  | "definition"
  | "formula"
  | "example"
  | "solved"
  | "important"
  | "exam";

const TITLES: Record<CalloutType, string> = {
  definition: "Definition",
  formula: "Formula",
  example: "Example",
  solved: "Solved Example",
  important: "Important",
  exam: "Exam Tip",
};

const ICONS: Record<CalloutType, React.ElementType> = {
  definition: BookOpen,
  formula: Sigma,
  example: Lightbulb,
  solved: CheckCircle2,
  important: AlertTriangle,
  exam: GraduationCap,
}; // Assuming ICONS, TITLES, MD_PROPS, and CalloutType are defined in your file
