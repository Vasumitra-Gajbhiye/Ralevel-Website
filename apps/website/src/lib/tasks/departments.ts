/**
 * Departments for the /tasks workspace, derived from staff roles.
 *
 * Adding a department (or a role to one) is a one-line change here. Admins
 * (owner/admin) head every department. Client-safe: no mongoose imports.
 */
import { hasAnyRole, isAdmin, isStaff, STAFF_ROLES, type Role } from "@/lib/roles";
import type { TaskColor } from "./colors";

export type DepartmentConfig = {
  key: string;
  name: string;
  color: TaskColor;
  /** Roles that manage the department's lists (admins always do). */
  headRoles: readonly Role[];
  /** Roles that belong to the department, or every staff member. */
  memberRoles: readonly Role[] | "all-staff";
};

export const DEPARTMENTS = [
  { key: "general", name: "General", color: "slate", headRoles: [], memberRoles: "all-staff" },
  { key: "moderation", name: "Moderation", color: "blue", headRoles: ["mod_dep_head"], memberRoles: ["senior_mod", "junior_mod", "trial_mod"] },
  { key: "helpers", name: "Helpers", color: "green", headRoles: ["helper_dep_head"], memberRoles: ["helper"] },
  { key: "graphics", name: "Graphics", color: "pink", headRoles: ["graphic_dep_head"], memberRoles: ["graphic_designer"] },
  { key: "informative", name: "Informative", color: "amber", headRoles: ["info_dep_head"], memberRoles: ["informative_team"] },
  { key: "reddit", name: "Reddit", color: "orange", headRoles: ["reddit_dep_head"], memberRoles: [] },
  { key: "resources", name: "Resources", color: "teal", headRoles: ["resource_dep_head"], memberRoles: ["resource_staff"] },
  { key: "scholarships", name: "Scholarships", color: "violet", headRoles: ["scholarship_dep_head"], memberRoles: ["scholarship_staff"] },
  { key: "writers", name: "Writers", color: "red", headRoles: ["writer_dep_head"], memberRoles: ["senior_writer", "writer"] },
  { key: "botdev", name: "Bot Dev", color: "cyan", headRoles: [], memberRoles: ["bot_dev"] },
] as const satisfies readonly DepartmentConfig[];

export type DepartmentKey = (typeof DEPARTMENTS)[number]["key"];

export const DEPARTMENT_KEYS = DEPARTMENTS.map((d) => d.key) as DepartmentKey[];

const BY_KEY = new Map<string, DepartmentConfig>(DEPARTMENTS.map((d) => [d.key, d]));

const ADMIN_ROLES: readonly Role[] = ["owner", "admin"];

export function isDepartmentKey(value: unknown): value is DepartmentKey {
  return typeof value === "string" && BY_KEY.has(value);
}

export function getDepartment(key: string): DepartmentConfig | undefined {
  return BY_KEY.get(key);
}

/** Every role that counts as a member of the department, heads and admins included. */
export function departmentRoles(key: string): readonly Role[] {
  const dept = BY_KEY.get(key);
  if (!dept) return [];
  if (dept.memberRoles === "all-staff") return STAFF_ROLES;
  return [...new Set([...ADMIN_ROLES, ...dept.headRoles, ...dept.memberRoles])];
}

/** True when someone with these roles belongs to the department. */
export function isMemberRoleSet(roles: Role[] | undefined, key: string): boolean {
  if (!isStaff(roles)) return false;
  return hasAnyRole(roles, departmentRoles(key));
}

export function isHeadOf(roles: Role[] | undefined, key: string): boolean {
  if (!isStaff(roles)) return false;
  if (isAdmin(roles)) return true;
  const dept = BY_KEY.get(key);
  return Boolean(dept && hasAnyRole(roles, dept.headRoles));
}

/** Departments visible to someone with these roles, in display order. */
export function departmentsForRoles(roles: Role[] | undefined): DepartmentConfig[] {
  if (!isStaff(roles)) return [];
  return DEPARTMENTS.filter((d) => isMemberRoleSet(roles, d.key));
}

/** Mongo filter on UserData for the department's members. */
export function membersQuery(key: string) {
  return { roles: { $in: [...departmentRoles(key)] } };
}
