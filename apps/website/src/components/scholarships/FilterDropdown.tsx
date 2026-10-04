"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, X } from "lucide-react";
import { useState } from "react";

export type FilterOption = { value: string; label: string };

type FilterDropdownProps = {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  searchable?: boolean;
  /** Only one value at a time (e.g. nationality). */
  single?: boolean;
};

/** Pill trigger showing the current selection; clears with its own ×. */
export default function FilterDropdown({
  label,
  options,
  selected,
  onChange,
  searchable = false,
  single = false,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const active = selected.length > 0;
  const firstLabel = options.find((o) => o.value === selected[0])?.label ?? selected[0];
  const summary =
    selected.length === 0
      ? label
      : selected.length === 1
        ? firstLabel
        : `${label} · ${selected.length}`;

  function toggle(value: string) {
    if (single) {
      onChange(selected.includes(value) ? [] : [value]);
      setOpen(false);
      return;
    }
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border text-sm font-medium transition-colors",
        active
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex max-w-[12rem] items-center gap-1 rounded-full py-1.5 pl-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
              active ? "pr-1" : "pr-2.5",
            )}
          >
            <span className="truncate">{summary}</span>
            {!active && <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-0 tracking-normal">
          <Command>
            {searchable && <CommandInput placeholder={`Search ${label.toLowerCase()}`} />}
            <CommandList className="max-h-72">
              <CommandEmpty>No matches.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const on = selected.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => toggle(option.value)}
                      className="gap-2"
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border",
                          on ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300",
                        )}
                      >
                        {on && <Check className="h-3 w-3" />}
                      </span>
                      {option.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {active && (
        <button
          type="button"
          aria-label={`Clear ${label}`}
          onClick={() => onChange([])}
          className="mr-1 rounded-full p-1 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function ToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
        active
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      )}
    >
      {active && <Check className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}
