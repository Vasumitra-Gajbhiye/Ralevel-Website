"use client";

import { Button } from "@/components/ui/button";
import { tasksApi } from "@/lib/tasks/client";
import { formatDue, istDayKey } from "@/lib/tasks/dates";
import type { ActivityDTO, CommentDTO, SubtaskDTO } from "@/lib/tasks/types";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TaskCheckbox, UserAvatar } from "./bits";
import { useTasksUI } from "./TasksContext";

type Run = (fn: () => Promise<unknown>) => Promise<boolean>;

/** Textarea that grows with its content. */
export function AutoTextarea({
  className,
  value,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { value: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return <textarea ref={ref} value={value} rows={1} className={cn("resize-none overflow-hidden", className)} {...props} />;
}

/* -------------------------------- Subtasks -------------------------------- */

export function SubtaskList({
  parentId,
  listId,
  subtasks,
  canAdd,
  run,
}: {
  parentId: string;
  listId: string;
  subtasks: SubtaskDTO[];
  canAdd: boolean;
  run: Run;
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const done = subtasks.filter((s) => s.completedAt).length;

  if (!subtasks.length && !canAdd) return null;

  const add = async () => {
    const value = title.trim();
    if (!value) return;
    const saved = await run(() => tasksApi.createTask({ listId, parentId, title: value }));
    if (saved) setTitle("");
  };

  return (
    <section>
      <h3 className="mb-1 flex items-center gap-2 text-xs font-semibold text-gray-700">
        Subtasks
        {subtasks.length > 0 && (
          <span className="font-normal text-gray-400">
            {done}/{subtasks.length}
          </span>
        )}
      </h3>
      <ul>
        {subtasks.map((s) => (
          <li key={s.id} className="group flex items-start gap-2.5 border-b border-gray-100 py-1.5">
            <TaskCheckbox
              size="sm"
              priority={4}
              checked={Boolean(s.completedAt)}
              disabled={!s.perms.canAct}
              onChange={(next) => void run(() => tasksApi.setCompleted(s.id, next))}
              label={s.title}
            />
            {editing === s.id ? (
              <input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => setEditing(null)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setEditing(null);
                  if (e.key === "Enter" && editTitle.trim()) {
                    void run(() => tasksApi.updateTask(s.id, { title: editTitle.trim() }));
                    setEditing(null);
                  }
                }}
                className="flex-1 rounded border border-gray-300 px-1.5 text-sm outline-none"
              />
            ) : (
              <span className={cn("flex-1 text-sm", s.completedAt && "text-gray-400 line-through")}>{s.title}</span>
            )}
            {s.canEditTitle && editing !== s.id && (
              <span className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <button
                  type="button"
                  aria-label="Rename subtask"
                  onClick={() => {
                    setEditing(s.id);
                    setEditTitle(s.title);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5 text-gray-400 hover:text-gray-700" />
                </button>
                <button type="button" aria-label="Delete subtask" onClick={() => void run(() => tasksApi.deleteTask(s.id))}>
                  <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-600" />
                </button>
              </span>
            )}
          </li>
        ))}
      </ul>
      {canAdd &&
        (adding ? (
          <div className="mt-2 flex items-center gap-2">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void add();
                if (e.key === "Escape") setAdding(false);
              }}
              placeholder="Subtask name"
              className="h-8 flex-1 rounded-md border border-gray-300 px-2 text-sm outline-none focus:border-gray-400"
            />
            <Button size="sm" onClick={() => void add()} disabled={!title.trim()}>
              Add
            </Button>
            <button type="button" aria-label="Cancel" onClick={() => setAdding(false)}>
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-1 flex items-center gap-2 py-1 text-sm text-gray-500 hover:text-gray-900"
          >
            <Plus className="h-3.5 w-3.5" /> Add subtask
          </button>
        ))}
    </section>
  );
}

/* -------------------------------- Comments -------------------------------- */

function relativeTime(iso: string, todayKey: string) {
  const date = new Date(iso);
  const time = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" }).format(date);
  return `${formatDue(istDayKey(date), null, todayKey)} ${time}`;
}

export function CommentThread({
  taskId,
  comments,
  canComment,
  run,
}: {
  taskId: string;
  comments: CommentDTO[];
  canComment: boolean;
  run: Run;
}) {
  const { todayKey } = useTasksUI();
  const [body, setBody] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");

  if (!comments.length && !canComment) return null;

  const post = async () => {
    const value = body.trim();
    if (!value) return;
    if (await run(() => tasksApi.addComment(taskId, value))) setBody("");
  };

  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold text-gray-700">
        Comments {comments.length > 0 && <span className="font-normal text-gray-400">{comments.length}</span>}
      </h3>
      <ul className="space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="group flex gap-2.5">
            {c.author ? <UserAvatar user={c.author} size={26} /> : <span className="h-[26px] w-[26px] rounded-full bg-gray-200" />}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-gray-800">{c.author?.name ?? "Former member"}</span>
                <span className="text-[11px] text-gray-400">
                  {relativeTime(c.createdAt, todayKey)}
                  {c.editedAt && " · edited"}
                </span>
                <span className="ml-auto flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  {c.isMine && (
                    <button
                      type="button"
                      aria-label="Edit comment"
                      onClick={() => {
                        setEditing(c.id);
                        setEditBody(c.body);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5 text-gray-400 hover:text-gray-700" />
                    </button>
                  )}
                  {c.canModerate && (
                    <button type="button" aria-label="Delete comment" onClick={() => void run(() => tasksApi.deleteComment(c.id))}>
                      <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-600" />
                    </button>
                  )}
                </span>
              </div>
              {editing === c.id ? (
                <div className="mt-1 space-y-1.5">
                  <AutoTextarea
                    autoFocus
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={!editBody.trim()}
                      onClick={async () => {
                        if (await run(() => tasksApi.editComment(c.id, editBody.trim()))) setEditing(null);
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-gray-800">{c.body}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
      {canComment && (
        <div className="mt-3 rounded-lg border border-gray-200 focus-within:border-gray-400">
          <AutoTextarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void post();
            }}
            placeholder="Comment"
            className="block w-full rounded-lg bg-transparent px-3 py-2 text-sm outline-none"
          />
          {body.trim() && (
            <div className="flex items-center justify-end gap-2 px-2 pb-2">
              <span className="text-[11px] text-gray-400">⌘/Ctrl + Enter</span>
              <Button size="sm" onClick={() => void post()}>
                Comment
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* -------------------------------- Activity -------------------------------- */

function describe(a: ActivityDTO, todayKey: string): string {
  const d = a.data as Record<string, string | number | boolean | null | undefined>;
  const day = (key: unknown) => (typeof key === "string" ? formatDue(key, null, todayKey) : "no date");
  switch (a.type) {
    case "created":
      return "created this task";
    case "completed":
      return "completed it";
    case "uncompleted":
      return "reopened it";
    case "occurrence_completed":
      return `completed the ${day(d.from)} occurrence, next ${day(d.to)}`;
    case "renamed":
      return `renamed it from “${d.from}”`;
    case "description_changed":
      return "edited the description";
    case "due_changed":
      return d.to ? `set the due date to ${day(d.to)}` : "removed the due date";
    case "priority_changed":
      return `changed priority to P${d.to}`;
    case "assigned":
      return `assigned it to ${d.toName ?? "someone"}`;
    case "unassigned":
      return `unassigned ${d.fromName ?? "it"}`;
    case "moved":
      return `moved it from ${d.fromList} to ${d.toList}`;
    case "recurrence_changed":
      return d.on ? "changed how it repeats" : "stopped it repeating";
    default:
      return a.type.replace(/_/g, " ");
  }
}

export function ActivityList({ activity }: { activity: ActivityDTO[] }) {
  const { todayKey } = useTasksUI();
  const [open, setOpen] = useState(false);
  if (!activity.length) return null;
  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        Activity
      </button>
      {open && (
        <ul className="mt-2 space-y-1.5 border-l border-gray-200 pl-3">
          {activity.map((a) => (
            <li key={a.id} className="text-xs text-gray-600">
              <span className="font-medium text-gray-800">{a.actor?.name ?? "Someone"}</span> {describe(a, todayKey)}
              <span className="ml-1.5 text-gray-400">{relativeTime(a.createdAt, todayKey)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
