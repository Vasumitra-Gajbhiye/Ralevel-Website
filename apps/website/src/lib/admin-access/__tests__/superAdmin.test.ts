import { ROLES } from "@/lib/roles";
import { SUPER_ADMIN_EMAIL, applySuperAdminRoles } from "@/lib/superAdmin";
import { describe, expect, it } from "vitest";
import { copyRoleAccess, resetRole } from "../diff";
import { DEFAULT_ACCESS_MAP, applyChanges, canOpenAdminPath, resolveAccessMap } from "../resolve";
import { ADMIN_SECTIONS } from "../sections";
import { adminPagePaths } from "./adminPages";

// Whatever is saved in page access, or stored on the super admin's own user
// record, the super admin must keep every admin page.
const hostileMaps = [
  DEFAULT_ACCESS_MAP,
  // Every section stripped down to nobody.
  resolveAccessMap(Object.fromEntries(ADMIN_SECTIONS.map((s) => [s.key, []]))),
  // Explicit attempts to revoke owner everywhere.
  applyChanges(
    DEFAULT_ACCESS_MAP,
    ADMIN_SECTIONS.map((s) => ({ section: s.key, role: "owner" as const, granted: false })),
  ),
  copyRoleAccess(DEFAULT_ACCESS_MAP, "former_staff", "owner"),
  resetRole(DEFAULT_ACCESS_MAP, "owner"),
];

describe("super admin access", () => {
  const storedRoleSets = [[], ["former_staff"], ["helper"], ...ROLES.map((r) => [r])] as const;

  it("always gets the owner role, in any letter case", () => {
    for (const email of [SUPER_ADMIN_EMAIL, SUPER_ADMIN_EMAIL.toUpperCase()]) {
      for (const stored of storedRoleSets) {
        expect(applySuperAdminRoles(email, [...stored])).toContain("owner");
      }
    }
    expect(applySuperAdminRoles("someone.else@example.com", [])).toEqual([]);
  });

  it("opens every admin page whatever page access says", () => {
    const pages = [...adminPagePaths(), "/admin/permissions", "/admin/some-future-page"];
    for (const map of hostileMaps) {
      for (const stored of storedRoleSets) {
        const roles = applySuperAdminRoles(SUPER_ADMIN_EMAIL, [...stored]);
        for (const page of pages) {
          expect(canOpenAdminPath(map, roles, page), `${page} with ${stored}`).toBe(true);
        }
      }
    }
  });
});
