"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { tasksApi, type TaskFields } from "@/lib/tasks/client";
import { formatDue, istDayKey } from "@/lib/tasks/dates";
import { formatRecurrence } from "@/lib/tasks/recurrence";
import type { TaskDetailDTO } from "@/lib/tasks/types";
import { cn } from "@/lib/utils";
import { CalendarDays, Flag, Folder, Link2, MoreHorizontal, Rows3, Trash2, UserRound } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ColorDot, DueLabel, PriorityFlag, TaskCheckbox, UserAvatar } from "./bits";
import { ActivityList, AutoTextarea, CommentThread, SubtaskList } from "./DetailSections";
import { AssigneePicker, DuePicker, PriorityPicker } from "./pickers";
import { useCompleteTask } from "./TaskRow";
import { useListMembers, useTasksUI } from "./TasksContext";

export function TaskDetailSheet() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get("task");
  const { closeTask, refresh } = useTasksUI();
  const [data, setData] = useState<TaskDetailDTO | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!taskId) return;
    const controller = new AbortController();
    setError(null);
    tasksApi
      .getTask(taskId, controller.signal)
      .then((detail) => {
        setData(detail);
        setLoadedFor(taskId);
      })
      .catch((e: Error) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => controller.abort();
  }, [taskId, version]);

  const reload = useCallback(() => {
    setVersion((v) => v + 1);
    refresh();
  }, [refresh]);

  const run = useCallback(
    async (fn: () => Promise<unknown>) => {
      try {
        await fn();
        reload();
        return true;
      } catch (e) {
        toast.error((e as Error).message);
        return false;
      }
    },
    [reload],
  );

  const ready = data && loadedFor === taskId;

  return (
    <Sheet open={Boolean(taskId)} onOpenChange={(open) => !open && closeTask()}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 tracking-normal sm:max-w-[540px]">
        <SheetTitle className="sr-only">{ready ? data.task.title : "Task"}</SheetTitle>
        {error ? (
          <div className="p-8 text-sm text-gray-600">
            {error === "Not found" ? "This task doesn't exist or you can't see it." : error}
          </div>
        ) : ready ? (
          <TaskDetailBody key={data.task.id} data={data} run={run} onDeleted={closeTask} />
        ) : (
          <div className="space-y-3 p-6">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
            <div className="h-6 w-3/4 animate-pulse rounded bg-gray-100" />
            <div className="h-24 animate-pulse rounded bg-gray-50" />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function PropertyRow({ icon: Icon, label, children }: { icon: typeof Flag; label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[34px] items-center gap-3 text-sm">
      <span className="flex w-24 shrink-0 items-center gap-2 text-gray-500">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

const valueButton =
  "inline-flex max-w-full items-center gap-2 rounded px-1.5 py-1 -ml-1.5 text-left hover:bg-gray-100 disabled:hover:bg-transparent";

function TaskDetailBody({
  data,
  run,
  onDeleted,
}: {
  data: TaskDetailDTO;
  run: (fn: () => Promise<unknown>) => Promise<boolean>;
  onDeleted: () => void;
}) {
  const { todayKey, writableLists, refresh } = useTasksUI();
  const { task, list, sections, subtasks, comments, activity } = data;
  const canEdit = task.perms.canEdit;
  const complete = useCompleteTask();
  const members = useListMembers(list.id, data.canAssign);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const update = (patch: TaskFields & { listId?: string }) => run(() => tasksApi.updateTask(task.id, patch));

  const section = sections.find((s) => s.id === task.sectionId);
  const moveTargets = canEdit
    ? writableLists.filter(
        (l) =>
          l.id === list.id ||
          (l.kind === "department" && (list.kind === "inbox" || l.departmentKey === list.departmentKey)),
      )
    : [];

  const saveTitle = () => {
    const value = title.trim();
    if (!value) return setTitle(task.title);
    if (value !== task.title) void update({ title: value });
  };

  return (
    <div className="flex min-h-full flex-col">
      {/* Breadcrumb + menu */}
      <div className="flex items-center gap-2 border-b px-6 py-3 pr-14 text-xs text-gray-500">
        <ColorDot color={list.color} />
        {data.canViewList ? (
          <Link href={list.kind === "inbox" ? "/tasks/inbox" : `/tasks/l/${list.id}`} className="truncate hover:underline">
            {list.kind === "inbox" ? "Inbox" : list.name}
          </Link>
        ) : (
          <span className="truncate">{list.name}</span>
        )}
        {section && (
          <>
            <span>/</span>
            <span className="truncate">{section.name}</span>
          </>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label="Task actions" className="ml-auto rounded p-1 hover:bg-gray-100">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => {
                void navigator.clipboard
                  ?.writeText(`${window.location.origin}/tasks/l/${list.id}?task=${task.id}`)
                  .then(() => toast.success("Link copied"));
              }}
            >
              <Link2 className="mr-2 h-4 w-4" /> Copy link
            </DropdownMenuItem>
            {canEdit && (
              <DropdownMenuItem className="text-red-600 focus:text-red-600" onSelect={() => setConfirmDelete(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete task
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 space-y-6 px-6 py-5">
        {/* Title + description */}
        <div className="flex items-start gap-3">
          <div className="pt-1">
            <TaskCheckbox
              priority={task.priority}
              checked={Boolean(task.completedAt)}
              disabled={!task.perms.canAct}
              onChange={async (next) => {
                if (await complete(task, next)) run(async () => undefined);
              }}
              label={task.title}
            />
          </div>
          <div className="min-w-0 flex-1">
            {canEdit ? (
              <AutoTextarea
                value={title}
                onChange={(e) => setTitle(e.target.value.replace(/\n/g, " "))}
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    (e.target as HTMLTextAreaElement).blur();
                  }
                }}
                aria-label="Task title"
                className={cn(
                  "w-full rounded bg-transparent text-lg font-semibold leading-snug text-gray-900 outline-none focus:bg-gray-50",
                  task.completedAt && "text-gray-400 line-through",
                )}
              />
            ) : (
              <h2 className={cn("text-lg font-semibold leading-snug", task.completedAt && "text-gray-400 line-through")}>
                {task.title}
              </h2>
            )}
            {canEdit ? (
              <AutoTextarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => description !== task.description && void update({ description })}
                placeholder="Add a description"
                aria-label="Description"
                className="mt-1 w-full rounded bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:bg-gray-50"
              />
            ) : (
              task.description && <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{task.description}</p>
            )}
          </div>
        </div>

        {/* Properties */}
        <div className="space-y-0.5 rounded-lg bg-gray-50/70 px-3 py-2">
          <PropertyRow icon={UserRound} label="Assignee">
            {data.canAssign ? (
              <AssigneePicker members={members} value={task.assignee?.id ?? null} onChange={(id) => void update({ assigneeId: id })}>
                <button type="button" className={valueButton}>
                  {task.assignee ? (
                    <>
                      <UserAvatar user={task.assignee} size={20} />
                      <span className="truncate">{task.assignee.name}</span>
                    </>
                  ) : (
                    <span className="text-gray-400">Unassigned</span>
                  )}
                </button>
              </AssigneePicker>
            ) : task.assignee ? (
              <span className="inline-flex items-center gap-2">
                <UserAvatar user={task.assignee} size={20} />
                {task.assignee.name}
              </span>
            ) : (
              <span className="text-gray-400">{list.kind === "inbox" ? "Just you" : "Unassigned"}</span>
            )}
          </PropertyRow>

          <PropertyRow icon={CalendarDays} label="Due">
            {canEdit ? (
              <DuePicker
                value={{ dueOn: task.dueOn, dueTime: task.dueTime, recurrence: task.recurrence }}
                onChange={(v) => void update(v)}
              >
                <button type="button" className={valueButton}>
                  {task.dueOn ? (
                    <DueLabel dueOn={task.dueOn} dueAt={task.dueAt} todayKey={todayKey} repeating={Boolean(task.recurrence)} />
                  ) : (
                    <span className="text-gray-400">No date</span>
                  )}
                </button>
              </DuePicker>
            ) : task.dueOn ? (
              <DueLabel dueOn={task.dueOn} dueAt={task.dueAt} todayKey={todayKey} repeating={Boolean(task.recurrence)} />
            ) : (
              <span className="text-gray-400">No date</span>
            )}
            {task.recurrence && <p className="text-xs text-gray-500">{formatRecurrence(task.recurrence)}</p>}
          </PropertyRow>

          <PropertyRow icon={Flag} label="Priority">
            {canEdit ? (
              <PriorityPicker value={task.priority} onChange={(p) => void update({ priority: p })}>
                <button type="button" className={valueButton}>
                  <PriorityFlag priority={task.priority} />P{task.priority}
                </button>
              </PriorityPicker>
            ) : (
              <span className="inline-flex items-center gap-2">
                <PriorityFlag priority={task.priority} />P{task.priority}
              </span>
            )}
          </PropertyRow>

          {(canEdit ? sections.length > 0 : Boolean(section)) && (
            <PropertyRow icon={Rows3} label="Section">
              {canEdit ? (
                <select
                  value={task.sectionId ?? ""}
                  onChange={(e) => void update({ sectionId: e.target.value || null })}
                  aria-label="Section"
                  className="-ml-1 rounded bg-transparent px-1 py-1 text-sm hover:bg-gray-100"
                >
                  <option value="">No section</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              ) : (
                section?.name
              )}
            </PropertyRow>
          )}

          {moveTargets.length > 1 && (
            <PropertyRow icon={Folder} label="List">
              <select
                value={list.id}
                onChange={async (e) => {
                  const target = moveTargets.find((l) => l.id === e.target.value);
                  if (target && (await update({ listId: target.id }))) {
                    toast.success(`Moved to ${target.kind === "inbox" ? "Inbox" : target.name}`);
                  }
                }}
                aria-label="Move to list"
                className="-ml-1 max-w-full rounded bg-transparent px-1 py-1 text-sm hover:bg-gray-100"
              >
                {moveTargets.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.kind === "inbox" ? "Inbox" : l.name}
                  </option>
                ))}
              </select>
            </PropertyRow>
          )}
        </div>

        <SubtaskList parentId={task.id} listId={list.id} subtasks={subtasks} canAdd={data.canAddSubtask} run={run} />
        <CommentThread taskId={task.id} comments={comments} canComment={task.perms.canComment} run={run} />
        <ActivityList activity={activity} />

        {task.completedAt && (
          <p className="text-xs text-gray-400">Completed {formatDue(istDayKey(new Date(task.completedAt)), null, todayKey)}</p>
        )}
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              “{task.title}” and its subtasks and comments will be deleted. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                try {
                  await tasksApi.deleteTask(task.id);
                  toast.success("Task deleted");
                  onDeleted();
                  refresh();
                } catch (e) {
                  toast.error((e as Error).message);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
