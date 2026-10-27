// Pure, client-safe page-access logic. The stored document only holds
// sections that differ from their code default; everything here works on the
// resolved map, where every section lists exactly the roles that can open it.

import { isAdmin, roleRank, type Role } from "@/lib/roles";
import {
  ADMIN_SECTIONS,
  PAGE_ACCESS_ROLES,
  isAdminSectionKey,
  matchAdminSection,
  type AdminSectionKey,
} from "./sections";

export type AccessMap = Record<AdminSectionKey, Role[]>;
export type AccessOverrides = Partial<Record<AdminSectionKey, Role[]>>;
export type AccessChange = {
  section: AdminSectionKey;
  role: Role;
  granted: boolean;
};

const GRANTABLE = new Set<Role>(PAGE_ACCESS_ROLES);

function cleanRoles(roles: readonly unknown[]): Role[] {
  const unique = new Set<Role>(["owner"]);
  for (const role of roles) {
    if (typeof role === "string" && GRANTABLE.has(role as Role)) {
      unique.add(role as Role);
    }
  }
  return [...unique].sort((a, b) => roleRank(a) - roleRank(b));
}

/**
 * Builds the effective map from stored overrides (or any partial map).
 * Drops unknown roles and sections, always includes owner, ignores stored
 * values for locked sections, and limits `requires` sections to roles that
 * can also open the parent.
 */
export function resolveAccessMap(stored?: unknown): AccessMap {
  const source =
    stored && typeof stored === "object" && !Array.isArray(stored)
      ? (stored as Record<string, unknown>)
      : {};
  const map = {} as AccessMap;

  for (const section of ADMIN_SECTIONS) {
    const value = source[section.key];
    const useStored = !section.lock && Array.isArray(value);
    map[section.key] = cleanRoles(useStored ? value : section.defaultRoles);
  }

  for (const section of ADMIN_SECTIONS) {
    if (!section.requires) continue;
    const parent = new Set(map[section.requires]);
    map[section.key] = map[section.key].filter((role) => parent.has(role));
  }

  return map;
}

export const DEFAULT_ACCESS_MAP: AccessMap = resolveAccessMap();

function sameRoles(a: readonly Role[], b: readonly Role[]) {
  return a.length === b.length && a.every((role) => b.includes(role));
}

/** The sections of a resolved map that differ from their defaults. */
export function toOverrides(map: AccessMap): AccessOverrides {
  const overrides: AccessOverrides = {};
  for (const section of ADMIN_SECTIONS) {
    if (section.lock) continue;
    if (!sameRoles(map[section.key], DEFAULT_ACCESS_MAP[section.key])) {
      overrides[section.key] = [...map[section.key]];
    }
  }
  return overrides;
}

/** Applies grant/revoke changes, then re-resolves (owner and locks win). */
export function applyChanges(
  map: AccessMap,
  changes: readonly AccessChange[],
): AccessMap {
  const next: Record<string, Role[]> = {};
  for (const key of Object.keys(map)) {
    next[key] = [...map[key as AdminSectionKey]];
  }
  for (const { section, role, granted } of changes) {
    if (!isAdminSectionKey(section)) continue;
    const roles = next[section].filter((r) => r !== role);
    next[section] = granted ? [...roles, role] : roles;
  }
  return resolveAccessMap(next);
}

export function hasSectionAccess(
  map: AccessMap,
  roles: readonly Role[] | undefined,
  keys: AdminSectionKey | readonly AdminSectionKey[],
): boolean {
  if (!roles?.length) return false;
  const list = typeof keys === "string" ? [keys] : keys;
  return list.some((key) => map[key].some((role) => roles.includes(role)));
}

/** Sections the roles can open, in registry (sidebar) order. */
export function sectionsForRoles(
  map: AccessMap,
  roles: readonly Role[] | undefined,
): AdminSectionKey[] {
  return ADMIN_SECTIONS.filter((section) =>
    hasSectionAccess(map, roles, section.key),
  ).map((section) => section.key);
}

/** Anyone who can open at least one section can enter /admin. */
export function canEnterAdmin(
  map: AccessMap,
  roles: readonly Role[] | undefined,
): boolean {
  return sectionsForRoles(map, roles).length > 0;
}

/**
 * Whether the roles may open an /admin path: /admin itself needs any section,
 * registered paths need their section, and unregistered paths fail closed to
 * owners and admins.
 */
export function canOpenAdminPath(
  map: AccessMap,
  roles: readonly Role[] | undefined,
  pathname: string,
): boolean {
  if (!canEnterAdmin(map, roles)) return false;
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (path === "/admin") return true;
  const section = matchAdminSection(path);
  if (!section) return isAdmin(roles as Role[]);
  return hasSectionAccess(map, roles, section.key);
}

/**
 * Whether a section, a role, or one role/section cell differs from the code
 * default. Locked sections are never customized.
 */
export function isCustomized(
  map: AccessMap,
  target: { section?: AdminSectionKey; role?: Role },
): boolean {
  return ADMIN_SECTIONS.some((section) => {
    if (section.lock) return false;
    if (target.section && section.key !== target.section) return false;
    const now = map[section.key];
    const before = DEFAULT_ACCESS_MAP[section.key];
    if (target.role) {
      return now.includes(target.role) !== before.includes(target.role);
    }
    return !sameRoles(now, before);
  });
}
