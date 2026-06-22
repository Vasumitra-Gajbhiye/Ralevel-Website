import { getAdminResourceSubjectsList } from "@/lib/data/admin/resource-cms";
import {
  listResourceCMSRevisionActors,
  listResourceCMSRevisions,
} from "@/lib/data/admin/resource-cms-revisions";
import { parseResourceCMSHistoryFilters } from "@/lib/resource-cms/history-filters";
import { parsePaginationParams } from "@/lib/pagination";
import HistoryClient from "./HistoryClient";

export default async function ResourceCMSHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    slug?: string;
    kind?: string;
    action?: string;
    actor?: string;
    snapshotScope?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const params = await searchParams;
  const urlParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) urlParams.set(key, value);
  }
  if (!urlParams.get("limit")) {
    urlParams.set("limit", "10");
  }

  const { page, limit, skip } = parsePaginationParams(urlParams);
  const filters = parseResourceCMSHistoryFilters(urlParams);

  const [{ data: revisions, pagination }, { data: subjects }, actors] =
    await Promise.all([
      listResourceCMSRevisions({ page, limit, skip, filters }),
      getAdminResourceSubjectsList({ page: 1, limit: 100, skip: 0 }),
      listResourceCMSRevisionActors(),
    ]);

  return (
    <HistoryClient
      revisions={revisions}
      pagination={pagination}
      subjects={subjects}
      actors={actors}
      filters={filters}
    />
  );
}
