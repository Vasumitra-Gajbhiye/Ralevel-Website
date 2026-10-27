import { describe, expect, it } from "vitest";
import {
  MANY_PEOPLE_THRESHOLD,
  copyRoleAccess,
  countAffectedByChange,
  countAffectedPeople,
  describeChange,
  diffAccessMaps,
  resetRole,
  resetSection,
  riskWarnings,
  type RoleCombo,
} from "../diff";
import { DEFAULT_ACCESS_MAP, applyChanges, isCustomized } from "../resolve";

const grant = (
  section: Parameters<typeof applyChanges>[1][number]["section"],
  role: Parameters<typeof applyChanges>[1][number]["role"],
  granted = true,
) => ({ section, role, granted });

describe("diffAccessMaps", () => {
  it("is empty for identical maps", () => {
    expect(diffAccessMaps(DEFAULT_ACCESS_MAP, DEFAULT_ACCESS_MAP)).toEqual([]);
  });

  it("round-trips through applyChanges", () => {
    const after = applyChanges(DEFAULT_ACCESS_MAP, [
      grant("scheduling", "senior_mod"),
      grant("qotd", "mod_dep_head", false),
      grant("legal", "info_dep_head"),
    ]);
    const changes = diffAccessMaps(DEFAULT_ACCESS_MAP, after);
    expect(applyChanges(DEFAULT_ACCESS_MAP, changes)).toEqual(after);
  });

  it("sorts by role rank, then sidebar order", () => {
    const after = applyChanges(DEFAULT_ACCESS_MAP, [
      grant("scheduling", "senior_mod"),
      grant("qotd", "mod_dep_head", false),
      grant("legal", "mod_dep_head"),
    ]);
    expect(diffAccessMaps(DEFAULT_ACCESS_MAP, after)).toEqual([
      grant("legal", "mod_dep_head"),
      grant("qotd", "mod_dep_head", false),
      grant("scheduling", "senior_mod"),
    ]);
  });

  it("includes `requires` knock-on changes", () => {
    const after = applyChanges(DEFAULT_ACCESS_MAP, [
      grant("scholarships", "scholarship_dep_head", false),
    ]);
    expect(diffAccessMaps(DEFAULT_ACCESS_MAP, after)).toEqual([
      grant("scholarships", "scholarship_dep_head", false),
      grant("scholarship-team", "scholarship_dep_head", false),
    ]);
  });
});

describe("describeChange", () => {
  it("reads as a plain sentence", () => {
    expect(describeChange(grant("scheduling", "writer_dep_head"))).toBe(
      "Writer Dep. Head can now open Scheduling",
    );
    expect(describeChange(grant("qotd", "mod_dep_head", false))).toBe(
      "MOD Dep. Head can no longer open Discord QOTD",
    );
  });
});

describe("affected counts", () => {
  const combos: RoleCombo[] = [
    { roles: ["info_dep_head", "informative_team"], count: 2 },
    { roles: ["info_dep_head"], count: 3 },
    { roles: ["helper"], count: 40 },
  ];

  it("only counts people whose access actually flips", () => {
    const change = grant("scheduling", "info_dep_head", false);
    const after = applyChanges(DEFAULT_ACCESS_MAP, [change]);
    // The two Community Team members keep Scheduling through that role.
    expect(countAffectedByChange(combos, DEFAULT_ACCESS_MAP, after, change)).toBe(3);
    expect(countAffectedPeople(combos, DEFAULT_ACCESS_MAP, after)).toBe(3);
  });

  it("is zero when everyone already has access another way", () => {
    const change = grant("scheduling", "informative_team", false);
    const after = applyChanges(DEFAULT_ACCESS_MAP, [change]);
    const onlyBoth = combos.slice(0, 1);
    expect(countAffectedByChange(onlyBoth, DEFAULT_ACCESS_MAP, after, change)).toBe(0);
  });
});

describe("riskWarnings", () => {
  const combos: RoleCombo[] = [{ roles: ["helper"], count: MANY_PEOPLE_THRESHOLD + 1 }];

  it("flags risky pages given to non-admin roles", () => {
    const after = applyChanges(DEFAULT_ACCESS_MAP, [grant("access", "mod_dep_head")]);
    const warnings = riskWarnings({
      before: DEFAULT_ACCESS_MAP,
      after,
      actorRoles: ["admin"],
      combos: [],
    });
    expect(warnings).toEqual([
      {
        kind: "risky-grant",
        message: "With Access, MOD Dep. Head can change other people's staff roles.",
      },
    ]);
  });

  it("doesn't flag safe pages", () => {
    const after = applyChanges(DEFAULT_ACCESS_MAP, [grant("legal", "mod_dep_head")]);
    expect(
      riskWarnings({ before: DEFAULT_ACCESS_MAP, after, actorRoles: ["admin"], combos: [] }),
    ).toEqual([]);
  });

  it("warns editors who are about to lose pages themselves", () => {
    const after = applyChanges(DEFAULT_ACCESS_MAP, [
      grant("legal", "admin", false),
      grant("team", "admin", false),
    ]);
    const warnings = riskWarnings({
      before: DEFAULT_ACCESS_MAP,
      after,
      actorRoles: ["admin"],
      combos: [],
    });
    expect(warnings).toEqual([
      { kind: "self-loss", message: "You will lose access to Team and Legal pages." },
    ]);
  });

  it("doesn't warn an owner, who keeps every page", () => {
    const after = applyChanges(DEFAULT_ACCESS_MAP, [grant("legal", "admin", false)]);
    expect(
      riskWarnings({ before: DEFAULT_ACCESS_MAP, after, actorRoles: ["owner", "admin"], combos: [] }),
    ).toEqual([]);
  });

  it("warns when many people are affected", () => {
    const after = applyChanges(DEFAULT_ACCESS_MAP, [grant("legal", "helper")]);
    const warnings = riskWarnings({
      before: DEFAULT_ACCESS_MAP,
      after,
      actorRoles: ["admin"],
      combos,
    });
    expect(warnings.map((w) => w.kind)).toEqual(["many-people"]);
    expect(warnings[0].message).toBe(
      `This changes page access for ${MANY_PEOPLE_THRESHOLD + 1} people.`,
    );
  });
});

describe("copy and reset", () => {
  it("copies a role's editable pages onto another role", () => {
    const map = copyRoleAccess(DEFAULT_ACCESS_MAP, "mod_dep_head", "info_dep_head");
    expect(map.qotd).toContain("info_dep_head");
    expect(map.scheduling).not.toContain("info_dep_head");
    expect(map.forms).toContain("info_dep_head");
    // Locked pages are untouched.
    expect(map.blogs).toEqual(DEFAULT_ACCESS_MAP.blogs);
  });

  it("can't strip owner by copying", () => {
    const map = copyRoleAccess(DEFAULT_ACCESS_MAP, "helper", "owner");
    expect(map).toEqual(DEFAULT_ACCESS_MAP);
  });

  it("resets one role without touching others", () => {
    const changed = applyChanges(DEFAULT_ACCESS_MAP, [
      grant("legal", "helper"),
      grant("team", "senior_mod"),
    ]);
    const reset = resetRole(changed, "helper");
    expect(isCustomized(reset, { role: "helper" })).toBe(false);
    expect(reset.team).toContain("senior_mod");
  });

  it("resets one section without touching others", () => {
    const changed = applyChanges(DEFAULT_ACCESS_MAP, [
      grant("legal", "helper"),
      grant("team", "helper"),
    ]);
    const reset = resetSection(changed, "legal");
    expect(reset.legal).toEqual(DEFAULT_ACCESS_MAP.legal);
    expect(reset.team).toContain("helper");
  });
});
