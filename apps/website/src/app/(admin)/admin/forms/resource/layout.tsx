import { guardSection } from "@/lib/admin-access/page-guard";

// The pages below are client components, so they're guarded here instead.
export default async function ResourceSubmissionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const denied = await guardSection("resource-submissions");
  return denied ?? children;
}
