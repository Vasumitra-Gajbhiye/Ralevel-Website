/** Sidebar and the cross-list views (Today, Upcoming, My Tasks). Server-only. */
import connectDB from "@/lib/mongodb";
import { personStandings } from "@/lib/tasks/awards";
import { addDays, istTodayKey } from "@/lib/tasks/dates";
import { departmentsForRoles, isHeadOf } from "@/lib/tasks/departments";
import type { TasksActor } from "@/lib/tasks/permissions";
import type { TaskDoc, TaskListDoc } from "@/lib/tasks/serialize";
import { starsTowardNext } from "@/lib/tasks/stars";
import type { SidebarData, TaskDTO } from "@/lib/tasks/types";
import Task from "@/models/task";
import TaskList from "@/models/taskList";
import { Types } from "mongoose";
import { serializeCrossListTasks } from "./shared";

export const UPCOMING_DAYS = 14;

const openTopLevel = { parentId: null, completedAt: null };

const mine = (actor: TasksActor) => ({ $or: [{ ownerId: actor.id }, { assigneeId: actor.id }] });

export async function getSidebarData(actor: TasksActor, inboxId: string): Promise<SidebarData> {
  await connectDB();
  const departments = departmentsForRoles(actor.roles);
  const today = istTodayKey();

  const lists = await TaskList.find({
    kind: "department",
    departmentKey: { $in: departments.map((d) => d.key) },
    archivedAt: null,
  })
    .sort({ order: 1, createdAt: 1 })
    .lean<TaskListDoc[]>();

  const listIds = [...lists.map((l) => l._id), new Types.ObjectId(inboxId)];
  const [openCounts, overdue, todayCount, upcoming, my] = await Promise.all([
    Task.aggregate<{ _id: Types.ObjectId; n: number }>([
      { $match: { listId: { $in: listIds }, ...openTopLevel } },
      { $group: { _id: "$listId", n: { $sum: 1 } } },
    ]),
    Task.countDocuments({ ...mine(actor), ...openTopLevel, dueOn: { $lt: today } }),
    Task.countDocuments({ ...mine(actor), ...openTopLevel, dueOn: today }),
    Task.countDocuments({
      ...mine(actor),
      ...openTopLevel,
      dueOn: { $gt: today, $lt: addDays(today, UPCOMING_DAYS) },
    }),
    Task.countDocuments({ assigneeId: actor.id, ...openTopLevel }),
  ]);
  const countOf = new Map(openCounts.map((r) => [String(r._id), r.n]));

  return {
    inbox: { id: inboxId, openCount: countOf.get(inboxId) ?? 0 },
    counts: { today: todayCount, overdue, upcoming, my },
    departments: departments.map((d) => ({
      key: d.key,
      name: d.name,
      color: d.color,
      canManage: isHeadOf(actor.roles, d.key),
      lists: lists
        .filter((l) => l.departmentKey === d.key)
        .map((l) => ({
          id: String(l._id),
          name: l.name,
          color: l.color ?? "slate",
          openCount: countOf.get(String(l._id)) ?? 0,
        })),
    })),
  };
}

export async function getTodayView(actor: TasksActor) {
  await connectDB();
  const todayKey = istTodayKey();
  const docs = await Task.find({ ...mine(actor), ...openTopLevel, dueOn: { $lte: todayKey } })
    .limit(500)
    .lean<TaskDoc[]>();
  const tasks = await serializeCrossListTasks(actor, docs);
  return {
    todayKey,
    overdue: tasks.filter((t) => t.dueOn! < todayKey),
    today: tasks.filter((t) => t.dueOn === todayKey),
  };
}

export async function getUpcomingView(actor: TasksActor) {
  await connectDB();
  const todayKey = istTodayKey();
  const endKey = addDays(todayKey, UPCOMING_DAYS);
  const docs = await Task.find({ ...mine(actor), ...openTopLevel, dueOn: { $ne: null, $lt: endKey } })
    .limit(1000)
    .lean<TaskDoc[]>();
  const tasks = await serializeCrossListTasks(actor, docs);
  const days = Array.from({ length: UPCOMING_DAYS }, (_, i) => {
    const key = addDays(todayKey, i);
    return { key, tasks: tasks.filter((t) => t.dueOn === key) };
  });
  return { todayKey, overdue: tasks.filter((t) => t.dueOn! < todayKey), days };
}

export type MyStarsRow = { key: string; name: string; stars: number; towardNext: number; due: number };

export async function getMyTasksView(
  actor: TasksActor,
): Promise<{ todayKey: string; tasks: TaskDTO[]; stars: MyStarsRow[] }> {
  await connectDB();
  const [docs, standings] = await Promise.all([
    Task.find({ assigneeId: actor.id, ...openTopLevel }).limit(1000).lean<TaskDoc[]>(),
    personStandings(actor.id),
  ]);
  const stars = departmentsForRoles(actor.roles)
    .filter((d) => standings.has(d.key))
    .map((d) => {
      const standing = standings.get(d.key)!;
      return { key: d.key, name: d.name, stars: standing.stars, towardNext: starsTowardNext(standing.stars), due: standing.due };
    });
  return { todayKey: istTodayKey(), tasks: await serializeCrossListTasks(actor, docs), stars };
}
