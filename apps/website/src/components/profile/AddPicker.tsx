"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus } from "lucide-react";
import { useState } from "react";

export type PickerGroup = {
  heading: string;
  options: { value: string; label: string; hint?: string }[];
};

type AddPickerProps = {
  label: string;
  searchPlaceholder: string;
  emptyText: string;
  groups: PickerGroup[];
  disabled?: boolean;
  onSelect: (value: string) => void;
};

// "+ Add …" button with a searchable list. It stays open after a pick so
// several items can be added in a row.
export default function AddPicker({
  label,
  searchPlaceholder,
  emptyText,
  groups,
  disabled,
  onSelect,
}: AddPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          <Plus className="h-4 w-4" />
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(22rem,calc(100vw-2rem))] p-0 tracking-normal"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {groups.map(
              (group) =>
                group.options.length > 0 && (
                  <CommandGroup key={group.heading} heading={group.heading}>
                    {group.options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        keywords={[option.label, option.hint ?? ""]}
                        onSelect={() => onSelect(option.value)}
                        className="cursor-pointer"
                      >
                        <span className="flex-1 truncate">{option.label}</span>
                        {option.hint && (
                          <span className="text-xs text-slate-400">
                            {option.hint}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ),
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
