import { guardSection } from "@/lib/admin-access/page-guard";
import {
  countRequestsNeedingReview,
  listChangeRequests,
} from "@/lib/data/admin/resource-change-requests";
import { getAuthSession } from "@/lib/getAuthSession";
import { parsePaginationParams } from "@/lib/pagination";
import { viewerFromSession } from "@/lib/resource-cms/requests/route";
import RequestsClient, { type RequestsTab } from "./RequestsClient";

const TABS: RequestsTab[] = ["needs-review", "open", "closed", "all"];

export default async function ResourceChangeRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; mine?: string; page?: string }>;
}) {
  const denied = await guardSection("resource-cms");
  if (denied) return denied;

  const [params, session] = await Promise.all([searchParams, getAuthSession()]);
  const viewer = session ? await viewerFromSession(session) : null;
  const canPublish = !!viewer?.canPublish;

  const tab: RequestsTab = TABS.includes(params.tab as RequestsTab)
    ? (params.tab as RequestsTab)
    : canPublish
      ? "needs-review"
      : "open";
  const mine = params.mine === "1";
  const { page, limit, skip } = parsePaginationParams(
    new URLSearchParams({ page: params.page ?? "1" }),
  );

  const [result, needsReview] = await Promise.all([
    listChangeRequests({
      page,
      limit,
      skip,
      filters: { tab, authorUserId: mine ? viewer?.userId : undefined },
    }),
    countRequestsNeedingReview(),
  ]);

  return (
    <RequestsClient
      requests={result.data}
      pagination={result.pagination}
      tab={tab}
      mine={mine}
      needsReview={needsReview}
      canPublish={canPublish}
    />
  );
}
