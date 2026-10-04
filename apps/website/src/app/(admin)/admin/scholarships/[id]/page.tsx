import { getAdminScholarship, getUniversityOptions } from "@/lib/data/admin/scholarships";
import { notFound } from "next/navigation";
import ScholarshipEditor from "../_components/ScholarshipEditor";

export default async function EditScholarshipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [scholarship, universities] = await Promise.all([
    getAdminScholarship(id),
    getUniversityOptions(),
  ]);
  if (!scholarship) notFound();

  return (
    <ScholarshipEditor
      key={id}
      id={id}
      initial={scholarship.input}
      meta={scholarship.meta}
      universities={universities}
    />
  );
}
