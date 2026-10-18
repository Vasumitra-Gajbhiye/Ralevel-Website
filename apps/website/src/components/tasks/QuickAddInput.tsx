"use client";

/**
 * Task entry with natural-language parsing ("Post update fri 5pm p1 @nick").
 * Loaded lazily (next/dynamic) so chrono-node stays out of the main bundle.
 */
import { Button } from "@/components/ui/button";
import { formatDue } from "@/lib/tasks/dates";
import { parseQuickAdd, type TokenKind } from "@/lib/tasks/quickAdd";
import type { Recurrence } from "@/lib/tasks/recurrence";
import type { TaskListRef } from "@/lib/tasks/types";
import { cn } from "@/lib/utils";
import { CalendarDays, Repeat, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ColorDot, PriorityFlag, UserAvatar } from "./bits";
import { AssigneePicker, DuePicker, PillButton, PriorityPicker, type DueValue } from "./pickers";
import { useListMembers, useTasksUI } from "./TasksContext";

export type QuickAddPayload = {
  listId: string;
  title: string;
  description: string;
  dueOn: string | null;
  dueTime: string | null;
  recurrence: Recurrence | null;
  priority: 1 | 2 | 3 | 4;
  assigneeId: string | null;
};

type Overrides = { due?: DueValue; priority?: 1 | 2 | 3 | 4; assigneeId?: string | null };

const TOKEN_TONE: Record<TokenKind, string> = {
  date: "bg-green-50 text-green-800",
  recurrence: "bg-green-50 text-green-800",
  priority: "bg-red-50 text-red-700",
  assignee: "bg-blue-50 text-blue-700",
  list: "bg-violet-50 text-violet-700",
};

export default function QuickAddInput({
  listId,
  lists,
  defaultDueOn = null,
  onSubmit,
  onCancel,
  submitLabel = "Add task",
  autoFocus = true,
  compact = false,
}: {
  listId: string;
  /** When given, shows a list picker and lets "#list" pick one. */
  lists?: TaskListRef[];
  defaultDueOn?: string | null;
  onSubmit: (payload: QuickAddPayload) => Promise<boolean>;
  onCancel?: () => void;
  submitLabel?: string;
  autoFocus?: boolean;
  compact?: boolean;
}) {
  const { todayKey, writableLists } = useTasksUI();
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [ignore, setIgnore] = useState<TokenKind[]>([]);
  const [overrides, setOverrides] = useState<Overrides>({});
  const [chosenListId, setChosenListId] = useState(listId);
  const [saving, setSaving] = useState(false);

  useEffect(() => setChosenListId(listId), [listId]);

  const pickerLists = lists ?? [];
  const listRefs = useMemo(() => lists?.map((l) => ({ id: l.id, name: l.name })), [lists]);

  // Members come from the target list; parse once without them to find "#list".
  const prelim = useMemo(
    () => parseQuickAdd(text, { lists: listRefs, ignore: [...ignore, "assignee"] }),
    [text, listRefs, ignore],
  );
  const targetListId = prelim.listId ?? chosenListId;
  const targetList = writableLists.find((l) => l.id === targetListId);
  const members = useListMembers(targetListId, targetList?.kind === "department");

  const parsed = useMemo(
    () =>
      parseQuickAdd(text, {
        lists: listRefs,
        members: targetList?.kind === "department" ? members : undefined,
        ignore,
      }),
    [text, listRefs, members, targetList?.kind, ignore],
  );

  const parsedDue = parsed.dueOn || parsed.recurrence;
  const due: DueValue =
    overrides.due ??
    (parsedDue
      ? { dueOn: parsed.dueOn, dueTime: parsed.dueTime, recurrence: parsed.recurrence }
      : { dueOn: defaultDueOn, dueTime: null, recurrence: null });
  const priority = overrides.priority ?? parsed.priority ?? 4;
  const assigneeId = overrides.assigneeId !== undefined ? overrides.assigneeId : parsed.assigneeId;
  const assignee = members.find((m) => m.id === assigneeId) ?? null;

  const reset = () => {
    setText("");
    setDescription("");
    setIgnore([]);
    setOverrides({});
  };

  const submit = async () => {
    const title = parsed.title.trim();
    if (!title || saving) return;
    setSaving(true);
    const okay = await onSubmit({
      listId: targetListId,
      title,
      description: description.trim(),
      ...due,
      priority,
      assigneeId: targetList?.kind === "department" ? assigneeId : null,
    });
    setSaving(false);
    if (okay) {
      reset();
      inputRef.current?.focus();
    }
  };

  const tokens = parsed.tokens.filter((t) => !(t.kind === "list" && !lists));

  return (
    <div
      className="rounded-lg border border-gray-300 bg-white shadow-sm focus-within:border-gray-400"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 pt-2.5">
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (!e.target.value) setIgnore([]);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              void submit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              onCancel?.();
            }
          }}
          placeholder={compact ? "Task name" : "Task name — try “Send recap fri 5pm p1”"}
          aria-label="Task name"
          className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-400"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel?.();
          }}
          placeholder="Description"
          rows={1}
          aria-label="Description"
          className="mt-1 w-full resize-none bg-transparent text-xs text-gray-600 outline-none placeholder:text-gray-400"
        />
        {tokens.length > 0 && (
          <div className="mb-1 flex flex-wrap gap-1">
            {tokens.map((t) => (
              <span
                key={`${t.kind}-${t.start}`}
                className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px]", TOKEN_TONE[t.kind])}
              >
                {t.label}
                <button
                  type="button"
                  aria-label={`Keep "${text.slice(t.start, t.end)}" as text`}
                  onClick={() => setIgnore((prev) => [...prev, t.kind])}
                  className="opacity-60 hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        {parsed.warnings.length > 0 && <p className="mb-1 text-[11px] text-amber-700">{parsed.warnings[0]}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 px-3 pb-2.5 pt-1">
        <DuePicker value={due} onChange={(value) => setOverrides((o) => ({ ...o, due: value }))}>
          <PillButton active={Boolean(due.dueOn)}>
            <CalendarDays className="h-3.5 w-3.5" />
            {due.dueOn ? formatDue(due.dueOn, due.dueTime ? `${due.dueOn}T${due.dueTime}:00+05:30` : null, todayKey) : "Date"}
            {due.recurrence && <Repeat className="h-3 w-3" />}
          </PillButton>
        </DuePicker>
        <PriorityPicker value={priority} onChange={(p) => setOverrides((o) => ({ ...o, priority: p }))}>
          <PillButton active={priority < 4}>
            <PriorityFlag priority={priority} />
            {priority < 4 ? `P${priority}` : "Priority"}
          </PillButton>
        </PriorityPicker>
        {members.length > 0 && (
          <AssigneePicker
            members={members}
            value={assigneeId}
            onChange={(id) => setOverrides((o) => ({ ...o, assigneeId: id }))}
          >
            <PillButton active={Boolean(assignee)}>
              {assignee ? <UserAvatar user={assignee} size={16} /> : <UserRound className="h-3.5 w-3.5" />}
              {assignee ? assignee.name.split(" ")[0] : "Assignee"}
            </PillButton>
          </AssigneePicker>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-gray-100 px-3 py-2">
        {lists ? (
          <label className="flex min-w-0 items-center gap-1.5 text-xs text-gray-600">
            <ColorDot color={pickerLists.find((l) => l.id === targetListId)?.color ?? "slate"} />
            <select
              value={targetListId}
              onChange={(e) => setChosenListId(e.target.value)}
              disabled={Boolean(prelim.listId)}
              aria-label="List"
              className="max-w-[180px] truncate bg-transparent text-xs outline-none"
            >
              {pickerLists.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.kind === "inbox" ? "Inbox" : l.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span />
        )}
        <div className="ml-auto flex gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={() => void submit()}
            disabled={!parsed.title.trim() || saving}
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
