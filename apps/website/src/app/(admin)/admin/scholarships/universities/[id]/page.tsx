import { guardSection } from "@/lib/admin-access/page-guard";
import { getAdminUniversity } from "@/lib/data/admin/scholarships";
import { notFound } from "next/navigation";
import UniversityEditor from "../../_components/UniversityEditor";

export default async function EditUniversityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const denied = await guardSection("scholarships");
  if (denied) return denied;

  const { id } = await params;
  const university = await getAdminUniversity(id);
  if (!university) notFound();

  return (
    <UniversityEditor
      key={id}
      id={id}
      initial={university.input}
      needsVerification={university.meta.needsVerification}
    />
  );
}
