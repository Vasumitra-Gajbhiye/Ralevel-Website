"use client";

import { colorClasses, PRIORITY_STYLES } from "@/lib/tasks/colors";
import { dueTone, formatDue, type DueTone } from "@/lib/tasks/dates";
import type { UserLite } from "@/lib/tasks/types";
import { cn } from "@/lib/utils";
import { Calendar, Check, Flag, Repeat } from "lucide-react";

const AVATAR_TONES = [
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-800",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

function toneFor(id: string) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length];
}

export function UserAvatar({ user, size = 20, className }: { user: UserLite; size?: number; className?: string }) {
  const style = { width: size, height: size, fontSize: Math.max(9, Math.round(size * 0.42)) };
  if (user.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatar}
        alt={user.name}
        title={user.name}
        style={style}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      title={user.name}
      style={style}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold leading-none",
        toneFor(user.id),
        className,
      )}
    >
      {initials(user.name)}
    </span>
  );
}

export function ColorDot({ color, className }: { color: string; className?: string }) {
  return <span className={cn("inline-block h-2 w-2 shrink-0 rounded-full", colorClasses(color).dot, className)} />;
}

/** Todoist-style round checkbox; the ring shows the priority. */
export function TaskCheckbox({
  priority,
  checked,
  disabled,
  onChange,
  size = "md",
  label,
}: {
  priority: 1 | 2 | 3 | 4;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  size?: "sm" | "md";
  label: string;
}) {
  const style = PRIORITY_STYLES[priority];
  const dims = size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]";
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? `Mark "${label}" not done` : `Complete "${label}"`}
      title={disabled ? "Only the assignee or a department head can complete this" : undefined}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange?.(!checked);
      }}
      className={cn(
        "group/check mt-0.5 inline-flex shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors",
        dims,
        style.ring,
        checked ? priorityFill(priority) : style.fill,
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      )}
    >
      <Check
        className={cn(
          "h-2.5 w-2.5 stroke-[3]",
          checked ? "text-white" : cn("opacity-0", !disabled && "group-hover/check:opacity-100", style.text),
        )}
      />
    </button>
  );
}

function priorityFill(priority: 1 | 2 | 3 | 4) {
  return { 1: "bg-red-500", 2: "bg-orange-500", 3: "bg-blue-500", 4: "bg-gray-400" }[priority];
}

export const DUE_TONE_CLASS: Record<DueTone, string> = {
  overdue: "text-red-600",
  today: "text-green-700",
  tomorrow: "text-orange-600",
  soon: "text-violet-600",
  later: "text-gray-500",
};

export function DueLabel({
  dueOn,
  dueAt,
  todayKey,
  repeating,
  className,
}: {
  dueOn: string;
  dueAt: string | null;
  todayKey: string;
  repeating?: boolean;
  className?: string;
}) {
  const tone = dueTone(dueOn, todayKey, dueAt, new Date());
  return (
    <span className={cn("inline-flex items-center gap-1", DUE_TONE_CLASS[tone], className)}>
      <Calendar className="h-3 w-3" />
      {formatDue(dueOn, dueAt, todayKey)}
      {repeating && <Repeat className="h-3 w-3" aria-label="Repeats" />}
    </span>
  );
}

export function PriorityFlag({ priority, className }: { priority: 1 | 2 | 3 | 4; className?: string }) {
  const style = PRIORITY_STYLES[priority];
  return <Flag className={cn("h-3.5 w-3.5", style.text, priority < 4 && "fill-current", className)} />;
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="py-16 text-center">
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
