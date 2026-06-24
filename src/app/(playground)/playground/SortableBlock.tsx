"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import AddBlockMenu from "./AddBlockMenu";

export default function SortableBlock({
  id,
  children,
  onDelete,
  onAddBelow,
}: {
  id: string;
  children: React.ReactNode;
  onDelete: () => void;
  onAddBelow: (block: any) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-start gap-2 mb-3"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-2 cursor-grab text-gray-400 hover:text-gray-600"
      >
        <GripVertical size={18} />
      </button>

      {/* Block content */}
      <div className="flex-1">{children}</div>

      {/* Delete */}
      <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition">
        <AddBlockMenu onAdd={onAddBelow} />

        <button onClick={onDelete} className="text-red-400 hover:text-red-600">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
