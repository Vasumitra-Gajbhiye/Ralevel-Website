import { describe, expect, it } from "vitest";
import type { Role } from "@/lib/roles";
import { departmentsForRoles, isHeadOf, isMemberRoleSet } from "../departments";
import {
  canActOnTask,
  canAssign,
  canClaim,
  canComment,
  canCompleteTask,
  canEditSubtask,
  canEditTask,
  canManageList,
  canModerateComment,
  canReview,
  canSubmitForReview,
  canUnclaim,
  canViewList,
  canViewTask,
  needsReview,
  permissionsFor,
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

const resourceHead = actor("maeve", "resource_dep_head");
const resourceStaff = actor("rstaff", "resource_staff");
const resourceStaff2 = actor("rstaff2", "resource_staff");

const moderation: ListScope = { kind: "department", departmentKey: "moderation", ownerId: null };
const resources: ListScope = { kind: "department", departmentKey: "resources", ownerId: null };
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

describe("claiming", () => {
  const open = task(resources, { claimable: true });

  it("any member can claim an open task; outsiders and former staff can't", () => {
    expect(canClaim(resourceStaff, open)).toBe(true);
    expect(canClaim(resourceHead, open)).toBe(true);
    expect(canClaim(admin, open)).toBe(true);
    expect(canClaim(writer, open)).toBe(false);
    expect(canClaim(former, open)).toBe(false);
  });

  it("only while it's claimable, unassigned, top-level and open", () => {
    expect(canClaim(resourceStaff, task(resources))).toBe(false);
    expect(canClaim(resourceStaff, { ...open, assigneeId: "rstaff2" })).toBe(false);
    expect(canClaim(resourceStaff, { ...open, isSubtask: true })).toBe(false);
    expect(canClaim(resourceStaff, { ...open, completed: true })).toBe(false);
    expect(canClaim(writer, task(inboxOf("writer"), { claimable: true }))).toBe(false);
  });

  it("the claimer can hand it back until it's submitted", () => {
    const claimed = { ...open, assigneeId: "rstaff" };
    expect(canUnclaim(resourceStaff, claimed)).toBe(true);
    expect(canUnclaim(resourceStaff2, claimed)).toBe(false);
    expect(canUnclaim(resourceStaff, { ...claimed, submissionState: "submitted" })).toBe(false);
    expect(canUnclaim(resourceStaff, { ...claimed, submissionState: "changes_requested" })).toBe(true);
    expect(canUnclaim(resourceStaff, { ...claimed, claimable: false })).toBe(false);
  });

  it("serializes claim rights for the UI", () => {
    expect(permissionsFor(resourceStaff, open).canClaim).toBe(true);
    expect(permissionsFor(writer, open).canClaim).toBe(false);
  });
});

describe("review", () => {
  const rewarded = task(resources, { stars: 2, assigneeId: "rstaff", claimable: true });

  it("a reward means review, except on subtasks and inbox tasks", () => {
    expect(needsReview(rewarded)).toBe(true);
    expect(needsReview(task(resources))).toBe(false);
    expect(needsReview({ ...rewarded, isSubtask: true })).toBe(false);
    expect(needsReview(task(inboxOf("writer"), { stars: 1 }))).toBe(false);
  });

  it("the assignee submits instead of completing", () => {
    expect(canSubmitForReview(resourceStaff, rewarded)).toBe(true);
    expect(canCompleteTask(resourceStaff, rewarded)).toBe(false);
    expect(canSubmitForReview(resourceStaff2, rewarded)).toBe(false);
    expect(canSubmitForReview(resourceStaff, { ...rewarded, submissionState: "submitted" })).toBe(false);
    expect(canSubmitForReview(resourceStaff, { ...rewarded, submissionState: "changes_requested" })).toBe(true);
    expect(canSubmitForReview(resourceStaff, { ...rewarded, stars: 0 })).toBe(false);
  });

  it("the assignee can still add and tick subtasks on a rewarded task", () => {
    expect(canActOnTask(resourceStaff, rewarded)).toBe(true);
    const sub = task(resources, { isSubtask: true, parentAssigneeId: "rstaff", stars: 0 });
    expect(canCompleteTask(resourceStaff, sub)).toBe(true);
  });

  it("heads approve, but never their own work; admins can", () => {
    expect(canReview(resourceHead, rewarded)).toBe(true);
    expect(canCompleteTask(resourceHead, rewarded)).toBe(true);
    expect(canReview(resourceStaff, rewarded)).toBe(false);
    expect(canReview(modHead, rewarded)).toBe(false);

    const headsOwn = { ...rewarded, assigneeId: "maeve" };
    expect(canReview(resourceHead, headsOwn)).toBe(false);
    expect(canCompleteTask(resourceHead, headsOwn)).toBe(false);
    expect(canSubmitForReview(resourceHead, headsOwn)).toBe(true);
    expect(canReview(admin, { ...rewarded, assigneeId: "admin" })).toBe(true);
  });

  it("only heads reopen an approved task", () => {
    const approved = { ...rewarded, completed: true, submissionState: "approved" as const };
    expect(canReview(resourceHead, approved)).toBe(false);
    expect(canCompleteTask(resourceHead, approved)).toBe(true);
    expect(canCompleteTask(resourceStaff, approved)).toBe(false);
  });

  it("tasks without a reward keep the old rules", () => {
    const plain = task(resources, { assigneeId: "rstaff" });
    expect(canCompleteTask(resourceStaff, plain)).toBe(true);
    expect(canReview(resourceHead, plain)).toBe(false);
    expect(canSubmitForReview(resourceStaff, plain)).toBe(false);
  });
});
