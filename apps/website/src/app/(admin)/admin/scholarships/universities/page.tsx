import { getAdminUniversities, parseAdminView } from "@/lib/data/admin/scholarships";
import UniversitiesAdminClient from "../_components/UniversitiesAdminClient";

type SearchParams = Promise<{ q?: string; view?: string; page?: string }>;

export default async function AdminUniversitiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const view = parseAdminView(params.view);
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const list = await getAdminUniversities({ q, view, page });

  return (
    <UniversitiesAdminClient
      key={`${q}|${view}|${page}`}
      rows={list.data}
      pagination={list.pagination}
      q={q}
      view={view}
    />
  );
}
