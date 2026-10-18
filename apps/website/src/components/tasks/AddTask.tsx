"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { tasksApi } from "@/lib/tasks/client";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { toast } from "sonner";
import type { QuickAddPayload } from "./QuickAddInput";
import { useTasksUI } from "./TasksContext";

const QuickAddInput = dynamic(() => import("./QuickAddInput"), {
  ssr: false,
  loading: () => <div className="h-[118px] animate-pulse rounded-lg border border-gray-200 bg-gray-50" />,
});

function useCreateTask() {
  const { refresh } = useTasksUI();
  return async (payload: QuickAddPayload, sectionId: string | null = null) => {
    try {
      await tasksApi.createTask({
        listId: payload.listId,
        title: payload.title,
        description: payload.description || undefined,
        dueOn: payload.dueOn,
        dueTime: payload.dueTime,
        recurrence: payload.recurrence,
        priority: payload.priority,
        assigneeId: payload.assigneeId,
        sectionId,
      });
      refresh();
      return true;
    } catch (error) {
      toast.error((error as Error).message);
      return false;
    }
  };
}

/** "+ Add task" row that expands into the quick-add input and stays open for rapid entry. */
export function InlineAddTask({
  listId,
  sectionId = null,
  defaultDueOn = null,
  label = "Add task",
}: {
  listId: string;
  sectionId?: string | null;
  defaultDueOn?: string | null;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const create = useCreateTask();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center gap-2.5 px-1 py-2 text-sm text-gray-500 hover:text-gray-900"
      >
        <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full text-gray-500 group-hover:bg-gray-900 group-hover:text-white">
          <Plus className="h-3.5 w-3.5" />
        </span>
        {label}
      </button>
    );
  }

  return (
    <div className="py-2">
      <QuickAddInput
        listId={listId}
        defaultDueOn={defaultDueOn}
        onSubmit={(payload) => create(payload, sectionId)}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}

/** Global quick add (press Q anywhere), with a list picker. */
export function QuickAddDialog() {
  const { quickAdd, setQuickAddOpen, writableLists, inboxId } = useTasksUI();
  const create = useCreateTask();
  const listId =
    quickAdd.defaults.listId && writableLists.some((l) => l.id === quickAdd.defaults.listId)
      ? quickAdd.defaults.listId
      : inboxId;

  return (
    <Dialog open={quickAdd.open} onOpenChange={setQuickAddOpen}>
      <DialogContent className="top-[20%] max-w-xl translate-y-0 gap-0 border-0 bg-transparent p-0 shadow-none [&>button]:hidden">
        <DialogTitle className="sr-only">Add task</DialogTitle>
        {quickAdd.open && (
          <QuickAddInput
            listId={listId}
            lists={writableLists}
            defaultDueOn={quickAdd.defaults.dueOn ?? null}
            onSubmit={async (payload) => {
              const sectionId = payload.listId === quickAdd.defaults.listId ? quickAdd.defaults.sectionId ?? null : null;
              const saved = await create(payload, sectionId);
              if (saved) {
                toast.success("Task added");
                setQuickAddOpen(false);
              }
              return saved;
            }}
            onCancel={() => setQuickAddOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
