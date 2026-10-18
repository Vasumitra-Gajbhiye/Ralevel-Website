"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ListPageData } from "@/lib/data/tasks/lists";
import { tasksApi } from "@/lib/tasks/client";
import { getDepartment } from "@/lib/tasks/departments";
import type { SectionDTO, TaskDTO } from "@/lib/tasks/types";
import { cn } from "@/lib/utils";
import {
  Archive,
  ArchiveRestore,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Columns3,
  List as ListIcon,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { InlineAddTask } from "./AddTask";
import { ColorDot, EmptyState } from "./bits";
import { ListFormDialog } from "./ListFormDialog";
import { TaskRow } from "./TaskRow";
import { useTasksUI } from "./TasksContext";
import { NO_SECTION, useSectionDnd } from "./useSectionDnd";

type View = "list" | "board";

export function ListPage({ data, view }: { data: ListPageData; view: View }) {
  const { list, sections, tasks, completed, completedCount } = data;
  const { refresh } = useTasksUI();
  const searchParams = useSearchParams();
  const showCompleted = searchParams.get("completed") === "1";
  const canManage = list.canManage && !list.archived;
  const dnd = useSectionDnd({ listId: list.id, sections, tasks, onMoved: refresh });

  const empty = tasks.length === 0 && sections.length === 0;

  return (
    <div className={cn("px-4 py-6 md:px-8", view === "list" && "mx-auto max-w-3xl")}>
      <ListHeader data={data} view={view} showCompleted={showCompleted} />

      {list.archived && (
        <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          This list is archived. Unarchive it from the ••• menu to add tasks.
        </p>
      )}

      <DndContext sensors={dnd.sensors} collisionDetection={closestCorners} {...dnd.handlers}>
        {view === "list" ? (
          <div className="space-y-6">
            <SectionBlock
              id={NO_SECTION}
              listId={list.id}
              taskIds={dnd.columns[NO_SECTION] ?? []}
              byId={dnd.byId}
              canManage={canManage}
              hideHeader
            />
            {sections.map((section, i) => (
              <SectionBlock
                key={section.id}
                id={section.id}
                section={section}
                listId={list.id}
                taskIds={dnd.columns[section.id] ?? []}
                byId={dnd.byId}
                canManage={canManage}
                neighbours={{ sections, index: i }}
              />
            ))}
          </div>
        ) : (
          <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-6 md:-mx-8 md:px-8">
            {((dnd.columns[NO_SECTION]?.length ?? 0) > 0 || sections.length === 0) && (
              <BoardColumn id={NO_SECTION} listId={list.id} taskIds={dnd.columns[NO_SECTION] ?? []} byId={dnd.byId} canManage={canManage} />
            )}
            {sections.map((section, i) => (
              <BoardColumn
                key={section.id}
                id={section.id}
                section={section}
                listId={list.id}
                taskIds={dnd.columns[section.id] ?? []}
                byId={dnd.byId}
                canManage={canManage}
                neighbours={{ sections, index: i }}
              />
            ))}
            {canManage && (
              <div className="w-72 shrink-0">
                <AddSection listId={list.id} />
              </div>
            )}
          </div>
        )}
        <DragOverlay>{dnd.activeTask ? <TaskRow task={dnd.activeTask} dragging /> : null}</DragOverlay>
      </DndContext>

      {view === "list" && canManage && (
        <div className="mt-6">
          <AddSection listId={list.id} />
        </div>
      )}

      {empty && !canManage && <EmptyState title="Nothing here yet" hint="Tasks added by your department head will show up here." />}

      {showCompleted && (
        <section className="mt-10">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <CheckCircle2 className="h-4 w-4 text-gray-400" /> Completed
            <span className="font-normal text-gray-400">{completedCount}</span>
          </h2>
          {completed.length ? (
            completed.map((t) => <TaskRow key={t.id} task={t} />)
          ) : (
            <p className="py-3 text-sm text-gray-500">No completed tasks yet.</p>
          )}
        </section>
      )}
    </div>
  );
}

/* --------------------------------- Header --------------------------------- */

function ListHeader({ data, view, showCompleted }: { data: ListPageData; view: View; showCompleted: boolean }) {
  const { list, completedCount } = data;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [editing, setEditing] = useState(false);
  const dept = list.departmentKey ? getDepartment(list.departmentKey) : null;

  const hrefWith = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) params.delete(key);
    else params.set(key, value);
    params.delete("task");
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const setArchived = async (archived: boolean) => {
    try {
      await tasksApi.updateList(list.id, { archived });
      toast.success(archived ? "List archived" : "List restored");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const setDefaultView = async (defaultView: View) => {
    try {
      await tasksApi.updateList(list.id, { defaultView });
      toast.success(`Opens as ${defaultView} by default`);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <header className="mb-5 flex flex-wrap items-end gap-3">
      <div className="min-w-0">
        {dept && (
          <Link href={`/tasks/d/${dept.key}`} className="text-xs text-gray-500 hover:text-gray-800">
            {dept.name}
          </Link>
        )}
        <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          {list.kind === "department" && <ColorDot color={list.color} className="h-2.5 w-2.5" />}
          <span className="truncate">{list.kind === "inbox" ? "Inbox" : list.name}</span>
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <div className="flex rounded-md border border-gray-200 p-0.5" role="group" aria-label="View">
          {(["list", "board"] as const).map((v) => (
            <Link
              key={v}
              href={hrefWith("view", v)}
              scroll={false}
              aria-pressed={view === v}
              className={cn(
                "inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs",
                view === v ? "bg-gray-100 font-medium text-gray-900" : "text-gray-500 hover:text-gray-900",
              )}
            >
              {v === "list" ? <ListIcon className="h-3.5 w-3.5" /> : <Columns3 className="h-3.5 w-3.5" />}
              <span className="capitalize">{v}</span>
            </Link>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label="List actions" className="rounded p-1.5 text-gray-500 hover:bg-gray-100">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onSelect={() => router.push(hrefWith("completed", showCompleted ? null : "1"), { scroll: false })}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {showCompleted ? "Hide completed" : `Show completed${completedCount ? ` (${completedCount})` : ""}`}
            </DropdownMenuItem>
            {list.canManage && (
              <>
                <DropdownMenuItem onSelect={() => void setDefaultView(view)} disabled={list.defaultView === view}>
                  {view === "list" ? <ListIcon className="mr-2 h-4 w-4" /> : <Columns3 className="mr-2 h-4 w-4" />}
                  Open as {view} by default
                </DropdownMenuItem>
                {list.kind === "department" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setEditing(true)}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit list
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => void setArchived(!list.archived)}>
                      {list.archived ? <ArchiveRestore className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
                      {list.archived ? "Unarchive" : "Archive"}
                    </DropdownMenuItem>
                  </>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {list.kind === "department" && (
        <ListFormDialog open={editing} onOpenChange={setEditing} list={{ id: list.id, name: list.name, color: list.color }} />
      )}
    </header>
  );
}

/* -------------------------------- Sections -------------------------------- */

type SectionProps = {
  id: string;
  section?: SectionDTO;
  listId: string;
  taskIds: string[];
  byId: Map<string, TaskDTO>;
  canManage: boolean;
  hideHeader?: boolean;
  neighbours?: { sections: SectionDTO[]; index: number };
};

function SortableTask({ task, disabled, card }: { task: TaskDTO; disabled: boolean; card?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, disabled });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "opacity-30")}
      {...attributes}
      {...listeners}
      // The row itself is a button; keep dnd-kit's role from overriding it.
      role={undefined}
      tabIndex={undefined}
    >
      <TaskRow
        task={task}
        className={card ? "rounded-lg border border-gray-200 bg-white px-2.5 shadow-sm hover:bg-white hover:shadow" : undefined}
      />
    </div>
  );
}

function DropZone({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={cn(className, isOver && "rounded-md bg-gray-50")}>
      {children}
    </div>
  );
}

function SectionBlock({ id, section, listId, taskIds, byId, canManage, hideHeader, neighbours }: SectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const tasks = taskIds.map((tid) => byId.get(tid)).filter((t): t is TaskDTO => Boolean(t));

  return (
    <section>
      {!hideHeader && section && (
        <SectionHeader
          section={section}
          count={tasks.length}
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          canManage={canManage}
          neighbours={neighbours}
        />
      )}
      {!collapsed && (
        <>
          <SortableContext id={id} items={taskIds} strategy={verticalListSortingStrategy}>
            <DropZone id={id} className={cn(tasks.length === 0 && canManage && !hideHeader && "min-h-2")}>
              {tasks.map((t) => (
                <SortableTask key={`${t.id}-${t.dueOn}`} task={t} disabled={!canManage} />
              ))}
            </DropZone>
          </SortableContext>
          {canManage && <InlineAddTask listId={listId} sectionId={section?.id ?? null} />}
        </>
      )}
    </section>
  );
}

function BoardColumn({ id, section, listId, taskIds, byId, canManage, neighbours }: SectionProps) {
  const tasks = taskIds.map((tid) => byId.get(tid)).filter((t): t is TaskDTO => Boolean(t));
  return (
    <section className="flex w-72 shrink-0 snap-start flex-col">
      {section ? (
        <SectionHeader section={section} count={tasks.length} canManage={canManage} neighbours={neighbours} board />
      ) : (
        <h2 className="mb-2 flex items-center gap-2 px-1 text-sm font-semibold text-gray-800">
          No section <span className="font-normal text-gray-400">{tasks.length}</span>
        </h2>
      )}
      <SortableContext id={id} items={taskIds} strategy={verticalListSortingStrategy}>
        <DropZone id={id} className="flex min-h-[60px] flex-col gap-2 rounded-lg">
          {tasks.map((t) => (
            <SortableTask key={`${t.id}-${t.dueOn}`} task={t} disabled={!canManage} card />
          ))}
        </DropZone>
      </SortableContext>
      {canManage && <InlineAddTask listId={listId} sectionId={section?.id ?? null} />}
    </section>
  );
}

function SectionHeader({
  section,
  count,
  collapsed,
  onToggle,
  canManage,
  neighbours,
  board,
}: {
  section: SectionDTO;
  count: number;
  collapsed?: boolean;
  onToggle?: () => void;
  canManage: boolean;
  neighbours?: { sections: SectionDTO[]; index: number };
  board?: boolean;
}) {
  const { refresh } = useTasksUI();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(section.name);

  const act = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const move = (delta: -1 | 1) => {
    if (!neighbours) return;
    const ids = neighbours.sections.map((s) => s.id);
    const target = neighbours.index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[neighbours.index], ids[target]] = [ids[target], ids[neighbours.index]];
    void act(() => tasksApi.reorderSections(section.listId, ids));
  };

  return (
    <div className={cn("group mb-1 flex items-center gap-1.5 border-b border-gray-200 pb-1.5", board && "border-b-0 px-1")}>
      {!board && (
        <button type="button" onClick={onToggle} aria-label={collapsed ? "Expand section" : "Collapse section"} className="text-gray-400 hover:text-gray-700">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      )}
      {renaming ? (
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setRenaming(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setRenaming(false);
            if (e.key === "Enter" && name.trim()) {
              setRenaming(false);
              void act(() => tasksApi.renameSection(section.id, name.trim()));
            }
          }}
          className="flex-1 rounded border border-gray-300 px-1.5 text-sm font-semibold outline-none"
        />
      ) : (
        <h2 className="text-sm font-semibold text-gray-800">{section.name}</h2>
      )}
      <span className="text-xs text-gray-400">{count}</span>
      {canManage && !renaming && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Section actions"
              className="ml-auto rounded p-1 text-gray-400 opacity-0 hover:bg-gray-100 group-hover:opacity-100 data-[state=open]:opacity-100 focus:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => {
                setName(section.name);
                setRenaming(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!neighbours || neighbours.index === 0} onSelect={() => move(-1)}>
              <ArrowUp className="mr-2 h-4 w-4" /> Move {board ? "left" : "up"}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!neighbours || neighbours.index === neighbours.sections.length - 1}
              onSelect={() => move(1)}
            >
              <ArrowDown className="mr-2 h-4 w-4" /> Move {board ? "right" : "down"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onSelect={() => {
                if (window.confirm(`Delete “${section.name}”? Its tasks move to the top of the list.`)) {
                  void act(() => tasksApi.deleteSection(section.id));
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete section
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function AddSection({ listId }: { listId: string }) {
  const { refresh } = useTasksUI();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const add = async () => {
    if (!name.trim()) return;
    try {
      await tasksApi.createSection(listId, name.trim());
      setName("");
      setOpen(false);
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 py-1 text-sm text-gray-400 hover:text-gray-800"
      >
        <span className="h-px flex-1 bg-gray-200" />
        <Plus className="h-3.5 w-3.5" /> Add section
        <span className="h-px flex-1 bg-gray-200" />
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void add();
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Section name"
        className="h-8 flex-1 rounded-md border border-gray-300 px-2 text-sm font-medium outline-none focus:border-gray-400"
      />
      <button type="button" onClick={() => void add()} className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50" disabled={!name.trim()}>
        Add
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-gray-500 hover:text-gray-900">
        Cancel
      </button>
    </div>
  );
}
