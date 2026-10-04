import { getPendingSubmissions } from "@/lib/data/admin/scholarships";
import SubmissionsClient from "../_components/SubmissionsClient";

export default async function ScholarshipSubmissionsPage() {
  const submissions = await getPendingSubmissions();
  return <SubmissionsClient submissions={submissions} />;
}
