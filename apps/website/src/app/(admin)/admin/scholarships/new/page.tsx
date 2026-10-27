import { guardSection } from "@/lib/admin-access/page-guard";
import { getUniversityOptions } from "@/lib/data/admin/scholarships";
import { emptyScholarshipInput } from "@/lib/validation/scholarships";
import ScholarshipEditor from "../_components/ScholarshipEditor";

export default async function NewScholarshipPage() {
  const denied = await guardSection("scholarships");
  if (denied) return denied;

  const universities = await getUniversityOptions();
  return <ScholarshipEditor initial={emptyScholarshipInput()} universities={universities} />;
}
