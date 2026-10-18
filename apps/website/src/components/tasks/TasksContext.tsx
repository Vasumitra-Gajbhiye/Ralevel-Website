"use client";

import { tasksApi } from "@/lib/tasks/client";
import type { MemberOption, TaskListRef, TasksViewer } from "@/lib/tasks/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type QuickAddDefaults = {
  listId?: string;
  sectionId?: string | null;
  dueOn?: string | null;
};

type TasksUI = {
  viewer: TasksViewer;
  inboxId: string;
  todayKey: string;
  writableLists: TaskListRef[];
  openTask: (taskId: string) => void;
  closeTask: () => void;
  openQuickAdd: (defaults?: QuickAddDefaults) => void;
  quickAdd: { open: boolean; defaults: QuickAddDefaults };
  setQuickAddOpen: (open: boolean) => void;
  refresh: () => void;
};

const Ctx = createContext<TasksUI | null>(null);

export function useTasksUI(): TasksUI {
  const value = useContext(Ctx);
  if (!value) throw new Error("useTasksUI must be used inside <TasksProvider>");
  return value;
}

export function TasksProvider({
  viewer,
  inboxId,
  todayKey,
  writableLists,
  children,
}: {
  viewer: TasksViewer;
  inboxId: string;
  todayKey: string;
  writableLists: TaskListRef[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [quickAdd, setQuickAdd] = useState<{ open: boolean; defaults: QuickAddDefaults }>({
    open: false,
    defaults: {},
  });

  const setTaskParam = useCallback(
    (taskId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (taskId) params.set("task", taskId);
      else params.delete("task");
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const value = useMemo<TasksUI>(
    () => ({
      viewer,
      inboxId,
      todayKey,
      writableLists,
      openTask: (taskId) => setTaskParam(taskId),
      closeTask: () => setTaskParam(null),
      openQuickAdd: (defaults = {}) => setQuickAdd({ open: true, defaults }),
      quickAdd,
      setQuickAddOpen: (open) => setQuickAdd((prev) => ({ ...prev, open })),
      refresh: () => router.refresh(),
    }),
    [viewer, inboxId, todayKey, writableLists, setTaskParam, quickAdd, router],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* ------------------------------ Members cache ----------------------------- */

const membersCache = new Map<string, Promise<MemberOption[]>>();

/** People the viewer can assign in a list (empty for inboxes and non-managers). */
export function useListMembers(listId: string | null | undefined, enabled = true): MemberOption[] {
  const [members, setMembers] = useState<MemberOption[]>([]);

  useEffect(() => {
    if (!listId || !enabled) {
      setMembers([]);
      return;
    }
    let cancelled = false;
    let promise = membersCache.get(listId);
    if (!promise) {
      promise = tasksApi.members(listId).catch(() => {
        membersCache.delete(listId);
        return [];
      });
      membersCache.set(listId, promise);
    }
    promise.then((result) => {
      if (!cancelled) setMembers(result);
    });
    return () => {
      cancelled = true;
    };
  }, [listId, enabled]);

  return members;
}

/** Clears cached members (e.g. after switching "view as" in development). */
export function clearMembersCache() {
  membersCache.clear();
}
