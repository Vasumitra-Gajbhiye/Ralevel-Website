"use client";

import { tasksApi } from "@/lib/tasks/client";
import type { SidebarData } from "@/lib/tasks/types";
import { cn } from "@/lib/utils";
import { CalendarDays, CalendarRange, ChevronDown, ChevronRight, Inbox, Plus, Shield, UserCheck, Undo2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ColorDot } from "./bits";
import { clearMembersCache, useTasksUI } from "./TasksContext";

export type DevUser = { id: string; label: string };

const COLLAPSED_KEY = "tasks:collapsed-departments";

function readCollapsed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(COLLAPSED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function NavLink({
  href,
  icon: Icon,
  label,
  count,
  tone,
  onNavigate,
}: {
  href: string;
  icon: typeof Inbox;
  label: string;
  count?: number;
  tone?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm",
        active ? "bg-gray-200/70 font-medium text-gray-900" : "text-gray-700 hover:bg-gray-100",
      )}
    >
      <Icon className={cn("h-4 w-4", tone ?? "text-gray-500")} />
      <span className="flex-1">{label}</span>
      {count ? <span className={cn("text-xs", tone === "text-red-600" ? "text-red-600" : "text-gray-400")}>{count}</span> : null}
    </Link>
  );
}

export function TasksSidebar({
  sidebar,
  devUsers,
  onNavigate,
}: {
  sidebar: SidebarData;
  devUsers: DevUser[] | null;
  onNavigate?: () => void;
}) {
  const { viewer, openQuickAdd } = useTasksUI();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<string[]>([]);

  useEffect(() => setCollapsed(readCollapsed()), []);

  const toggle = (key: string) => {
    setCollapsed((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      try {
        localStorage.setItem(COLLAPSED_KEY, JSON.stringify(next));
      } catch {
        // Storage unavailable: collapse state just won't persist.
      }
      return next;
    });
  };

  const { counts } = sidebar;
  const todayCount = counts.today + counts.overdue;

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 pb-2 pt-4">
        <div className="mb-3 flex items-center justify-between px-2">
          <Link href="/tasks/today" onClick={onNavigate} className="text-base font-semibold text-gray-900">
            Tasks
          </Link>
          <span className="max-w-[120px] truncate text-xs text-gray-500" title={viewer.name}>
            {viewer.name}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            openQuickAdd();
          }}
          className="mb-2 flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white">
            <Plus className="h-3.5 w-3.5" />
          </span>
          Add task
          <kbd className="ml-auto rounded border border-gray-200 bg-white px-1.5 text-[10px] font-normal text-gray-400">Q</kbd>
        </button>
        <nav className="space-y-0.5">
          <NavLink href="/tasks/inbox" icon={Inbox} label="Inbox" count={sidebar.inbox.openCount} onNavigate={onNavigate} />
          <NavLink
            href="/tasks/today"
            icon={CalendarDays}
            label="Today"
            count={todayCount}
            tone={counts.overdue ? "text-red-600" : "text-green-700"}
            onNavigate={onNavigate}
          />
          <NavLink
            href="/tasks/upcoming"
            icon={CalendarRange}
            label="Upcoming"
            count={counts.upcoming}
            tone="text-violet-600"
            onNavigate={onNavigate}
          />
          <NavLink href="/tasks/my" icon={UserCheck} label="My tasks" count={counts.my} tone="text-blue-600" onNavigate={onNavigate} />
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="mb-1 mt-3 px-2 text-xs font-semibold text-gray-500">Departments</p>
        {sidebar.departments.map((dept) => {
          const isCollapsed = collapsed.includes(dept.key);
          const deptHref = `/tasks/d/${dept.key}`;
          return (
            <div key={dept.key} className="mb-0.5">
              <div
                className={cn(
                  "group flex items-center rounded-md pr-1 text-sm",
                  pathname === deptHref ? "bg-gray-200/70" : "hover:bg-gray-100",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(dept.key)}
                  aria-label={isCollapsed ? `Expand ${dept.name}` : `Collapse ${dept.name}`}
                  className="p-1.5 text-gray-400 hover:text-gray-700"
                >
                  {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
                <Link href={deptHref} onClick={onNavigate} className="flex-1 truncate py-1.5 font-medium text-gray-800">
                  {dept.name}
                </Link>
                {dept.canManage && (
                  <Link
                    href={`${deptHref}?new=1`}
                    onClick={onNavigate}
                    aria-label={`New list in ${dept.name}`}
                    title="New list"
                    className="rounded p-1 text-gray-400 opacity-0 hover:bg-gray-200 hover:text-gray-800 focus:opacity-100 group-hover:opacity-100"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
              {!isCollapsed && (
                <div className="ml-5 space-y-0.5">
                  {dept.lists.map((list) => {
                    const href = `/tasks/l/${list.id}`;
                    return (
                      <Link
                        key={list.id}
                        href={href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-2 py-1 text-sm",
                          pathname === href ? "bg-gray-200/70 font-medium text-gray-900" : "text-gray-700 hover:bg-gray-100",
                        )}
                      >
                        <ColorDot color={list.color} />
                        <span className="flex-1 truncate">{list.name}</span>
                        {list.openCount > 0 && <span className="text-xs text-gray-400">{list.openCount}</span>}
                      </Link>
                    );
                  })}
                  {dept.lists.length === 0 && <p className="px-2 py-1 text-xs text-gray-400">No lists yet</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-0.5 border-t border-gray-200 px-3 py-3 text-sm">
        <a href="/" className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-gray-600 hover:bg-gray-100">
          <Undo2 className="h-4 w-4" /> Back to site
        </a>
        {viewer.canAccessAdmin && (
          <a href="/admin" className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-gray-600 hover:bg-gray-100">
            <Shield className="h-4 w-4" /> Admin
          </a>
        )}
        {devUsers && <DevActAsSwitcher users={devUsers} />}
      </div>
    </div>
  );
}

/** Local development only: view /tasks as another seeded user. */
function DevActAsSwitcher({ users }: { users: DevUser[] }) {
  const router = useRouter();
  const { viewer } = useTasksUI();
  return (
    <label className="mt-2 block rounded-md border border-dashed border-amber-300 bg-amber-50 px-2 py-1.5 text-xs text-amber-900">
      <span className="font-semibold">Dev · view as</span>
      <select
        value={viewer.impersonating ? viewer.id : ""}
        onChange={async (e) => {
          try {
            await tasksApi.actAs(e.target.value || null);
            clearMembersCache();
            router.push("/tasks/today");
            router.refresh();
          } catch (err) {
            toast.error((err as Error).message);
          }
        }}
        className="mt-1 block w-full rounded border border-amber-200 bg-white px-1 py-0.5 text-xs"
      >
        <option value="">Me</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.label}
          </option>
        ))}
      </select>
    </label>
  );
}
