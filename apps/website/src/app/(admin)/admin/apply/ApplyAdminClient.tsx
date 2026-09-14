"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getApplyCardIcon } from "@/lib/apply-cards";
import type { AdminApplyCard } from "@/lib/data/admin/applyCards";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ApplyCardFormDialog, {
  type ApplyCardFormValues,
} from "./ApplyCardFormDialog";

async function applyCardsRequest(method: string, body: unknown) {
  const res = await fetch("/api/admin/apply", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Request failed",
    );
  }
  return data;
}

function SortableCardRow({
  card,
  onEdit,
}: {
  card: AdminApplyCard;
  onEdit: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card._id });
  const Icon = getApplyCardIcon(card.icon);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`flex items-center gap-3 rounded-lg border bg-white p-3 shadow-sm ${
        isDragging ? "z-10 opacity-70 shadow-md" : ""
      }`}
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 active:cursor-grabbing"
        aria-label={`Reorder ${card.title}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r text-white ${card.gradient}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-neutral-900">{card.title}</p>
        <p className="truncate text-sm text-neutral-500">/apply/{card.slug}</p>
      </div>

      <Badge variant={card.status === "open" ? "default" : "secondary"}>
        {card.status === "open" ? "Open" : "Coming soon"}
      </Badge>

      <Button type="button" variant="ghost" size="icon" onClick={onEdit}>
        <Pencil className="h-4 w-4" />
        <span className="sr-only">Edit {card.title}</span>
      </Button>
    </div>
  );
}

export default function ApplyAdminClient({
  initialCards,
}: {
  initialCards: AdminApplyCard[];
}) {
  const [cards, setCards] = useState(initialCards);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminApplyCard | null>(null);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function openEdit(card: AdminApplyCard) {
    setEditing(card);
    setDialogOpen(true);
  }

  async function handleSave(values: ApplyCardFormValues) {
    if (!editing) return;
    setSaving(true);
    try {
      const result = await applyCardsRequest("PATCH", {
        id: editing._id,
        ...values,
      });
      const updated = result.data as AdminApplyCard;
      setCards((current) =>
        current.map((card) =>
          card._id === updated._id ? { ...card, ...updated } : card,
        ),
      );
      toast.success("Card updated");
      setDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save card",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = cards.findIndex((card) => card._id === active.id);
    const newIndex = cards.findIndex((card) => card._id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const previous = cards;
    const next = arrayMove(cards, oldIndex, newIndex);
    setCards(next);

    try {
      await applyCardsRequest("PATCH", {
        orderedIds: next.map((card) => card._id),
      });
    } catch (error) {
      setCards(previous);
      toast.error(
        error instanceof Error ? error.message : "Failed to save order",
      );
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Apply cards</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Reorder and edit the listing cards on /apply. Open/soon is display
          only — close applications from Form submission.
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-white px-6 py-16 text-center">
          <p className="text-sm text-neutral-500">No apply cards found</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={cards.map((card) => card._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {cards.map((card) => (
                <SortableCardRow
                  key={card._id}
                  card={card}
                  onEdit={() => openEdit(card)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ApplyCardFormDialog
        open={dialogOpen}
        card={editing}
        saving={saving}
        onOpenChange={setDialogOpen}
        onSubmit={handleSave}
      />
    </div>
  );
}
