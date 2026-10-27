import { describe, expect, it } from "vitest";
import {
  DEFAULT_ACCESS_MAP,
  applyChanges,
  canEnterAdmin,
  hasSectionAccess,
  isCustomized,
  resolveAccessMap,
  sectionsForRoles,
  toOverrides,
} from "../resolve";
import { ADMIN_SECTIONS } from "../sections";

describe("resolveAccessMap", () => {
  it("falls back to defaults for empty or malformed documents", () => {
    for (const stored of [undefined, null, {}, [], "nope", 42]) {
      expect(resolveAccessMap(stored)).toEqual(DEFAULT_ACCESS_MAP);
    }
    expect(resolveAccessMap({ scheduling: "admin" })).toEqual(DEFAULT_ACCESS_MAP);
  });

  it("cleans stored roles: unknown and former staff dropped, owner added, sorted", () => {
    const map = resolveAccessMap({
      scheduling: ["helper", "nonsense", "former_staff", "admin", "helper", 7],
    });
    expect(map.scheduling).toEqual(["owner", "admin", "helper"]);
  });

  it("ignores unknown section keys", () => {
    const map = resolveAccessMap({ "made-up": ["helper"] });
    expect(map).toEqual(DEFAULT_ACCESS_MAP);
    expect(Object.keys(map)).toEqual(ADMIN_SECTIONS.map((s) => s.key));
  });

  it("keeps locked sections at their defaults", () => {
    const map = resolveAccessMap({
      permissions: ["helper"],
      blogs: ["helper"],
    });
    expect(map.permissions).toEqual(["owner", "admin"]);
    expect(map.blogs).toEqual(DEFAULT_ACCESS_MAP.blogs);
  });

  it("limits `requires` sections to roles that can open the parent", () => {
    const map = resolveAccessMap({
      scholarships: ["owner", "admin", "scholarship_staff"],
      "scholarship-team": ["owner", "admin", "scholarship_dep_head", "helper"],
    });
    expect(map["scholarship-team"]).toEqual(["owner", "admin"]);
  });

  it("can't remove owner", () => {
    expect(resolveAccessMap({ team: [] }).team).toEqual(["owner"]);
  });
});

describe("toOverrides", () => {
  it("is empty for the defaults", () => {
    expect(toOverrides(DEFAULT_ACCESS_MAP)).toEqual({});
  });

  it("stores only the changed sections and round-trips", () => {
    const map = applyChanges(DEFAULT_ACCESS_MAP, [
      { section: "scheduling", role: "senior_mod", granted: true },
      { section: "scholarships", role: "scholarship_dep_head", granted: false },
    ]);
    const overrides = toOverrides(map);
    expect(Object.keys(overrides).sort()).toEqual(
      ["scheduling", "scholarship-team", "scholarships"].sort(),
    );
    expect(resolveAccessMap(overrides)).toEqual(map);
  });
});

describe("applyChanges", () => {
  it("grants and revokes", () => {
    const map = applyChanges(DEFAULT_ACCESS_MAP, [
      { section: "qotd", role: "senior_mod", granted: true },
      { section: "qotd", role: "mod_dep_head", granted: false },
    ]);
    expect(map.qotd).toEqual(["owner", "admin", "senior_mod"]);
  });

  it("ignores owner removal, locked sections and unknown sections", () => {
    const map = applyChanges(DEFAULT_ACCESS_MAP, [
      { section: "team", role: "owner", granted: false },
      { section: "permissions", role: "helper", granted: true },
      { section: "blogs", role: "writer", granted: false },
      // @ts-expect-error unknown keys can arrive from a crafted request
      { section: "made-up", role: "helper", granted: true },
    ]);
    expect(map).toEqual(DEFAULT_ACCESS_MAP);
  });

  it("doesn't mutate its input", () => {
    const before = structuredClone(DEFAULT_ACCESS_MAP);
    applyChanges(DEFAULT_ACCESS_MAP, [{ section: "team", role: "helper", granted: true }]);
    expect(DEFAULT_ACCESS_MAP).toEqual(before);
  });
});

describe("access checks", () => {
  it("matches any role against any of the sections", () => {
    expect(hasSectionAccess(DEFAULT_ACCESS_MAP, ["writer"], "blogs")).toBe(true);
    expect(hasSectionAccess(DEFAULT_ACCESS_MAP, ["writer"], "all-blogs")).toBe(false);
    expect(hasSectionAccess(DEFAULT_ACCESS_MAP, ["writer"], ["all-blogs", "blogs"])).toBe(true);
    expect(hasSectionAccess(DEFAULT_ACCESS_MAP, ["helper", "writer"], "blogs")).toBe(true);
    expect(hasSectionAccess(DEFAULT_ACCESS_MAP, [], "blogs")).toBe(false);
    expect(hasSectionAccess(DEFAULT_ACCESS_MAP, undefined, "blogs")).toBe(false);
  });

  it("lists sections in sidebar order", () => {
    expect(sectionsForRoles(DEFAULT_ACCESS_MAP, ["writer_dep_head"])).toEqual([
      "blogs",
      "all-blogs",
      "writers",
      "forms",
    ]);
  });

  it("lets a newly granted role into /admin", () => {
    expect(canEnterAdmin(DEFAULT_ACCESS_MAP, ["senior_mod"])).toBe(false);
    const map = applyChanges(DEFAULT_ACCESS_MAP, [
      { section: "scheduling", role: "senior_mod", granted: true },
    ]);
    expect(canEnterAdmin(map, ["senior_mod"])).toBe(true);
  });
});

describe("isCustomized", () => {
  const map = applyChanges(DEFAULT_ACCESS_MAP, [
    { section: "scheduling", role: "senior_mod", granted: true },
  ]);

  it("is false everywhere for the defaults", () => {
    expect(isCustomized(DEFAULT_ACCESS_MAP, {})).toBe(false);
  });

  it("flags the changed section, role and cell only", () => {
    expect(isCustomized(map, {})).toBe(true);
    expect(isCustomized(map, { section: "scheduling" })).toBe(true);
    expect(isCustomized(map, { section: "qotd" })).toBe(false);
    expect(isCustomized(map, { role: "senior_mod" })).toBe(true);
    expect(isCustomized(map, { role: "admin" })).toBe(false);
    expect(isCustomized(map, { section: "scheduling", role: "senior_mod" })).toBe(true);
    expect(isCustomized(map, { section: "scheduling", role: "admin" })).toBe(false);
  });
});
