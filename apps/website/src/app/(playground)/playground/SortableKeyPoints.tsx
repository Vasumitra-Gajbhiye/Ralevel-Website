import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableKeyPoint({
  id,
  value,
  onChange,
  onDelete,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <span
        {...listeners}
        {...attributes}
        className="cursor-grab text-gray-400"
      >
        ⋮⋮
      </span>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 border rounded px-2 py-1 text-sm"
      />

      <button onClick={onDelete} className="text-red-500 hover:text-red-600">
        🗑
      </button>
    </div>
  );
}
