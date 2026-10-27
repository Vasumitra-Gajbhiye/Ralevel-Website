import { canModifyTargetUser } from "@/lib/roles";
import { scheduleItemPatchSchema } from "@/lib/validation/scheduling";
import { describe, expect, it } from "vitest";

const ID = "64b7f0c2a1b2c3d4e5f60718";

describe("canModifyTargetUser", () => {
  it("lets owners and admins edit anyone (unchanged behavior)", () => {
    expect(canModifyTargetUser(["admin"], ["admin"])).toBe(true);
    expect(canModifyTargetUser(["owner"], ["admin", "mod_dep_head"])).toBe(true);
  });

  it("only lets other roles edit users ranked strictly below them", () => {
    expect(canModifyTargetUser(["mod_dep_head"], ["senior_mod"])).toBe(true);
    expect(canModifyTargetUser(["mod_dep_head"], ["helper", "admin"])).toBe(false);
    expect(canModifyTargetUser(["mod_dep_head"], ["mod_dep_head"])).toBe(false);
    expect(canModifyTargetUser(["info_dep_head"], ["helper_dep_head"])).toBe(false);
  });

  it("allows users with no roles yet, denies actors with none", () => {
    expect(canModifyTargetUser(["mod_dep_head"], [])).toBe(true);
    expect(canModifyTargetUser([], ["helper"])).toBe(false);
  });
});

describe("scheduleItemPatchSchema", () => {
  it("accepts the fields the scheduling table sends", () => {
    const ok = scheduleItemPatchSchema.safeParse({
      id: ID,
      patch: { date: new Date("2026-10-26").toISOString(), status: "ongoing" },
    });
    expect(ok.success).toBe(true);
    expect(
      scheduleItemPatchSchema.safeParse({ id: ID, patch: { date: null } }).success,
    ).toBe(true);
  });

  it("rejects unknown fields, bad enums and bad ids", () => {
    expect(
      scheduleItemPatchSchema.safeParse({ id: ID, patch: { createdAt: "x" } }).success,
    ).toBe(false);
    expect(
      scheduleItemPatchSchema.safeParse({ id: ID, patch: { status: "done" } }).success,
    ).toBe(false);
    expect(
      scheduleItemPatchSchema.safeParse({ id: "nope", patch: {} }).success,
    ).toBe(false);
    expect(
      scheduleItemPatchSchema.safeParse({ id: ID, patch: { $where: "1" } }).success,
    ).toBe(false);
  });
});
