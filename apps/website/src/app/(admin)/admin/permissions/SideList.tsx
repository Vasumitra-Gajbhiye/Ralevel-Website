"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { PendingDot } from "./shared";

export type SideListItem = {
  id: string;
  label: string;
  meta: string;
  pending: boolean;
};

export type SideListGroup = { label: string; items: SideListItem[] };

/** Grouped, searchable list of roles or pages. Arrow keys move the selection. */
export function SideList({
  groups,
  selectedId,
  onSelect,
  searchLabel,
  emptyLabel,
}: {
  groups: SideListGroup[];
  selectedId: string;
  onSelect: (id: string) => void;
  searchLabel: string;
  emptyLabel: string;
}) {
  const [query, setQuery] = useState("");
  const buttons = useRef(new Map<string, HTMLButtonElement>());

  const needle = query.trim().toLowerCase();
  const visible = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.label.toLowerCase().includes(needle)),
    }))
    .filter((group) => group.items.length > 0);
  const order = visible.flatMap((group) => group.items.map((item) => item.id));

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, (index: number) => number> = {
      ArrowDown: (i) => Math.min(i + 1, order.length - 1),
      ArrowUp: (i) => Math.max(i - 1, 0),
      Home: () => 0,
      End: () => order.length - 1,
    };
    const move = moves[event.key];
    if (!move || order.length === 0) return;
    event.preventDefault();
    const nextId = order[move(Math.max(order.indexOf(selectedId), 0))];
    onSelect(nextId);
    buttons.current.get(nextId)?.focus();
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchLabel}
          aria-label={searchLabel}
          className="h-9 pl-8"
        />
      </div>

      {visible.length === 0 ? (
        <p className="px-2 py-6 text-center text-sm text-slate-500">
          {emptyLabel} &ldquo;{query.trim()}&rdquo;
        </p>
      ) : (
        <div className="space-y-4" onKeyDown={onKeyDown}>
          {visible.map((group) => (
            <div key={group.label}>
              <p className="px-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                {group.label}
              </p>
              <ul className="mt-1 space-y-0.5">
                {group.items.map((item) => {
                  const selected = item.id === selectedId;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        ref={(node) => {
                          if (node) buttons.current.set(item.id, node);
                          else buttons.current.delete(item.id);
                        }}
                        onClick={() => onSelect(item.id)}
                        aria-current={selected ? "true" : undefined}
                        tabIndex={selected || (!order.includes(selectedId) && item.id === order[0]) ? 0 : -1}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                          selected ? "bg-slate-100" : "hover:bg-slate-50",
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block truncate text-sm",
                              selected ? "font-medium text-slate-900" : "text-slate-700",
                            )}
                          >
                            {item.label}
                          </span>
                          <span className="block truncate text-xs text-slate-400">{item.meta}</span>
                        </span>
                        {item.pending && <PendingDot />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
