import { getTeamAccessList, type TeamAccessUser } from "@/lib/data/admin/team-access";
import { RESOURCE_TEAM_ROLES, type ResourceTeamRole } from "@/lib/roles";

export type ResourceAccessUser = TeamAccessUser<ResourceTeamRole>;

export function getResourceAccessList(pagination: {
  page: number;
  limit: number;
  skip: number;
}) {
  return getTeamAccessList(RESOURCE_TEAM_ROLES, pagination);
}
