// lib/roles.ts

export const ROLES = [
  "owner",
  "admin",
  "mod_dep_head",
  "helper_dep_head",
  "graphic_dep_head",
  "info_dep_head",
  "reddit_dep_head",
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

/** Roles editable on /admin/access (excludes owner, writer, resource team). */
export const ACCESS_PAGE_ASSIGNABLE_ROLES = ROLES.filter(
  (role): role is Role =>
    role !== "owner" &&
    !RESOURCE_TEAM_ROLES.includes(role as ResourceTeamRole) &&
    !WRITER_TEAM_ROLES.includes(role as WriterTeamRole),
);

export function sanitizeAccessPageRoles(roles: Role[]): Role[] {
  const allowed = new Set<Role>(ACCESS_PAGE_ASSIGNABLE_ROLES);
  return roles.filter((role) => allowed.has(role));
}

/** True when incoming roles newly grant authority at or above the actor's level. */
export function hasDisallowedRoleGrant(
  actorHighest: Role,
  currentRoles: Role[],
  incomingRoles: Role[],
): boolean {
  const addedRoles = incomingRoles.filter((role) => !currentRoles.includes(role));
  return addedRoles.some(
    (role) => roleRank(role) <= roleRank(actorHighest),
  );
}

export function mergePreservedStaffRoles(
  currentRoles: Role[],
  incomingRoles: Role[],
): Role[] {
  const preserved = currentRoles.filter(
    (role) =>
      role === "owner" ||
      WRITER_TEAM_ROLES.includes(role as WriterTeamRole) ||
      RESOURCE_TEAM_ROLES.includes(role as ResourceTeamRole),
  );
  const incomingSet = new Set(incomingRoles);
  const extra = preserved.filter((role) => !incomingSet.has(role));
  return [...incomingRoles, ...extra];
}

export const FORMS_ACCESS_ROLES = [
  "owner",
  "admin",
  "mod_dep_head",
  "helper_dep_head",
  "graphic_dep_head",
  "info_dep_head",
  "reddit_dep_head",
] as const satisfies readonly Role[];

export const REDDIT_FORM_TYPE = "reddit-mod" as const;

export const REDDIT_FORM_MANAGE_ROLES = [
  "owner",
  "admin",
  "reddit_dep_head",
] as const satisfies readonly Role[];

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
  allowedRoles: readonly Role[] | undefined
) {
  if (!userRoles?.length || !allowedRoles?.length) return false;
  return allowedRoles.some((r) => userRoles.includes(r));
}

/**
 * Alias (semantic clarity)
 */
export function hasAnyRole(
  userRoles: Role[] | undefined,
  allowedRoles: readonly Role[] | undefined
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

export function hasFormsAccess(userRoles?: Role[]) {
  return hasAnyRole(userRoles, FORMS_ACCESS_ROLES);
}

export function canManageRedditForm(userRoles?: Role[]) {
  return hasAnyRole(userRoles, REDDIT_FORM_MANAGE_ROLES);
}

export function canManageFormType(userRoles: Role[] | undefined, formType: string) {
  if (isAdmin(userRoles)) return true;
  if (formType === REDDIT_FORM_TYPE) {
    return canManageRedditForm(userRoles);
  }
  return false;
}
