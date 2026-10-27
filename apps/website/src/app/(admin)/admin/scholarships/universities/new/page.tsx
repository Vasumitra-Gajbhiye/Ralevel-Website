import { guardSection } from "@/lib/admin-access/page-guard";
import { emptyUniversityInput } from "@/lib/validation/scholarships";
import UniversityEditor from "../../_components/UniversityEditor";

export default async function NewUniversityPage() {
  const denied = await guardSection("scholarships");
  if (denied) return denied;

  return <UniversityEditor initial={emptyUniversityInput()} />;
}
