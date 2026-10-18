/** Typed fetch wrappers for /api/tasks. Client-safe. Throws Error(message) on failure. */
import type { Recurrence } from "./recurrence";
import type { ListView, MemberOption, TaskDetailDTO } from "./types";

async function call<T>(method: string, path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`/api/tasks${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });
  const json = (await res.json().catch(() => ({}))) as { data?: T; error?: string };
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json.data as T;
}

export type TaskFields = {
  title?: string;
  description?: string;
  assigneeId?: string | null;
  dueOn?: string | null;
  dueTime?: string | null;
  recurrence?: Recurrence | null;
  priority?: 1 | 2 | 3 | 4;
  sectionId?: string | null;
};

export const tasksApi = {
  createList: (input: { departmentKey: string; name: string; color?: string; defaultView?: ListView }) =>
    call<{ id: string }>("POST", "/lists", input),
  updateList: (listId: string, patch: { name?: string; color?: string; defaultView?: ListView; archived?: boolean }) =>
    call<{ id: string }>("PATCH", `/lists/${listId}`, patch),

  createSection: (listId: string, name: string) => call<{ id: string }>("POST", `/lists/${listId}/sections`, { name }),
  reorderSections: (listId: string, orderedIds: string[]) =>
    call<{ id: string }>("PUT", `/lists/${listId}/sections`, { orderedIds }),
  renameSection: (sectionId: string, name: string) => call<{ id: string }>("PATCH", `/sections/${sectionId}`, { name }),
  deleteSection: (sectionId: string) => call<{ id: string }>("DELETE", `/sections/${sectionId}`),

  moveTasks: (listId: string, sectionId: string | null, orderedIds: string[]) =>
    call<{ id: string }>("POST", `/lists/${listId}/move`, { sectionId, orderedIds }),

  createTask: (input: TaskFields & { listId: string; title: string; parentId?: string | null }) =>
    call<{ id: string }>("POST", "/items", input),
  getTask: (taskId: string, signal?: AbortSignal) => call<TaskDetailDTO>("GET", `/items/${taskId}`, undefined, signal),
  updateTask: (taskId: string, patch: TaskFields & { listId?: string }) =>
    call<{ id: string }>("PATCH", `/items/${taskId}`, patch),
  setCompleted: (taskId: string, completed: boolean) =>
    call<{ id: string; completed: boolean; nextDueOn?: string }>("POST", `/items/${taskId}/complete`, { completed }),
  deleteTask: (taskId: string) => call<{ id: string }>("DELETE", `/items/${taskId}`),

  addComment: (taskId: string, body: string) => call<{ id: string }>("POST", `/items/${taskId}/comments`, { body }),
  editComment: (commentId: string, body: string) => call<{ id: string }>("PATCH", `/comments/${commentId}`, { body }),
  deleteComment: (commentId: string) => call<{ id: string }>("DELETE", `/comments/${commentId}`),

  members: (listId: string, signal?: AbortSignal) =>
    call<MemberOption[]>("GET", `/members?listId=${encodeURIComponent(listId)}`, undefined, signal),

  actAs: (userId: string | null) =>
    userId ? call("POST", "/dev/act-as", { userId }) : call("DELETE", "/dev/act-as"),
};
