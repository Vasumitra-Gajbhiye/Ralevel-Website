/** Client-safe DTOs for the /tasks workspace. */
import type { TaskPerms } from "./permissions";
import type { Recurrence } from "./recurrence";

export type UserLite = {
  id: string;
  name: string;
  nickname: string | null;
  avatar: string | null;
};

export type ListKind = "inbox" | "department";
export type ListView = "list" | "board";

export type TaskListDTO = {
  id: string;
  kind: ListKind;
  departmentKey: string | null;
  name: string;
  color: string;
  defaultView: ListView;
  archived: boolean;
  canManage: boolean;
};

export type SectionDTO = {
  id: string;
  listId: string;
  name: string;
  order: number;
};

export type TaskListRef = { id: string; name: string; color: string; kind: ListKind; departmentKey: string | null };

export type TaskDTO = {
  id: string;
  listId: string;
  sectionId: string | null;
  parentId: string | null;
  departmentKey: string | null;
  title: string;
  description: string;
  assignee: UserLite | null;
  dueOn: string | null;
  /** IST wall-clock "HH:mm" when a time is set. */
  dueTime: string | null;
  dueAt: string | null;
  recurrence: Recurrence | null;
  priority: 1 | 2 | 3 | 4;
  order: number;
  completedAt: string | null;
  commentCount: number;
  subtaskCount: number;
  subtaskDone: number;
  createdById: string | null;
  perms: TaskPerms;
  /** Present in cross-list views (Today, Upcoming, My Tasks). */
  list?: TaskListRef;
};

export type CommentDTO = {
  id: string;
  author: UserLite | null;
  body: string;
  createdAt: string;
  editedAt: string | null;
  canModerate: boolean;
  isMine: boolean;
};

export type ActivityDTO = {
  id: string;
  actor: UserLite | null;
  type: string;
  data: Record<string, unknown>;
  createdAt: string;
};

export type SubtaskDTO = TaskDTO & { canEditTitle: boolean };

export type TaskDetailDTO = {
  task: TaskDTO;
  list: TaskListRef;
  sections: SectionDTO[];
  subtasks: SubtaskDTO[];
  comments: CommentDTO[];
  activity: ActivityDTO[];
  canAddSubtask: boolean;
  canAssign: boolean;
  /** False for an assignee from outside the list's department. */
  canViewList: boolean;
};

export type SidebarList = { id: string; name: string; color: string; openCount: number };

export type SidebarDepartment = {
  key: string;
  name: string;
  color: string;
  canManage: boolean;
  lists: SidebarList[];
};

export type SidebarData = {
  inbox: { id: string; openCount: number };
  counts: { today: number; overdue: number; upcoming: number; my: number };
  departments: SidebarDepartment[];
};

export type MemberOption = UserLite & { inDepartment: boolean };

export type TasksViewer = {
  id: string;
  name: string;
  isAdmin: boolean;
  canAccessAdmin: boolean;
  impersonating: boolean;
};
