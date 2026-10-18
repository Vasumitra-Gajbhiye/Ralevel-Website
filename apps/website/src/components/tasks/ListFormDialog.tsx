"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { tasksApi } from "@/lib/tasks/client";
import { TASK_COLOR_KEYS, TASK_COLORS } from "@/lib/tasks/colors";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/** Create a department list, or rename/recolour an existing one. */
export function ListFormDialog({
  open,
  onOpenChange,
  departmentKey,
  departmentName,
  list,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentKey?: string;
  departmentName?: string;
  list?: { id: string; name: string; color: string };
}) {
  const router = useRouter();
  const [name, setName] = useState(list?.name ?? "");
  const [color, setColor] = useState(list?.color ?? "blue");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(list?.name ?? "");
      setColor(list?.color ?? "blue");
    }
  }, [open, list?.name, list?.color]);

  const save = async () => {
    const value = name.trim();
    if (!value) return;
    setSaving(true);
    try {
      if (list) {
        await tasksApi.updateList(list.id, { name: value, color });
        router.refresh();
      } else if (departmentKey) {
        const { id } = await tasksApi.createList({ departmentKey, name: value, color });
        router.push(`/tasks/l/${id}`);
        router.refresh();
      }
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm tracking-normal">
        <DialogHeader>
          <DialogTitle>{list ? "Edit list" : `New list${departmentName ? ` in ${departmentName}` : ""}`}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
          className="space-y-4"
        >
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-gray-600">Name</span>
            <Input autoFocus value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="e.g. Exam season posts" />
          </label>
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-gray-600">Colour</span>
            <div className="flex flex-wrap gap-2">
              {TASK_COLOR_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-label={key}
                  aria-pressed={color === key}
                  onClick={() => setColor(key)}
                  className={cn(
                    "h-6 w-6 rounded-full ring-offset-2 transition",
                    TASK_COLORS[key].dot,
                    color === key ? "ring-2 ring-gray-900" : "hover:ring-2 hover:ring-gray-300",
                  )}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || saving}>
              {list ? "Save" : "Create list"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
