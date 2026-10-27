/** List pages and department overviews. Server-only. */
import connectDB from "@/lib/mongodb";
import { isAdmin } from "@/lib/roles";
import { departmentStandings, type StarStanding } from "@/lib/tasks/awards";
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
import { serializeCrossListTasks, subtaskStatsFor } from "./shared";

export type ListPageData = {
  list: TaskListDTO;
  sections: SectionDTO[];
  tasks: TaskDTO[];
  completed: TaskDTO[];
  completedCount: number;
  todayKey: string;
};

const COMPLETED_LIMIT = 100;

const OPEN_TOP_LEVEL = { parentId: null, completedAt: null };

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
  stars: number;
  certificatesDue: number;
};

export type DepartmentPageData = {
  department: Pick<DepartmentConfig, "key" | "name" | "color">;
  canManage: boolean;
  /** Owners and admins mark certificates as issued. */
  canIssueCertificates: boolean;
  lists: DepartmentListRow[];
  archived: DepartmentListRow[];
  /** Open tasks anyone in the department can claim. */
  upForGrabs: TaskDTO[];
  /** Heads only: hand-ins waiting for approval, oldest first. */
  awaitingReview: TaskDTO[];
  people: DepartmentPersonRow[];
  /** Open tasks with no assignee that aren't up for grabs. */
  unassignedOpen: number;
  myStanding: StarStanding | null;
};

const UP_FOR_GRABS_LIMIT = 20;
const REVIEW_LIMIT = 50;

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
  const activeListIds = lists.filter((l) => !l.archivedAt).map((l) => l._id);

  const [listCounts, peopleCounts, grabDocs, reviewDocs, standings] = await Promise.all([
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
      ? Task.aggregate<{
          _id: Types.ObjectId | null;
          open: number;
          overdue: number;
          doneThisWeek: number;
          unclaimable: number;
        }>([
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
              unclaimable: {
                $sum: { $cond: [{ $and: [{ $eq: ["$completedAt", null] }, { $ne: ["$claimable", true] }] }, 1, 0] },
              },
            },
          },
        ])
      : Promise.resolve([]),
    Task.find({ listId: { $in: activeListIds }, claimable: true, assigneeId: null, ...OPEN_TOP_LEVEL })
      .sort({ dueOn: 1, priority: 1, createdAt: 1 })
      .limit(UP_FOR_GRABS_LIMIT)
      .lean<TaskDoc[]>(),
    canManage
      ? Task.find({ departmentKey: key, "submission.state": "submitted", ...OPEN_TOP_LEVEL })
          .sort({ "submission.at": 1 })
          .limit(REVIEW_LIMIT)
          .lean<TaskDoc[]>()
      : Promise.resolve([] as TaskDoc[]),
    departmentStandings(key),
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

  // Heads see everyone with recent tasks or any stars.
  const countsBy = new Map(peopleCounts.filter((r) => r._id).map((r) => [String(r._id), r]));
  const personIds = canManage ? [...new Set([...countsBy.keys(), ...standings.keys()])] : [];
  const [users, upForGrabs, awaitingReview] = await Promise.all([
    resolveUsers(personIds),
    serializeCrossListTasks(actor, grabDocs),
    serializeCrossListTasks(actor, reviewDocs),
  ]);
  const people = personIds
    .map((id): DepartmentPersonRow | null => {
      const user = users.get(id);
      if (!user) return null;
      const counts = countsBy.get(id);
      const standing = standings.get(id);
      return {
        user,
        open: counts?.open ?? 0,
        overdue: counts?.overdue ?? 0,
        doneThisWeek: counts?.doneThisWeek ?? 0,
        stars: standing?.stars ?? 0,
        certificatesDue: standing?.due ?? 0,
      };
    })
    .filter((r): r is DepartmentPersonRow => r !== null)
    .sort(
      (a, b) =>
        b.certificatesDue - a.certificatesDue ||
        b.overdue - a.overdue ||
        b.open - a.open ||
        b.stars - a.stars ||
        a.user.name.localeCompare(b.user.name),
    );

  const submittedAt = (t: TaskDTO) => t.submission?.at ?? "";
  return {
    department: { key: dept.key, name: dept.name, color: dept.color },
    canManage,
    canIssueCertificates: isAdmin(actor.roles),
    lists: lists.filter((l) => !l.archivedAt).map(toRow),
    archived: lists.filter((l) => l.archivedAt).map(toRow),
    upForGrabs,
    awaitingReview: awaitingReview.sort((a, b) => submittedAt(a).localeCompare(submittedAt(b))),
    people,
    unassignedOpen: peopleCounts.find((r) => !r._id)?.unclaimable ?? 0,
    myStanding: standings.get(actor.id) ?? null,
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
