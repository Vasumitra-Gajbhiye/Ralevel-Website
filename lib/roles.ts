// lib/roles.ts

export const ROLES = [
  "owner",
  "admin",
  "mod_dep_head",
  "helper_dep_head",
  "graphic_dep_head",
  "info_dep_head",
  "resource_dep_head",
  "resource_admin",
  "senior_mod",
  "junior_mod",
  "trial_mod",
  "graphic_designer",
  "writer",
  "bot_dev",
  "helper",
  "informative_team",
  "former_staff",
] as const;

export type Role = (typeof ROLES)[number];

export const RESOURCE_CMS_ROLES = [
  "owner",
  "admin",
  "resource_dep_head",
  "resource_admin",
] as const satisfies readonly Role[];

export const RESOURCE_ACCESS_MANAGE_ROLES = [
  "owner",
  "admin",
  "resource_dep_head",
] as const satisfies readonly Role[];

export const RESOURCE_TEAM_ROLES = [
  "resource_dep_head",
  "resource_admin",
] as const satisfies readonly Role[];

export type ResourceTeamRole = (typeof RESOURCE_TEAM_ROLES)[number];

/**
 * Lower index = higher authority
 */
export function roleRank(role: Role) {
  return ROLES.indexOf(role);
}

/**
 * Get highest authority role from a list of roles
 */
export function highestAuthorityRole(roles: Role[]): Role {
  return roles.reduce((highest, current) =>
    roleRank(current) < roleRank(highest) ? current : highest
  );
}

/**
 * Check if user has at least one required role
 */
export function hasRequiredRole(
  userRoles: Role[] | undefined,
  allowedRoles: readonly Role[]
) {
  if (!userRoles || userRoles.length === 0) return false;
  return allowedRoles.some((r) => userRoles.includes(r));
}

/**
 * Alias (semantic clarity)
 */
export function hasAnyRole(
  userRoles: Role[] | undefined,
  allowedRoles: readonly Role[]
) {
  return hasRequiredRole(userRoles, allowedRoles);
}

/**
 * Admin-level access helper
 */
export function isAdmin(userRoles?: Role[]) {
  return hasAnyRole(userRoles, ["owner", "admin"]);
}

export function hasResourceCmsAccess(userRoles?: Role[]) {
  return hasAnyRole(userRoles, RESOURCE_CMS_ROLES);
}

export function canManageResourceAccess(userRoles?: Role[]) {
  return hasAnyRole(userRoles, RESOURCE_ACCESS_MANAGE_ROLES);
}

export function stripResourceTeamRoles(roles: Role[]): Role[] {
  return roles.filter((r) => !RESOURCE_TEAM_ROLES.includes(r as ResourceTeamRole));
}

export function mergeResourceTeamRole(
  roles: Role[],
  assignedRole: ResourceTeamRole
): Role[] {
  return [...stripResourceTeamRoles(roles), assignedRole];
}
