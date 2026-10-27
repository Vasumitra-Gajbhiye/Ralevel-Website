// Pure helpers behind the Page access editor: what changed, who it affects,
// what to warn about, and the copy/reset shortcuts.

import { ROLE_LABELS } from "@/lib/role-labels";
import { roleRank, type Role } from "@/lib/roles";
import {
  DEFAULT_ACCESS_MAP,
  applyChanges,
  hasSectionAccess,
  resolveAccessMap,
  sectionsForRoles,
  type AccessChange,
  type AccessMap,
} from "./resolve";
import {
  ADMIN_SECTIONS,
  getAdminSection,
  type AdminSectionKey,
} from "./sections";

/** A distinct set of roles held by `count` people. */
export type RoleCombo = { roles: Role[]; count: number };

export type AccessWarning = {
  kind: "risky-grant" | "self-loss" | "many-people";
  message: string;
};

export const MANY_PEOPLE_THRESHOLD = 20;

const EDITABLE_SECTIONS = ADMIN_SECTIONS.filter((section) => !section.lock);
const SECTION_ORDER = new Map(
  ADMIN_SECTIONS.map((section, index) => [section.key, index]),
);

/** Every role/section cell that differs, by role rank then sidebar order. */
export function diffAccessMaps(
  before: AccessMap,
  after: AccessMap,
): AccessChange[] {
  const changes: AccessChange[] = [];
  for (const { key } of ADMIN_SECTIONS) {
    for (const role of after[key]) {
      if (!before[key].includes(role)) {
        changes.push({ section: key, role, granted: true });
      }
    }
    for (const role of before[key]) {
      if (!after[key].includes(role)) {
        changes.push({ section: key, role, granted: false });
      }
    }
  }
  return changes.sort(
    (a, b) =>
      roleRank(a.role) - roleRank(b.role) ||
      SECTION_ORDER.get(a.section)! - SECTION_ORDER.get(b.section)!,
  );
}

export function describeChange(change: AccessChange): string {
  const role = ROLE_LABELS[change.role];
  const page = getAdminSection(change.section).label;
  return change.granted
    ? `${role} can now open ${page}`
    : `${role} can no longer open ${page}`;
}

/**
 * People holding the change's role whose access to its section actually
 * flips. People who keep (or already had) access through another role are
 * not counted.
 */
export function countAffectedByChange(
  combos: readonly RoleCombo[],
  before: AccessMap,
  after: AccessMap,
  change: AccessChange,
): number {
  return combos.reduce((total, combo) => {
    if (!combo.roles.includes(change.role)) return total;
    const had = hasSectionAccess(before, combo.roles, change.section);
    const has = hasSectionAccess(after, combo.roles, change.section);
    return had === has ? total : total + combo.count;
  }, 0);
}

/** People whose set of openable pages changes at all. */
export function countAffectedPeople(
  combos: readonly RoleCombo[],
  before: AccessMap,
  after: AccessMap,
): number {
  return combos.reduce((total, combo) => {
    const had = sectionsForRoles(before, combo.roles).join();
    const has = sectionsForRoles(after, combo.roles).join();
    return had === has ? total : total + combo.count;
  }, 0);
}

function listLabels(keys: readonly AdminSectionKey[]): string {
  const labels = keys.map((key) => getAdminSection(key).label);
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`;
}

/** Warnings shown at the top of the review step. */
export function riskWarnings(input: {
  before: AccessMap;
  after: AccessMap;
  actorRoles: readonly Role[];
  combos: readonly RoleCombo[];
}): AccessWarning[] {
  const { before, after, actorRoles, combos } = input;
  const warnings: AccessWarning[] = [];

  for (const change of diffAccessMaps(before, after)) {
    const section = getAdminSection(change.section);
    const isLeadership = change.role === "owner" || change.role === "admin";
    if (change.granted && section.risk && !isLeadership) {
      warnings.push({
        kind: "risky-grant",
        message: `With ${section.label}, ${ROLE_LABELS[change.role]} ${section.risk}.`,
      });
    }
  }

  const keeps = new Set(sectionsForRoles(after, actorRoles));
  const lost = sectionsForRoles(before, actorRoles).filter(
    (key) => !keeps.has(key),
  );
  if (lost.length > 0) {
    warnings.push({
      kind: "self-loss",
      message: `You will lose access to ${listLabels(lost)}.`,
    });
  }

  const affected = countAffectedPeople(combos, before, after);
  if (affected > MANY_PEOPLE_THRESHOLD) {
    warnings.push({
      kind: "many-people",
      message: `This changes page access for ${affected} people.`,
    });
  }

  return warnings;
}

/** Gives `to` exactly the editable pages `from` has. */
export function copyRoleAccess(map: AccessMap, from: Role, to: Role): AccessMap {
  return applyChanges(
    map,
    EDITABLE_SECTIONS.map((section) => ({
      section: section.key,
      role: to,
      granted: map[section.key].includes(from),
    })),
  );
}

/** Puts one role back to its default pages. */
export function resetRole(map: AccessMap, role: Role): AccessMap {
  return applyChanges(
    map,
    EDITABLE_SECTIONS.map((section) => ({
      section: section.key,
      role,
      granted: DEFAULT_ACCESS_MAP[section.key].includes(role),
    })),
  );
}

/** Puts one page back to its default roles. */
export function resetSection(map: AccessMap, key: AdminSectionKey): AccessMap {
  return resolveAccessMap({ ...map, [key]: DEFAULT_ACCESS_MAP[key] });
}
