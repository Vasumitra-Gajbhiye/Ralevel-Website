import { guardSection } from "@/lib/admin-access/page-guard";
import { getPendingSubmissions } from "@/lib/data/admin/scholarships";
import SubmissionsClient from "../_components/SubmissionsClient";

export default async function ScholarshipSubmissionsPage() {
  const denied = await guardSection("scholarships");
  if (denied) return denied;

  const submissions = await getPendingSubmissions();
  return <SubmissionsClient submissions={submissions} />;
}
