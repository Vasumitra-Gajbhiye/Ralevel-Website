import { describe, expect, it } from "vitest";
import type { Role } from "@/lib/roles";
import { departmentsForRoles, isHeadOf, isMemberRoleSet } from "../departments";
import {
  canActOnTask,
  canAssign,
  canComment,
  canEditSubtask,
  canEditTask,
  canManageList,
  canModerateComment,
  canViewList,
  canViewTask,
  type ListScope,
  type TaskScope,
  type TasksActor,
} from "../permissions";

const actor = (id: string, ...roles: Role[]): TasksActor => ({ id, roles });

const owner = actor("owner", "owner");
const admin = actor("admin", "admin");
const modHead = actor("modhead", "mod_dep_head");
const juniorMod = actor("jmod", "junior_mod");
const seniorMod = actor("smod", "senior_mod");
const writer = actor("writer", "writer");
const botDev = actor("botdev", "bot_dev");
const redditHead = actor("reddit", "reddit_dep_head");
const former = actor("former", "former_staff");
const nobody = actor("nobody");

const moderation: ListScope = { kind: "department", departmentKey: "moderation", ownerId: null };
const general: ListScope = { kind: "department", departmentKey: "general", ownerId: null };
const botdevList: ListScope = { kind: "department", departmentKey: "botdev", ownerId: null };
const inboxOf = (id: string): ListScope => ({ kind: "inbox", departmentKey: null, ownerId: id });

const task = (scope: ListScope, extra: Partial<TaskScope> = {}): TaskScope => ({
  ...scope,
  assigneeId: null,
  ...extra,
});

describe("departments", () => {
  it("admins belong to and head every department", () => {
    expect(departmentsForRoles(["admin"]).length).toBeGreaterThan(5);
    expect(isHeadOf(["owner"], "botdev")).toBe(true);
    expect(isHeadOf(["admin"], "reddit")).toBe(true);
  });

  it("staff see their departments plus General", () => {
    expect(departmentsForRoles(["junior_mod"]).map((d) => d.key)).toEqual(["general", "moderation"]);
    expect(departmentsForRoles(["writer", "helper"]).map((d) => d.key)).toEqual(["general", "helpers", "writers"]);
    expect(departmentsForRoles(["bot_dev"]).map((d) => d.key)).toEqual(["general", "botdev"]);
  });

  it("former staff and users without roles get nothing", () => {
    expect(departmentsForRoles(["former_staff"])).toEqual([]);
    expect(departmentsForRoles([])).toEqual([]);
    expect(isMemberRoleSet(["former_staff"], "general")).toBe(false);
  });

  it("General and Bot Dev have no head role besides admins", () => {
    expect(isHeadOf(["mod_dep_head"], "general")).toBe(false);
    expect(isHeadOf(["bot_dev"], "botdev")).toBe(false);
  });

  it("Reddit's head is its only member", () => {
    expect(isMemberRoleSet(["reddit_dep_head"], "reddit")).toBe(true);
    expect(isHeadOf(["reddit_dep_head"], "reddit")).toBe(true);
    expect(isMemberRoleSet(["junior_mod"], "reddit")).toBe(false);
  });
});

describe("lists", () => {
  it("department members can view, only heads and admins manage", () => {
    expect(canViewList(juniorMod, moderation)).toBe(true);
    expect(canManageList(juniorMod, moderation)).toBe(false);
    expect(canManageList(modHead, moderation)).toBe(true);
    expect(canManageList(admin, moderation)).toBe(true);
    expect(canViewList(writer, moderation)).toBe(false);
  });

  it("General is visible to all staff but managed only by admins", () => {
    expect(canViewList(writer, general)).toBe(true);
    expect(canViewList(botDev, general)).toBe(true);
    expect(canManageList(modHead, general)).toBe(false);
    expect(canManageList(owner, general)).toBe(true);
  });

  it("Bot Dev is managed by admins only", () => {
    expect(canViewList(botDev, botdevList)).toBe(true);
    expect(canManageList(botDev, botdevList)).toBe(false);
    expect(canManageList(admin, botdevList)).toBe(true);
  });

  it("inboxes are private, even from admins", () => {
    expect(canViewList(writer, inboxOf("writer"))).toBe(true);
    expect(canManageList(writer, inboxOf("writer"))).toBe(true);
    expect(canViewList(owner, inboxOf("writer"))).toBe(false);
    expect(canManageList(admin, inboxOf("writer"))).toBe(false);
  });

  it("former staff and non-staff are locked out, even of their own inbox", () => {
    expect(canViewList(former, general)).toBe(false);
    expect(canViewList(former, inboxOf("former"))).toBe(false);
    expect(canViewList(nobody, inboxOf("nobody"))).toBe(false);
  });
});

describe("tasks", () => {
  const assignedToJunior = task(moderation, { assigneeId: "jmod" });

  it("assignees can act but not edit", () => {
    expect(canActOnTask(juniorMod, assignedToJunior)).toBe(true);
    expect(canEditTask(juniorMod, assignedToJunior)).toBe(false);
    expect(canActOnTask(seniorMod, assignedToJunior)).toBe(false);
    expect(canViewTask(seniorMod, assignedToJunior)).toBe(true);
  });

  it("heads can edit and act on any task in their department", () => {
    expect(canEditTask(modHead, assignedToJunior)).toBe(true);
    expect(canActOnTask(modHead, assignedToJunior)).toBe(true);
    expect(canEditTask(modHead, task(general))).toBe(false);
  });

  it("an assignee outside the department can still see and act on their task", () => {
    const writerTask = task(moderation, { assigneeId: "writer" });
    expect(canViewTask(writer, writerTask)).toBe(true);
    expect(canActOnTask(writer, writerTask)).toBe(true);
    expect(canComment(writer, writerTask)).toBe(true);
    expect(canViewTask(writer, task(moderation))).toBe(false);
  });

  it("subtasks inherit the parent's assignee", () => {
    const sub = task(moderation, { parentAssigneeId: "jmod", createdBy: "jmod" });
    expect(canActOnTask(juniorMod, sub)).toBe(true);
    expect(canEditSubtask(juniorMod, sub)).toBe(true);
    const headsSub = { ...sub, createdBy: "modhead" };
    expect(canEditSubtask(juniorMod, headsSub)).toBe(false);
    expect(canEditSubtask(modHead, headsSub)).toBe(true);
  });

  it("anyone who can view can comment; authors and managers moderate", () => {
    expect(canComment(seniorMod, task(moderation))).toBe(true);
    expect(canComment(writer, task(moderation))).toBe(false);
    expect(canModerateComment(seniorMod, task(moderation), "smod")).toBe(true);
    expect(canModerateComment(seniorMod, task(moderation), "jmod")).toBe(false);
    expect(canModerateComment(modHead, task(moderation), "jmod")).toBe(true);
  });

  it("former staff lose access to tasks still assigned to them", () => {
    const formerTask = task(moderation, { assigneeId: "former" });
    expect(canViewTask(former, formerTask)).toBe(false);
    expect(canActOnTask(former, formerTask)).toBe(false);
  });

  it("inbox tasks never leak through assignment", () => {
    const inboxTask = task(inboxOf("writer"), { assigneeId: "jmod" });
    expect(canViewTask(juniorMod, inboxTask)).toBe(false);
    expect(canActOnTask(juniorMod, inboxTask)).toBe(false);
  });
});

describe("assignment", () => {
  it("heads assign only within their department", () => {
    expect(canAssign(modHead, moderation, ["junior_mod"])).toBe(true);
    expect(canAssign(modHead, moderation, ["mod_dep_head"])).toBe(true);
    expect(canAssign(modHead, moderation, ["writer"])).toBe(false);
  });

  it("admins assign any staff anywhere", () => {
    expect(canAssign(admin, moderation, ["writer"])).toBe(true);
    expect(canAssign(owner, botdevList, ["helper"])).toBe(true);
  });

  it("nobody assigns former staff, inbox tasks, or without managing the list", () => {
    expect(canAssign(admin, moderation, ["former_staff"])).toBe(false);
    expect(canAssign(admin, moderation, [])).toBe(false);
    expect(canAssign(writer, inboxOf("writer"), ["writer"])).toBe(false);
    expect(canAssign(juniorMod, moderation, ["junior_mod"])).toBe(false);
    expect(canAssign(redditHead, moderation, ["junior_mod"])).toBe(false);
  });
});
