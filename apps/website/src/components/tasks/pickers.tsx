"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addDays, dayKeyFromParts, parseDayKey, weekdayOf } from "@/lib/tasks/dates";
import {
  formatRecurrence,
  normalizeRecurrence,
  parseRecurrence,
  type Recurrence,
} from "@/lib/tasks/recurrence";
import type { MemberOption } from "@/lib/tasks/types";
import { cn } from "@/lib/utils";
import { Ban, CalendarDays, Check, Clock, Repeat, Sofa, Sun, SunMedium, UserRound, X } from "lucide-react";
import { forwardRef, useState } from "react";
import { PriorityFlag, UserAvatar } from "./bits";
import { useTasksUI } from "./TasksContext";

/* -------------------------------- Due date -------------------------------- */

export type DueValue = { dueOn: string | null; dueTime: string | null; recurrence: Recurrence | null };

const toDate = (key: string) => {
  const { year, month, day } = parseDayKey(key);
  return new Date(year, month - 1, day);
};
const fromDate = (date: Date) => dayKeyFromParts(date.getFullYear(), date.getMonth() + 1, date.getDate());

type RepeatPreset = "none" | "daily" | "weekdays" | "weekly" | "monthly" | "yearly" | "custom";

function presetRule(preset: RepeatPreset, anchor: string): Recurrence | null {
  switch (preset) {
    case "daily":
      return { freq: "day", interval: 1 };
    case "weekdays":
      return { freq: "day", interval: 1, workdays: true };
    case "weekly":
      return normalizeRecurrence({ freq: "week", interval: 1 }, anchor);
    case "monthly":
      return normalizeRecurrence({ freq: "month", interval: 1 }, anchor);
    case "yearly":
      return normalizeRecurrence({ freq: "year", interval: 1 }, anchor);
    default:
      return null;
  }
}

function presetOf(rule: Recurrence | null, anchor: string): RepeatPreset {
  if (!rule) return "none";
  const json = JSON.stringify(normalizeRecurrence(rule, anchor));
  for (const preset of ["daily", "weekdays", "weekly", "monthly", "yearly"] as const) {
    if (JSON.stringify(presetRule(preset, anchor)) === json) return preset;
  }
  return "custom";
}

export function DuePicker({
  value,
  onChange,
  children,
  align = "start",
}: {
  value: DueValue;
  onChange: (value: DueValue) => void;
  children: React.ReactNode;
  align?: "start" | "end" | "center";
}) {
  const { todayKey } = useTasksUI();
  const [open, setOpen] = useState(false);
  const [customText, setCustomText] = useState("");
  const anchor = value.dueOn ?? todayKey;
  const preset = presetOf(value.recurrence, anchor);
  const [showCustom, setShowCustom] = useState(false);

  const daysToSat = (6 - weekdayOf(todayKey) + 7) % 7 || 7;
  const daysToMon = (8 - weekdayOf(todayKey)) % 7 || 7;
  const quick = [
    { label: "Today", key: todayKey, icon: Sun, tone: "text-green-700" },
    { label: "Tomorrow", key: addDays(todayKey, 1), icon: SunMedium, tone: "text-orange-600" },
    { label: "This weekend", key: addDays(todayKey, daysToSat), icon: Sofa, tone: "text-blue-600" },
    { label: "Next week", key: addDays(todayKey, daysToMon), icon: CalendarDays, tone: "text-violet-600" },
  ];

  const setDay = (dueOn: string | null) => {
    if (!dueOn) return onChange({ dueOn: null, dueTime: null, recurrence: null });
    // Single-anchor repeats ("every week on Fri") follow the new date; custom rules stay as they are.
    const p = presetOf(value.recurrence, anchor);
    const recurrence =
      p === "weekly" || p === "monthly" || p === "yearly" ? presetRule(p, dueOn) : value.recurrence;
    onChange({ ...value, dueOn, recurrence });
  };

  const setPreset = (next: RepeatPreset) => {
    if (next === "custom") {
      setShowCustom(true);
      return;
    }
    setShowCustom(false);
    onChange({ ...value, dueOn: value.dueOn ?? todayKey, recurrence: presetRule(next, anchor) });
  };

  const customParsed = customText ? parseRecurrence(customText, { loose: true }) : null;
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][weekdayOf(anchor)];
  const md = parseDayKey(anchor).day;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align={align} className="w-[280px] p-0" onClick={(e) => e.stopPropagation()}>
        <div className="border-b p-1">
          {quick.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => {
                setDay(q.key);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-gray-100"
            >
              <q.icon className={cn("h-4 w-4", q.tone)} />
              <span className="flex-1">{q.label}</span>
              <span className="text-xs text-gray-400">{wdOf(q.key)}</span>
            </button>
          ))}
          {value.dueOn && (
            <button
              type="button"
              onClick={() => {
                setDay(null);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-gray-100"
            >
              <Ban className="h-4 w-4 text-gray-500" />
              No date
            </button>
          )}
        </div>
        <Calendar
          mode="single"
          selected={value.dueOn ? toDate(value.dueOn) : undefined}
          defaultMonth={value.dueOn ? toDate(value.dueOn) : undefined}
          onSelect={(date) => date && setDay(fromDate(date))}
          weekStartsOn={1}
          className="mx-auto"
        />
        <div className="space-y-2 border-t p-3 text-sm">
          <label className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="w-14 text-gray-600">Time</span>
            <input
              type="time"
              step={900}
              value={value.dueTime ?? ""}
              onChange={(e) =>
                onChange({ ...value, dueOn: value.dueOn ?? todayKey, dueTime: e.target.value || null })
              }
              className="h-8 flex-1 rounded border border-gray-200 px-2 text-sm"
            />
            {value.dueTime && (
              <button type="button" aria-label="Clear time" onClick={() => onChange({ ...value, dueTime: null })}>
                <X className="h-4 w-4 text-gray-400 hover:text-gray-700" />
              </button>
            )}
          </label>
          <label className="flex items-center gap-2">
            <Repeat className="h-4 w-4 text-gray-500" />
            <span className="w-14 text-gray-600">Repeat</span>
            <select
              value={showCustom ? "custom" : preset}
              onChange={(e) => setPreset(e.target.value as RepeatPreset)}
              className="h-8 flex-1 rounded border border-gray-200 bg-white px-1.5 text-sm"
            >
              <option value="none">Doesn&apos;t repeat</option>
              <option value="daily">Every day</option>
              <option value="weekdays">Every weekday</option>
              <option value="weekly">Every week on {wd}</option>
              <option value="monthly">Every month on the {md}</option>
              <option value="yearly">Every year</option>
              <option value="custom">{preset === "custom" && value.recurrence ? formatRecurrence(value.recurrence) : "Custom…"}</option>
            </select>
          </label>
          {showCustom && (
            <div className="pl-[88px]">
              <input
                autoFocus
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customParsed) {
                    e.preventDefault();
                    const dueOn = value.dueOn ?? todayKey;
                    onChange({ ...value, dueOn, recurrence: normalizeRecurrence(customParsed.rule, dueOn) });
                    setShowCustom(false);
                    setCustomText("");
                  }
                }}
                placeholder="every mon, thu"
                className="h-8 w-full rounded border border-gray-200 px-2 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                {customParsed ? `${formatRecurrence(customParsed.rule)} — press Enter` : "Try “every other week” or “every 15th”"}
              </p>
            </div>
          )}
          <p className="text-[11px] text-gray-400">Times are in IST.</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function wdOf(key: string) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][weekdayOf(key)];
}

/* -------------------------------- Priority -------------------------------- */

const PRIORITY_LABELS = { 1: "Priority 1", 2: "Priority 2", 3: "Priority 3", 4: "Priority 4" } as const;

export function PriorityPicker({
  value,
  onChange,
  children,
}: {
  value: 1 | 2 | 3 | 4;
  onChange: (value: 1 | 2 | 3 | 4) => void;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
        {([1, 2, 3, 4] as const).map((p) => (
          <DropdownMenuItem key={p} onSelect={() => onChange(p)} className="gap-2">
            <PriorityFlag priority={p} />
            <span className="flex-1">{PRIORITY_LABELS[p]}</span>
            {value === p && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* -------------------------------- Assignee -------------------------------- */

export function AssigneePicker({
  members,
  value,
  onChange,
  children,
}: {
  members: MemberOption[];
  value: string | null;
  onChange: (assigneeId: string | null) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const inDept = members.filter((m) => m.inDepartment);
  const others = members.filter((m) => !m.inDepartment);
  const pick = (id: string | null) => {
    onChange(id);
    setOpen(false);
  };

  const item = (m: MemberOption) => (
    <CommandItem key={m.id} value={`${m.name} ${m.nickname ?? ""} ${m.id}`} onSelect={() => pick(m.id)} className="gap-2">
      <UserAvatar user={m} size={20} />
      <span className="flex-1 truncate">{m.name}</span>
      {m.nickname && <span className="text-xs text-gray-400">@{m.nickname}</span>}
      {value === m.id && <Check className="h-4 w-4" />}
    </CommandItem>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" className="w-[280px] p-0" onClick={(e) => e.stopPropagation()}>
        <Command>
          <CommandInput placeholder="Assign to…" />
          <CommandList className="max-h-72">
            <CommandEmpty>No one found.</CommandEmpty>
            <CommandGroup>
              <CommandItem value="unassigned" onSelect={() => pick(null)} className="gap-2">
                <UserRound className="h-5 w-5 text-gray-400" />
                <span className="flex-1">Unassigned</span>
                {value === null && <Check className="h-4 w-4" />}
              </CommandItem>
            </CommandGroup>
            {inDept.length > 0 && <CommandGroup heading="Department">{inDept.map(item)}</CommandGroup>}
            {others.length > 0 && <CommandGroup heading="Other staff">{others.map(item)}</CommandGroup>}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/** Small pill button used by the pickers' triggers. */
export const PillButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }
>(function PillButton({ active, className, children, ...props }, ref) {
  return (
    <Button
      ref={ref}
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        "h-7 gap-1.5 rounded-md border-gray-200 px-2 text-xs font-normal text-gray-600 shadow-none",
        active && "border-gray-300 bg-gray-50 text-gray-900",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
});
