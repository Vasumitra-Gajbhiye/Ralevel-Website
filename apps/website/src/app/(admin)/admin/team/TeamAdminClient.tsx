"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { AdminTeamMember } from "@/lib/data/admin/team";
import { resolveTeamImage } from "@/lib/resolveTeamImage";
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
import { GripVertical, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import MemberFormDialog, {
  type TeamMemberFormValues,
} from "./MemberFormDialog";

async function teamRequest(method: string, body: unknown) {
  const res = await fetch("/api/admin/team", {
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

function SortableMemberRow({
  member,
  onEdit,
  onDelete,
  onToggleHomepage,
}: {
  member: AdminTeamMember;
  onEdit: () => void;
  onDelete: () => void;
  onToggleHomepage: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: member._id });

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
        aria-label={`Reorder ${member.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <img
        src={resolveTeamImage(member.imgSrc, member.name)}
        alt=""
        className="h-12 w-12 shrink-0 rounded-full border border-neutral-200 object-cover"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-neutral-900">{member.name}</p>
        <p className="truncate text-sm text-neutral-500">{member.title}</p>
        <p className="mt-0.5 truncate text-xs text-neutral-400">
          Discord{member.linkedin ? " · LinkedIn" : ""}
        </p>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={
          member.showOnHomepage
            ? `Hide ${member.name} from homepage`
            : `Show ${member.name} on homepage`
        }
        onClick={onToggleHomepage}
        className={
          member.showOnHomepage
            ? "text-amber-500 hover:text-amber-600"
            : "text-neutral-400"
        }
      >
        <Star
          className="h-4 w-4"
          fill={member.showOnHomepage ? "currentColor" : "none"}
        />
      </Button>
      <Button type="button" variant="ghost" size="icon" onClick={onEdit}>
        <Pencil className="h-4 w-4" />
        <span className="sr-only">Edit {member.name}</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-neutral-500 hover:text-red-600"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete {member.name}</span>
      </Button>
    </div>
  );
}

export default function TeamAdminClient({
  initialMembers,
}: {
  initialMembers: AdminTeamMember[];
}) {
  const [members, setMembers] = useState(initialMembers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTeamMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminTeamMember | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(member: AdminTeamMember) {
    setEditing(member);
    setDialogOpen(true);
  }

  async function handleSave(values: TeamMemberFormValues) {
    setSaving(true);
    try {
      if (editing) {
        const result = await teamRequest("PATCH", {
          id: editing._id,
          ...values,
        });
        const updated = result.data as AdminTeamMember;
        setMembers((current) =>
          current.map((member) =>
            member._id === updated._id ? { ...member, ...updated } : member,
          ),
        );
        toast.success("Member updated");
      } else {
        const result = await teamRequest("POST", values);
        const created = result.data as AdminTeamMember;
        setMembers((current) => [...current, created]);
        toast.success("Member added");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save member",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleHomepage(member: AdminTeamMember) {
    const next = !member.showOnHomepage;
    setMembers((current) =>
      current.map((item) =>
        item._id === member._id ? { ...item, showOnHomepage: next } : item,
      ),
    );
    try {
      await teamRequest("PATCH", { id: member._id, showOnHomepage: next });
    } catch (error) {
      setMembers((current) =>
        current.map((item) =>
          item._id === member._id
            ? { ...item, showOnHomepage: member.showOnHomepage }
            : item,
        ),
      );
      toast.error(
        error instanceof Error ? error.message : "Failed to update homepage",
      );
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete._id;
    try {
      await teamRequest("DELETE", { id });
      setMembers((current) => current.filter((member) => member._id !== id));
      toast.success("Member removed");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete member",
      );
    } finally {
      setPendingDelete(null);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = members.findIndex((member) => member._id === active.id);
    const newIndex = members.findIndex((member) => member._id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const previous = members;
    const next = arrayMove(members, oldIndex, newIndex);
    setMembers(next);

    try {
      await teamRequest("PATCH", {
        orderedIds: next.map((member) => member._id),
      });
    } catch (error) {
      setMembers(previous);
      toast.error(
        error instanceof Error ? error.message : "Failed to save order",
      );
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Team</h1>
          <p className="text-sm text-neutral-500">
            Cards on /team. Star a member to also show them on the homepage.
          </p>
        </div>
        <Button type="button" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add member
        </Button>
      </div>

      {members.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-white px-6 py-16 text-center">
          <p className="mb-4 text-sm text-neutral-500">No team members yet</p>
          <Button type="button" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add member
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={members.map((member) => member._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {members.map((member) => (
                <SortableMemberRow
                  key={member._id}
                  member={member}
                  onEdit={() => openEdit(member)}
                  onDelete={() => setPendingDelete(member)}
                  onToggleHomepage={() => void handleToggleHomepage(member)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <MemberFormDialog
        open={dialogOpen}
        member={editing}
        saving={saving}
        onOpenChange={setDialogOpen}
        onSubmit={handleSave}
      />

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this member?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `${pendingDelete.name} will be removed from /team and the homepage.`
                : "This member will be removed from /team."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => void handleDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
