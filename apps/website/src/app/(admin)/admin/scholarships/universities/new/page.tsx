import { emptyUniversityInput } from "@/lib/validation/scholarships";
import UniversityEditor from "../../_components/UniversityEditor";

export default function NewUniversityPage() {
  return <UniversityEditor initial={emptyUniversityInput()} />;
}
