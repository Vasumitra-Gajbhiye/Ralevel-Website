/** List pages and department overviews. Server-only. */
import connectDB from "@/lib/mongodb";
import { istTodayKey } from "@/lib/tasks/dates";
import { getDepartment, isHeadOf, isMemberRoleSet, type DepartmentConfig } from "@/lib/tasks/departments";
import { canManageList, canViewList, type TasksActor } from "@/lib/tasks/permissions";
import {
  listScopeOf,
  resolveUsers,
  toListDTO,
  toSectionDTO,
  toTaskDTO,
  userIdsOf,
  type SectionDoc,
  type TaskDoc,
  type TaskListDoc,
} from "@/lib/tasks/serialize";
import type { SectionDTO, TaskDTO, TaskListDTO, UserLite } from "@/lib/tasks/types";
import Task from "@/models/task";
import TaskList from "@/models/taskList";
import TaskSection from "@/models/taskSection";
import { isValidObjectId, Types } from "mongoose";
import { subtaskStatsFor } from "./shared";

export type ListPageData = {
  list: TaskListDTO;
  sections: SectionDTO[];
  tasks: TaskDTO[];
  completed: TaskDTO[];
  completedCount: number;
  todayKey: string;
};

const COMPLETED_LIMIT = 100;

export async function getListDoc(listId: string): Promise<TaskListDoc | null> {
  if (!isValidObjectId(listId)) return null;
  await connectDB();
  return TaskList.findById(listId).lean<TaskListDoc>();
}

export async function getListPage(
  actor: TasksActor,
  listId: string,
  { showCompleted = false }: { showCompleted?: boolean } = {},
): Promise<ListPageData | null> {
  const list = await getListDoc(listId);
  if (!list || !canViewList(actor, listScopeOf(list))) return null;

  const [sections, open, completedCount, completedDocs] = await Promise.all([
    TaskSection.find({ listId: list._id }).sort({ order: 1, createdAt: 1 }).lean<SectionDoc[]>(),
    Task.find({ listId: list._id, parentId: null, completedAt: null })
      .sort({ order: 1, createdAt: 1 })
      .lean<TaskDoc[]>(),
    Task.countDocuments({ listId: list._id, parentId: null, completedAt: { $ne: null } }),
    showCompleted
      ? Task.find({ listId: list._id, parentId: null, completedAt: { $ne: null } })
          .sort({ completedAt: -1 })
          .limit(COMPLETED_LIMIT)
          .lean<TaskDoc[]>()
      : Promise.resolve([] as TaskDoc[]),
  ]);

  const all = [...open, ...completedDocs];
  const [users, subtaskStats] = await Promise.all([
    resolveUsers(userIdsOf(all)),
    subtaskStatsFor(all.map((t) => t._id)),
  ]);
  const ctx = { actor, users, subtaskStats };

  return {
    list: toListDTO(list, canManageList(actor, listScopeOf(list))),
    sections: sections.map(toSectionDTO),
    tasks: open.map((t) => toTaskDTO(t, ctx)),
    completed: completedDocs.map((t) => toTaskDTO(t, ctx)),
    completedCount,
    todayKey: istTodayKey(),
  };
}

export type DepartmentListRow = {
  id: string;
  name: string;
  color: string;
  openCount: number;
  overdueCount: number;
  archived: boolean;
};

export type DepartmentPersonRow = {
  user: UserLite;
  open: number;
  overdue: number;
  doneThisWeek: number;
};

export type DepartmentPageData = {
  department: Pick<DepartmentConfig, "key" | "name" | "color">;
  canManage: boolean;
  lists: DepartmentListRow[];
  archived: DepartmentListRow[];
  people: DepartmentPersonRow[];
  unassignedOpen: number;
};

export async function getDepartmentPage(actor: TasksActor, key: string): Promise<DepartmentPageData | null> {
  const dept = getDepartment(key);
  if (!dept || !isMemberRoleSet(actor.roles, key)) return null;
  await connectDB();

  const canManage = isHeadOf(actor.roles, key);
  const todayKey = istTodayKey();
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);

  const lists = await TaskList.find({ kind: "department", departmentKey: key, ...(canManage ? {} : { archivedAt: null }) })
    .sort({ order: 1, createdAt: 1 })
    .lean<TaskListDoc[]>();

  const [listCounts, peopleCounts] = await Promise.all([
    Task.aggregate<{ _id: Types.ObjectId; open: number; overdue: number }>([
      { $match: { listId: { $in: lists.map((l) => l._id) }, parentId: null, completedAt: null } },
      {
        $group: {
          _id: "$listId",
          open: { $sum: 1 },
          overdue: { $sum: { $cond: [{ $and: [{ $ne: ["$dueOn", null] }, { $lt: ["$dueOn", todayKey] }] }, 1, 0] } },
        },
      },
    ]),
    canManage
      ? Task.aggregate<{ _id: Types.ObjectId | null; open: number; overdue: number; doneThisWeek: number }>([
          {
            $match: {
              departmentKey: key,
              parentId: null,
              $or: [{ completedAt: null }, { completedAt: { $gte: weekAgo } }],
            },
          },
          {
            $group: {
              _id: "$assigneeId",
              open: { $sum: { $cond: [{ $eq: ["$completedAt", null] }, 1, 0] } },
              overdue: {
                $sum: {
                  $cond: [
                    { $and: [{ $eq: ["$completedAt", null] }, { $ne: ["$dueOn", null] }, { $lt: ["$dueOn", todayKey] }] },
                    1,
                    0,
                  ],
                },
              },
              doneThisWeek: { $sum: { $cond: [{ $ne: ["$completedAt", null] }, 1, 0] } },
            },
          },
        ])
      : Promise.resolve([]),
  ]);

  const countOf = new Map(listCounts.map((r) => [String(r._id), r]));
  const toRow = (l: TaskListDoc): DepartmentListRow => ({
    id: String(l._id),
    name: l.name,
    color: l.color ?? "slate",
    openCount: countOf.get(String(l._id))?.open ?? 0,
    overdueCount: countOf.get(String(l._id))?.overdue ?? 0,
    archived: Boolean(l.archivedAt),
  });

  const assigned = peopleCounts.filter((r) => r._id);
  const users = await resolveUsers(assigned.map((r) => String(r._id)));
  const people = assigned
    .map((r) => {
      const user = users.get(String(r._id));
      return user ? { user, open: r.open, overdue: r.overdue, doneThisWeek: r.doneThisWeek } : null;
    })
    .filter((r): r is DepartmentPersonRow => r !== null)
    .sort((a, b) => b.overdue - a.overdue || b.open - a.open || a.user.name.localeCompare(b.user.name));

  return {
    department: { key: dept.key, name: dept.name, color: dept.color },
    canManage,
    lists: lists.filter((l) => !l.archivedAt).map(toRow),
    archived: lists.filter((l) => l.archivedAt).map(toRow),
    people,
    unassignedOpen: peopleCounts.find((r) => !r._id)?.open ?? 0,
  };
}

/** Lists the actor can add tasks to, for the global quick-add picker. */
export async function getWritableLists(actor: TasksActor, inboxId: string, departmentKeys: string[]) {
  await connectDB();
  const lists = await TaskList.find({
    $or: [{ _id: inboxId }, { kind: "department", departmentKey: { $in: departmentKeys }, archivedAt: null }],
  })
    .sort({ kind: -1, order: 1, createdAt: 1 })
    .lean<TaskListDoc[]>();
  return lists
    .filter((l) => canManageList(actor, listScopeOf(l)))
    .map((l) => ({
      id: String(l._id),
      name: l.name,
      color: l.color ?? "slate",
      kind: l.kind,
      departmentKey: l.departmentKey ?? null,
    }));
}
