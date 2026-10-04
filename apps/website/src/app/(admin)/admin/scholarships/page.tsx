import {
  getAdminScholarships,
  getAttentionCounts,
  parseAdminView,
} from "@/lib/data/admin/scholarships";
import ScholarshipsAdminClient from "./_components/ScholarshipsAdminClient";

type SearchParams = Promise<{ q?: string; view?: string; page?: string }>;

export default async function AdminScholarshipsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const view = parseAdminView(params.view);
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const [list, attention] = await Promise.all([
    getAdminScholarships({ q, view, page }),
    getAttentionCounts(),
  ]);

  return (
    <ScholarshipsAdminClient
      key={`${q}|${view}|${page}`}
      rows={list.data}
      pagination={list.pagination}
      q={q}
      view={view}
      attention={attention}
    />
  );
}
