"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { SidebarData, TaskListRef, TasksViewer } from "@/lib/tasks/types";
import { Menu, Plus } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { QuickAddDialog } from "./AddTask";
import { TaskDetailSheet } from "./TaskDetailSheet";
import { TasksProvider, useTasksUI } from "./TasksContext";
import { TasksSidebar, type DevUser } from "./TasksSidebar";

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

/** Q opens quick add from anywhere (like Todoist), unless you're typing. */
function Hotkeys() {
  const { openQuickAdd, quickAdd } = useTasksUI();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "q" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping(e.target) || quickAdd.open || document.querySelector("[role=dialog]")) return;
      e.preventDefault();
      openQuickAdd();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openQuickAdd, quickAdd.open]);
  return null;
}

function MobileAddButton() {
  const { openQuickAdd } = useTasksUI();
  return (
    <button
      type="button"
      onClick={() => openQuickAdd()}
      aria-label="Add task"
      className="fixed bottom-5 right-5 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg md:hidden"
    >
      <Plus className="h-5 w-5" />
    </button>
  );
}

export function TasksShell({
  viewer,
  inboxId,
  todayKey,
  writableLists,
  sidebar,
  devUsers,
  children,
}: {
  viewer: TasksViewer;
  inboxId: string;
  todayKey: string;
  writableLists: TaskListRef[];
  sidebar: SidebarData;
  devUsers: DevUser[] | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Suspense>
      <TasksProvider viewer={viewer} inboxId={inboxId} todayKey={todayKey} writableLists={writableLists}>
        <div className="flex h-dvh bg-white tracking-normal text-gray-900">
          <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-gray-50/80 md:block">
            <TasksSidebar sidebar={sidebar} devUsers={devUsers} />
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex items-center gap-2 border-b border-gray-200 px-3 py-2 md:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 bg-gray-50 p-0 tracking-normal">
                  <SheetTitle className="sr-only">Tasks navigation</SheetTitle>
                  <TasksSidebar sidebar={sidebar} devUsers={devUsers} onNavigate={() => setOpen(false)} />
                </SheetContent>
              </Sheet>
              <span className="text-sm font-semibold">Tasks</span>
            </header>

            {viewer.impersonating && (
              <div className="bg-amber-100 px-4 py-1.5 text-center text-xs text-amber-900">
                Viewing as <strong>{viewer.name}</strong> (local development only)
              </div>
            )}

            <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
          </div>

          <TaskDetailSheet />
          <QuickAddDialog />
          <Hotkeys />
          <MobileAddButton />
        </div>
      </TasksProvider>
    </Suspense>
  );
}
