"use client";

import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { tasksApi } from "@/lib/tasks/client";
import type { SectionDTO, TaskDTO } from "@/lib/tasks/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export const NO_SECTION = "__none__";

type Columns = Record<string, string[]>;

function buildColumns(sections: SectionDTO[], tasks: TaskDTO[]): Columns {
  const columns: Columns = { [NO_SECTION]: [] };
  for (const s of sections) columns[s.id] = [];
  for (const t of [...tasks].sort((a, b) => a.order - b.order)) {
    const key = t.sectionId && columns[t.sectionId] ? t.sectionId : NO_SECTION;
    columns[key].push(t.id);
  }
  return columns;
}

/**
 * Drag tasks within and between sections (list and board views). The server
 * gets the destination section's full order on drop.
 */
export function useSectionDnd({
  listId,
  sections,
  tasks,
  onMoved,
}: {
  listId: string;
  sections: SectionDTO[];
  tasks: TaskDTO[];
  onMoved: () => void;
}) {
  const [columns, setColumns] = useState<Columns>(() => buildColumns(sections, tasks));
  const [activeId, setActiveId] = useState<string | null>(null);
  const snapshot = useRef<{ columns: Columns; from: string } | null>(null);

  useEffect(() => setColumns(buildColumns(sections, tasks)), [sections, tasks]);

  const byId = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const findContainer = (cols: Columns, id: string) =>
    id in cols ? id : Object.keys(cols).find((key) => cols[key].includes(id));

  const onDragStart = ({ active }: DragStartEvent) => {
    const id = String(active.id);
    setActiveId(id);
    snapshot.current = { columns, from: findContainer(columns, id) ?? NO_SECTION };
  };

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    setColumns((cols) => {
      const from = findContainer(cols, String(active.id));
      const to = findContainer(cols, String(over.id));
      if (!from || !to || from === to) return cols;
      const overIndex = cols[to].indexOf(String(over.id));
      const index = overIndex >= 0 ? overIndex : cols[to].length;
      return {
        ...cols,
        [from]: cols[from].filter((id) => id !== active.id),
        [to]: [...cols[to].slice(0, index), String(active.id), ...cols[to].slice(index)],
      };
    });
  };

  const revert = () => {
    if (snapshot.current) setColumns(snapshot.current.columns);
    snapshot.current = null;
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    const start = snapshot.current;
    snapshot.current = null;
    if (!over || !start) return revert();

    const id = String(active.id);
    const container = findContainer(columns, id);
    if (!container) return revert();

    let next = columns;
    const overContainer = findContainer(columns, String(over.id));
    if (overContainer === container) {
      const oldIndex = columns[container].indexOf(id);
      const newIndex = columns[container].indexOf(String(over.id));
      if (newIndex >= 0 && oldIndex !== newIndex) {
        next = { ...columns, [container]: arrayMove(columns[container], oldIndex, newIndex) };
        setColumns(next);
      }
    }

    const unchanged =
      container === start.from &&
      JSON.stringify(next[container]) === JSON.stringify(start.columns[container]);
    if (unchanged) return;

    tasksApi
      .moveTasks(listId, container === NO_SECTION ? null : container, next[container])
      .then(onMoved)
      .catch((e: Error) => {
        toast.error(e.message);
        setColumns(start.columns);
      });
  };

  return {
    columns,
    byId,
    activeTask: activeId ? byId.get(activeId) ?? null : null,
    sensors,
    handlers: { onDragStart, onDragOver, onDragEnd, onDragCancel: revert },
  };
}
