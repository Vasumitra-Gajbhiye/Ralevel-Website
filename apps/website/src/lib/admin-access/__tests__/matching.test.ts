import { ROLE_UI_GROUPS } from "@/lib/role-labels";
import { STAFF_ROLES } from "@/lib/roles";
import { describe, expect, it } from "vitest";
import { DEFAULT_ACCESS_MAP, canOpenAdminPath } from "../resolve";
import { ADMIN_SECTIONS, matchAdminSection } from "../sections";
import { adminPagePaths } from "./adminPages";

const keyFor = (path: string) => matchAdminSection(path)?.key ?? null;

describe("matchAdminSection", () => {
  it("uses the longest prefix on segment boundaries", () => {
    expect(keyFor("/admin/resource")).toBe("resource-team");
    expect(keyFor("/admin/resource-cms")).toBe("resource-cms");
    expect(keyFor("/admin/resource-cms/history")).toBe("resource-cms");
    expect(keyFor("/admin/scholarships/team")).toBe("scholarship-team");
    expect(keyFor("/admin/scholarships/teams")).toBe("scholarships");
    expect(keyFor("/admin/scholarships/universities/new")).toBe("scholarships");
    expect(keyFor("/admin/forms/resource")).toBe("resource-submissions");
    expect(keyFor("/admin/forms/resource/abc")).toBe("resource-submissions");
    expect(keyFor("/admin/forms/helper/some-form")).toBe("forms");
    expect(keyFor("/admin/blogs/v2/123/edit")).toBe("blogs");
    expect(keyFor("/admin/all-blogs")).toBe("all-blogs");
  });

  it("ignores trailing slashes and doesn't match partial segments", () => {
    expect(keyFor("/admin/scholarships/")).toBe("scholarships");
    expect(keyFor("/admin/teams")).toBeNull();
    expect(keyFor("/admin/teamwork")).toBeNull();
  });

  it("returns null for /admin itself and unknown pages", () => {
    expect(keyFor("/admin")).toBeNull();
    expect(keyFor("/admin/")).toBeNull();
    expect(keyFor("/admin/not-a-page")).toBeNull();
  });

  it("covers every admin page", () => {
    const unmatched = adminPagePaths().filter(
      (path) => path !== "/admin" && !matchAdminSection(path),
    );
    expect(unmatched).toEqual([]);
  });
});

describe("canOpenAdminPath", () => {
  it("fails closed to owners and admins for unknown pages", () => {
    expect(canOpenAdminPath(DEFAULT_ACCESS_MAP, ["admin"], "/admin/new-thing")).toBe(true);
    expect(canOpenAdminPath(DEFAULT_ACCESS_MAP, ["writer_dep_head"], "/admin/new-thing")).toBe(
      false,
    );
  });

  it("opens /admin for anyone with a page, and nobody else", () => {
    expect(canOpenAdminPath(DEFAULT_ACCESS_MAP, ["writer"], "/admin")).toBe(true);
    expect(canOpenAdminPath(DEFAULT_ACCESS_MAP, ["senior_mod"], "/admin")).toBe(false);
    expect(canOpenAdminPath(DEFAULT_ACCESS_MAP, [], "/admin")).toBe(false);
    expect(canOpenAdminPath(DEFAULT_ACCESS_MAP, undefined, "/admin")).toBe(false);
  });
});

describe("section registry", () => {
  it("has unique keys and prefixes", () => {
    const keys = ADMIN_SECTIONS.map((s) => s.key);
    const prefixes = ADMIN_SECTIONS.flatMap((s) => s.prefixes);
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(prefixes).size).toBe(prefixes.length);
  });

  it("points every sidebar link at its own section", () => {
    for (const section of ADMIN_SECTIONS) {
      for (const link of section.nav) {
        expect(keyFor(link.href), link.href).toBe(section.key);
      }
    }
  });

  it("lists `requires` parents before their children", () => {
    const seen = new Set<string>();
    for (const section of ADMIN_SECTIONS) {
      if (section.requires) expect(seen.has(section.requires), section.key).toBe(true);
      seen.add(section.key);
    }
  });

  it("includes owner in every default and keeps the permissions page locked", () => {
    for (const section of ADMIN_SECTIONS) {
      expect(section.defaultRoles, section.key).toContain("owner");
    }
    const permissions = ADMIN_SECTIONS.find((s) => s.key === "permissions");
    expect(permissions?.lock?.kind).toBe("fixed");
    expect([...(permissions?.defaultRoles ?? [])]).toEqual(["owner", "admin"]);
  });
});

describe("ROLE_UI_GROUPS", () => {
  it("lists every staff role exactly once", () => {
    const grouped = ROLE_UI_GROUPS.flatMap((group) => group.roles);
    expect([...grouped].sort()).toEqual([...STAFF_ROLES].sort());
    expect(new Set(grouped).size).toBe(grouped.length);
  });
});
