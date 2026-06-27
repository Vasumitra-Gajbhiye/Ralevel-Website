// lib/roles.ts

export const ROLES = [
  "owner",
  "admin",
  "mod_dep_head",
  "helper_dep_head",
  "graphic_dep_head",
  "info_dep_head",
  "resource_dep_head",
  "resource_staff",
  "senior_mod",
  "junior_mod",
  "trial_mod",
  "graphic_designer",
  "writer_dep_head",
  "senior_writer",
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
  "resource_staff",
] as const satisfies readonly Role[];

export const RESOURCE_ACCESS_MANAGE_ROLES = [
  "owner",
  "admin",
  "resource_dep_head",
] as const satisfies readonly Role[];

export const RESOURCE_TEAM_ROLES = [
  "resource_dep_head",
  "resource_staff",
] as const satisfies readonly Role[];

export type ResourceTeamRole = (typeof RESOURCE_TEAM_ROLES)[number];

export const WRITER_CMS_ROLES = [
  "owner",
  "admin",
  "writer_dep_head",
  "senior_writer",
  "writer",
] as const satisfies readonly Role[];

export const WRITER_ACCESS_MANAGE_ROLES = [
  "owner",
  "admin",
  "writer_dep_head",
] as const satisfies readonly Role[];

export const WRITER_TEAM_ROLES = [
  "writer_dep_head",
  "senior_writer",
  "writer",
] as const satisfies readonly Role[];

export const BLOG_REVIEW_ROLES = [
  "owner",
  "admin",
  "writer_dep_head",
] as const satisfies readonly Role[];

export type WriterTeamRole = (typeof WRITER_TEAM_ROLES)[number];

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

export function hasWriterCmsAccess(userRoles?: Role[]) {
  return hasAnyRole(userRoles, WRITER_CMS_ROLES);
}

export function hasWriterTeamRole(userRoles?: Role[]) {
  return hasAnyRole(userRoles, WRITER_TEAM_ROLES);
}

export function needsWriterRoleSelfGrant(userRoles?: Role[]) {
  return hasWriterCmsAccess(userRoles) && !hasWriterTeamRole(userRoles);
}

export function canManageWriterAccess(userRoles?: Role[]) {
  return hasAnyRole(userRoles, WRITER_ACCESS_MANAGE_ROLES);
}

export function stripWriterTeamRoles(roles: Role[]): Role[] {
  return roles.filter((r) => !WRITER_TEAM_ROLES.includes(r as WriterTeamRole));
}

export function mergeWriterTeamRole(
  roles: Role[],
  assignedRole: WriterTeamRole
): Role[] {
  return [...stripWriterTeamRoles(roles), assignedRole];
}
