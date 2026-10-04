import { getTeamAccessList } from "@/lib/data/admin/team-access";
import { getAuthSession } from "@/lib/getAuthSession";
import { parsePaginationParams } from "@/lib/pagination";
import { SCHOLARSHIP_TEAM_ROLES } from "@/lib/roles";
import ScholarshipTeamClient from "../_components/ScholarshipTeamClient";

export default async function ScholarshipTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getAuthSession();
  const params = await searchParams;
  const pagination = parsePaginationParams(new URLSearchParams({ page: params.page ?? "1" }));
  const { data, pagination: meta } = await getTeamAccessList(SCHOLARSHIP_TEAM_ROLES, pagination);

  return <ScholarshipTeamClient session={session} initialUsers={data} pagination={meta} />;
}
