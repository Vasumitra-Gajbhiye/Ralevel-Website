"use client";

import { formatDue } from "@/lib/tasks/dates";
import { tasksApi } from "@/lib/tasks/client";
import type { TaskDTO } from "@/lib/tasks/types";
import { cn } from "@/lib/utils";
import { ListChecks, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ColorDot, DueLabel, TaskCheckbox, UserAvatar } from "./bits";
import { ClaimButton, ReviewStateChip, reviewStateOf, StarsChip, SubmitDialog } from "./Review";
import { useTasksUI } from "./TasksContext";

/** Completes/uncompletes with an Undo toast; repeating tasks report their next date. */
export function useCompleteTask() {
  const { refresh, todayKey } = useTasksUI();
  return async (task: Pick<TaskDTO, "id" | "title">, completed: boolean) => {
    try {
      const result = await tasksApi.setCompleted(task.id, completed);
      if (completed && result.nextDueOn) {
        toast.success(`Done — next on ${formatDue(result.nextDueOn, null, todayKey)}`);
      } else if (completed) {
        toast("Task completed", {
          action: {
            label: "Undo",
            onClick: () => {
              tasksApi
                .setCompleted(task.id, false)
                .then(refresh)
                .catch((e: Error) => toast.error(e.message));
            },
          },
        });
      }
      refresh();
      return true;
    } catch (error) {
      toast.error((error as Error).message);
      return false;
    }
  };
}

export function TaskRow({
  task,
  showList = false,
  dragging = false,
  className,
}: {
  task: TaskDTO;
  showList?: boolean;
  dragging?: boolean;
  className?: string;
}) {
  const { openTask, todayKey } = useTasksUI();
  const complete = useCompleteTask();
  const [checked, setChecked] = useState(Boolean(task.completedAt));
  const [submitting, setSubmitting] = useState(false);
  // On a task with a reward, the assignee's checkbox hands it in instead.
  const submitsInstead = !task.perms.canComplete && task.perms.canSubmit;

  const onToggle = async (next: boolean) => {
    if (submitsInstead) return setSubmitting(true);
    setChecked(next);
    const saved = await complete(task, next);
    if (!saved) setChecked(!next); // roll back
    else if (next && task.recurrence) setChecked(false); // repeating: stays open with its next date
  };

  const hasMeta =
    task.dueOn ||
    task.subtaskCount > 0 ||
    task.commentCount > 0 ||
    (showList && task.list) ||
    task.description ||
    task.stars > 0 ||
    reviewStateOf(task);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openTask(task.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target === e.currentTarget) openTask(task.id);
      }}
      className={cn(
        "group flex cursor-pointer items-start gap-3 border-b border-gray-100 px-1 py-2.5 outline-none transition-colors hover:bg-gray-50/80 focus-visible:bg-gray-50",
        dragging && "rounded-md border border-gray-200 bg-white shadow-lg",
        className,
      )}
    >
      <TaskCheckbox
        priority={task.priority}
        checked={checked}
        disabled={!task.perms.canComplete && !submitsInstead}
        onChange={onToggle}
        label={task.title}
      />
      <div className="min-w-0 flex-1">
        <p className={cn("break-words text-sm leading-5 text-gray-900", checked && "text-gray-400 line-through")}>
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{task.description}</p>
        )}
        {hasMeta && (
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            {task.dueOn && (
              <DueLabel dueOn={task.dueOn} dueAt={task.dueAt} todayKey={todayKey} repeating={Boolean(task.recurrence)} />
            )}
            {task.subtaskCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <ListChecks className="h-3 w-3" />
                {task.subtaskDone}/{task.subtaskCount}
              </span>
            )}
            {task.commentCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {task.commentCount}
              </span>
            )}
            <StarsChip stars={task.stars} />
            <ReviewStateChip task={task} />
            {showList && task.list && (
              <span className="ml-auto inline-flex min-w-0 items-center gap-1.5 text-gray-500">
                <span className="truncate">{task.list.kind === "inbox" ? "Inbox" : task.list.name}</span>
                <ColorDot color={task.list.color} />
              </span>
            )}
          </div>
        )}
      </div>
      {task.perms.canClaim ? (
        <ClaimButton task={task} className="-my-0.5 shrink-0" />
      ) : (
        task.assignee && <UserAvatar user={task.assignee} size={22} className="mt-0.5" />
      )}
      {submitting && (
        // React events bubble out of the dialog's portal; keep them from opening the row.
        <span className="contents" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <SubmitDialog task={task} open={submitting} onOpenChange={setSubmitting} />
        </span>
      )}
    </div>
  );
}
