import { createTeamAccessHandlers } from "@/lib/admin/teamAccessApi";
import {
  mergeResourceTeamRole,
  mergeScholarshipTeamRole,
  RESOURCE_ACCESS_MANAGE_ROLES,
  RESOURCE_TEAM_ROLES,
  SCHOLARSHIP_ACCESS_MANAGE_ROLES,
  SCHOLARSHIP_TEAM_ROLES,
  stripResourceTeamRoles,
  stripScholarshipTeamRoles,
} from "@/lib/roles";

export const resourceAccessHandlers = createTeamAccessHandlers({
  key: "resource",
  teamRoles: RESOURCE_TEAM_ROLES,
  depHeadRole: "resource_dep_head",
  manageRoles: RESOURCE_ACCESS_MANAGE_ROLES,
  depHeadLabel: "Resource Dep. Head",
  mergeRole: mergeResourceTeamRole,
  stripRoles: stripResourceTeamRoles,
});

export const scholarshipAccessHandlers = createTeamAccessHandlers({
  key: "scholarship",
  teamRoles: SCHOLARSHIP_TEAM_ROLES,
  depHeadRole: "scholarship_dep_head",
  manageRoles: SCHOLARSHIP_ACCESS_MANAGE_ROLES,
  depHeadLabel: "Scholarship Dep. Head",
  mergeRole: mergeScholarshipTeamRole,
  stripRoles: stripScholarshipTeamRoles,
});
