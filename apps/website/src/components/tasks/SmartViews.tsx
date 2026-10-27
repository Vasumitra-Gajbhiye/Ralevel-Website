"use client";

import type { MyStarsRow } from "@/lib/data/tasks/workspace";
import { tasksApi } from "@/lib/tasks/client";
import { formatDayHeading } from "@/lib/tasks/dates";
import { getDepartment } from "@/lib/tasks/departments";
import { STARS_PER_CERTIFICATE } from "@/lib/tasks/stars";
import type { TaskDTO } from "@/lib/tasks/types";
import { CalendarClock, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { InlineAddTask } from "./AddTask";
import { ColorDot, EmptyState } from "./bits";
import { DuePicker } from "./pickers";
import { TaskRow } from "./TaskRow";
import { useTasksUI } from "./TasksContext";

function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-5">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
    </header>
  );
}

function GroupHeader({ title, count, tone, action }: { title: string; count?: number; tone?: "red"; action?: React.ReactNode }) {
  return (
    <div className="mb-1 flex items-center gap-2 border-b border-gray-200 pb-1.5">
      <h2 className={tone === "red" ? "text-sm font-semibold text-red-600" : "text-sm font-semibold text-gray-800"}>{title}</h2>
      {count !== undefined && count > 0 && <span className="text-xs text-gray-400">{count}</span>}
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
}

const rows = (tasks: TaskDTO[]) => tasks.map((t) => <TaskRow key={`${t.id}-${t.dueOn}`} task={t} showList />);

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function OverdueGroup({ tasks }: { tasks: TaskDTO[] }) {
  const { refresh } = useTasksUI();
  const editable = tasks.filter((t) => t.perms.canEdit);
  const [busy, setBusy] = useState(false);

  const reschedule = async (dueOn: string | null) => {
    if (!dueOn || busy) return;
    setBusy(true);
    const results = await Promise.allSettled(editable.map((t) => tasksApi.updateTask(t.id, { dueOn })));
    setBusy(false);
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed) toast.error(`${failed} task${failed === 1 ? "" : "s"} couldn't be moved`);
    else toast.success(`Rescheduled ${plural(editable.length, "task")}`);
    refresh();
  };

  return (
    <section>
      <GroupHeader
        title="Overdue"
        count={tasks.length}
        tone="red"
        action={
          editable.length > 0 && (
            <DuePicker value={{ dueOn: null, dueTime: null, recurrence: null }} onChange={(v) => void reschedule(v.dueOn)} align="end">
              <button type="button" disabled={busy} className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline">
                <CalendarClock className="h-3.5 w-3.5" /> Reschedule
              </button>
            </DuePicker>
          )
        }
      />
      {rows(tasks)}
    </section>
  );
}

export function TodayView({ overdue, today }: { overdue: TaskDTO[]; today: TaskDTO[] }) {
  const { todayKey, inboxId } = useTasksUI();
  const total = overdue.length + today.length;
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <PageTitle title="Today" subtitle={total ? plural(total, "task") : undefined} />
      <div className="space-y-8">
        {overdue.length > 0 && <OverdueGroup tasks={overdue} />}
        <section>
          <GroupHeader title={formatDayHeading(todayKey, todayKey)} count={today.length} />
          {rows(today)}
          <InlineAddTask listId={inboxId} defaultDueOn={todayKey} />
          {total === 0 && <EmptyState title="You're all caught up" hint="Press Q to add a task." />}
        </section>
      </div>
    </div>
  );
}

export function UpcomingView({ overdue, days }: { overdue: TaskDTO[]; days: { key: string; tasks: TaskDTO[] }[] }) {
  const { todayKey, inboxId } = useTasksUI();
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <PageTitle title="Upcoming" subtitle="Your tasks for the next two weeks" />
      <div className="space-y-7">
        {overdue.length > 0 && <OverdueGroup tasks={overdue} />}
        {days.map((day) => (
          <section key={day.key}>
            <GroupHeader title={formatDayHeading(day.key, todayKey)} count={day.tasks.length} />
            {rows(day.tasks)}
            <InlineAddTask listId={inboxId} defaultDueOn={day.key} />
          </section>
        ))}
      </div>
    </div>
  );
}

/** One muted line per department where you've earned stars, e.g. "Resources ★ 3 / 5". */
function MyStarsLine({ stars }: { stars: MyStarsRow[] }) {
  if (!stars.length) return null;
  return (
    <p className="-mt-3 mb-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
      {stars.map((row) => (
        <Link key={row.key} href={`/tasks/d/${row.key}`} className="inline-flex items-center gap-1 hover:text-gray-800">
          {row.name}
          <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
          {row.due > 0 ? (
            <span className="font-medium text-violet-700">certificate earned</span>
          ) : (
            <span className="tabular-nums">
              {row.towardNext} / {STARS_PER_CERTIFICATE}
            </span>
          )}
        </Link>
      ))}
    </p>
  );
}

export function MyTasksView({ tasks, stars = [] }: { tasks: TaskDTO[]; stars?: MyStarsRow[] }) {
  const groups = new Map<string, { label: string; color: string; tasks: TaskDTO[] }>();
  for (const t of tasks) {
    if (!t.list) continue;
    const dept = t.list.departmentKey ? getDepartment(t.list.departmentKey)?.name : null;
    const group = groups.get(t.list.id) ?? {
      label: dept ? `${dept} · ${t.list.name}` : t.list.name,
      color: t.list.color,
      tasks: [],
    };
    group.tasks.push(t);
    groups.set(t.list.id, group);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <PageTitle title="My tasks" subtitle={tasks.length ? `${plural(tasks.length, "task")} assigned to you` : undefined} />
      <MyStarsLine stars={stars} />
      {groups.size === 0 ? (
        <EmptyState
          title="Nothing is assigned to you"
          hint="When a department head assigns you a task, or you claim one from your department's page, it shows up here."
        />
      ) : (
        <div className="space-y-8">
          {[...groups.entries()].map(([id, group]) => (
            <section key={id}>
              <div className="mb-1 flex items-center gap-2 border-b border-gray-200 pb-1.5">
                <ColorDot color={group.color} />
                <h2 className="text-sm font-semibold text-gray-800">{group.label}</h2>
                <span className="text-xs text-gray-400">{group.tasks.length}</span>
              </div>
              {group.tasks.map((t) => (
                <TaskRow key={`${t.id}-${t.dueOn}`} task={t} />
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
