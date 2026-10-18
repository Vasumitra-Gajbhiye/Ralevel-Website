/**
 * Who can do what in /tasks. Pure functions, shared by the API and the UI.
 *
 * - Inbox lists are private to their owner, who can do everything in them.
 * - Department lists: every member can view; heads (and admins) manage lists,
 *   sections and tasks; the assignee of a task can complete it, comment, and
 *   add or tick off subtasks.
 */
import { isAdmin, isStaff, type Role } from "@/lib/roles";
import { isHeadOf, isMemberRoleSet } from "./departments";

export type TasksActor = { id: string; roles: Role[] };

export type ListScope = {
  kind: "inbox" | "department";
  departmentKey: string | null;
  ownerId: string | null;
};

export type TaskScope = ListScope & {
  assigneeId: string | null;
  createdBy?: string | null;
  /** Set for subtasks: the parent task's assignee. */
  parentAssigneeId?: string | null;
};

const isInbox = (scope: ListScope) => scope.kind === "inbox";

export function canViewList(actor: TasksActor, scope: ListScope): boolean {
  if (!isStaff(actor.roles)) return false;
  if (isInbox(scope)) return scope.ownerId === actor.id;
  return Boolean(scope.departmentKey && isMemberRoleSet(actor.roles, scope.departmentKey));
}

/** Create, rename and archive lists and sections; create, edit, move and delete tasks. */
export function canManageList(actor: TasksActor, scope: ListScope): boolean {
  if (!isStaff(actor.roles)) return false;
  if (isInbox(scope)) return scope.ownerId === actor.id;
  return Boolean(scope.departmentKey && isHeadOf(actor.roles, scope.departmentKey));
}

function isAssignee(actor: TasksActor, task: TaskScope): boolean {
  return (
    (task.assigneeId !== null && task.assigneeId === actor.id) ||
    (task.parentAssigneeId != null && task.parentAssigneeId === actor.id)
  );
}

export function canViewTask(actor: TasksActor, task: TaskScope): boolean {
  if (!isStaff(actor.roles)) return false;
  return canViewList(actor, task) || (!isInbox(task) && isAssignee(actor, task));
}

export function canEditTask(actor: TasksActor, task: TaskScope): boolean {
  return canManageList(actor, task);
}

/** Complete/uncomplete, add subtasks, tick off subtasks. */
export function canActOnTask(actor: TasksActor, task: TaskScope): boolean {
  if (canEditTask(actor, task)) return true;
  return isStaff(actor.roles) && !isInbox(task) && isAssignee(actor, task);
}

/** Rename or delete a subtask: managers, or the assignee for subtasks they added. */
export function canEditSubtask(actor: TasksActor, subtask: TaskScope): boolean {
  if (canEditTask(actor, subtask)) return true;
  return (
    isStaff(actor.roles) &&
    subtask.parentAssigneeId != null &&
    subtask.parentAssigneeId === actor.id &&
    subtask.createdBy === actor.id
  );
}

export function canComment(actor: TasksActor, task: TaskScope): boolean {
  return canViewTask(actor, task);
}

export function canModerateComment(
  actor: TasksActor,
  task: TaskScope,
  authorId: string,
): boolean {
  return (authorId === actor.id && canViewTask(actor, task)) || canEditTask(actor, task);
}

/**
 * Whether the actor may assign a task in `scope` to someone with
 * `assigneeRoles`. Inbox tasks are never assigned; admins can assign any staff;
 * heads only members of the list's department.
 */
export function canAssign(
  actor: TasksActor,
  scope: ListScope,
  assigneeRoles: Role[] | undefined,
): boolean {
  if (isInbox(scope) || !scope.departmentKey) return false;
  if (!canManageList(actor, scope)) return false;
  if (!isStaff(assigneeRoles)) return false;
  if (isAdmin(actor.roles)) return true;
  return isMemberRoleSet(assigneeRoles, scope.departmentKey);
}

export type TaskPerms = { canEdit: boolean; canAct: boolean; canComment: boolean };

export function permissionsFor(actor: TasksActor, task: TaskScope): TaskPerms {
  return {
    canEdit: canEditTask(actor, task),
    canAct: canActOnTask(actor, task),
    canComment: canComment(actor, task),
  };
}
