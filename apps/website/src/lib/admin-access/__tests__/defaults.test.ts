import { ROLES, type Role } from "@/lib/roles";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_ACCESS_MAP,
  canEnterAdmin,
  canOpenAdminPath,
  sectionsForRoles,
} from "../resolve";
import { ADMIN_SECTIONS, getAdminSection, type AdminSectionKey } from "../sections";
import { adminPagePaths } from "./adminPages";
import {
  LEGACY_API_RULES,
  LEGACY_PANEL_ROLES,
  LEGACY_SIDEBAR,
  legacyCanOpen,
} from "./legacy.fixture";

const sortRoles = (roles: Iterable<Role>) =>
  [...new Set(roles)].sort((a, b) => ROLES.indexOf(a) - ROLES.indexOf(b));

const sectionRoles = (section: AdminSectionKey | AdminSectionKey[]) =>
  sortRoles(
    (typeof section === "string" ? [section] : section).flatMap(
      (key) => DEFAULT_ACCESS_MAP[key],
    ),
  );

// The only intended differences from the old hardcoded rules.
const RESOURCE_SUBMISSIONS_PAGE = /^\/admin\/forms\/resource(\/|$)/;
const SCHEDULING_WRITERS_GAINED: Role[] = ["info_dep_head"];

describe("registry defaults match the old hardcoded access", () => {
  const pages = adminPagePaths();

  it("finds the admin pages", () => {
    expect(pages.length).toBeGreaterThan(30);
    expect(pages).toContain("/admin/scholarships/team");
  });

  it("opens the same pages for every role", () => {
    const differences: string[] = [];
    for (const path of pages) {
      for (const role of ROLES) {
        const before = legacyCanOpen([role], path);
        const after = canOpenAdminPath(DEFAULT_ACCESS_MAP, [role], path);
        if (before !== after) differences.push(`${path} ${role} ${before}→${after}`);
      }
    }

    // Resource submissions now match their API (owner/admin only), so the
    // other forms roles lose a page that only ever returned 403s.
    const losers: Role[] = [
      "mod_dep_head",
      "helper_dep_head",
      "graphic_dep_head",
      "info_dep_head",
      "reddit_dep_head",
      "resource_dep_head",
      "writer_dep_head",
    ];
    const expected = pages
      .filter((path) => RESOURCE_SUBMISSIONS_PAGE.test(path))
      .flatMap((path) => losers.map((role) => `${path} ${role} true→false`));
    expect(differences.sort()).toEqual(expected.sort());
  });

  it("lets the same roles into /admin", () => {
    const entering = ROLES.filter((role) => canEnterAdmin(DEFAULT_ACCESS_MAP, [role]));
    expect(sortRoles(entering)).toEqual(sortRoles(LEGACY_PANEL_ROLES));
  });

  it("shows the same sidebar links, plus Page access for owners and admins", () => {
    for (const role of ROLES) {
      const before = LEGACY_SIDEBAR.filter((link) => link.roles.includes(role)).map(
        (link) => link.href,
      );
      const after = sectionsForRoles(DEFAULT_ACCESS_MAP, [role]).flatMap((key) =>
        getAdminSection(key).nav.map((link) => link.href),
      );
      const expected =
        role === "owner" || role === "admin" ? [...before, "/admin/permissions"] : before;
      expect(after, role).toEqual(expected);
    }
  });

  it("gives each API the roles it allowed before", () => {
    for (const rule of LEGACY_API_RULES) {
      const isSchedulingWrite =
        rule.route === "api/admin/scheduling" && !rule.methods.includes("GET");
      const expected = isSchedulingWrite
        ? sortRoles([...rule.roles, ...SCHEDULING_WRITERS_GAINED])
        : sortRoles(rule.roles);
      expect(sectionRoles(rule.section), `${rule.route} ${rule.methods}`).toEqual(
        expected,
      );
    }
  });

  it("never lists former staff", () => {
    for (const section of ADMIN_SECTIONS) {
      expect(DEFAULT_ACCESS_MAP[section.key]).not.toContain("former_staff");
    }
  });
});
