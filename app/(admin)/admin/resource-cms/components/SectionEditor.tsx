"use client";

import { Button } from "@/components/ui/button";
import type { EditableSection } from "@/types/resources2";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import ItemFormDialog from "./ItemFormDialog";

type SectionEditorProps = {
  section: EditableSection;
  items: Record<string, unknown>[];
  onChange: (items: Record<string, unknown>[]) => void;
};

const SECTION_TITLES: Record<EditableSection, string> = {
  syllabus: "Syllabus & Specification",
  notes: "Notes & Summaries",
  worksheets: "Worksheets & Topical Past Papers",
  tools: "Tools & Utilities",
};

function getItemTitle(section: EditableSection, item: Record<string, unknown>) {
  if (section === "tools") return String(item.name ?? "Untitled");
  return String(item.title ?? "Untitled");
}

function getItemMeta(section: EditableSection, item: Record<string, unknown>) {
  switch (section) {
    case "syllabus":
      return String(item.board ?? "");
    case "notes":
      return String(item.source ?? "");
    case "worksheets":
      return [item.board, item.topic].filter(Boolean).join(" · ");
    case "tools":
      return String(item.description ?? "");
    default:
      return "";
  }
}

function getItemLink(section: EditableSection, item: Record<string, unknown>) {
  return String(section === "tools" ? item.url : item.link ?? "");
}

export default function SectionEditor({
  section,
  items,
  onChange,
}: SectionEditorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | undefined>();

  function openAdd() {
    setEditingIndex(undefined);
    setDialogOpen(true);
  }

  function openEdit(index: number) {
    setEditingIndex(index);
    setDialogOpen(true);
  }

  function handleSave(item: Record<string, unknown>, index?: number) {
    if (index === undefined) {
      onChange([...items, item]);
      return;
    }
    const next = [...items];
    next[index] = item;
    onChange(next);
  }

  function handleDelete(index: number) {
    const title = getItemTitle(section, items[index]);
    if (!confirm(`Delete "${title}"?`)) return;
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {SECTION_TITLES[section]}
          </h2>
          <p className="text-sm text-slate-500">
            {items.length} item{items.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add item
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">No items yet.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={openAdd}>
            Add first item
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="divide-y divide-slate-100">
            {items.map((item, index) => (
              <div
                key={`${section}-${index}`}
                className="flex items-start justify-between gap-4 px-4 py-3 hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {getItemTitle(section, item)}
                  </p>
                  {getItemMeta(section, item) && (
                    <p className="truncate text-xs text-slate-500">
                      {getItemMeta(section, item)}
                    </p>
                  )}
                  <a
                    href={getItemLink(section, item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block truncate text-xs text-blue-600 hover:underline"
                  >
                    {getItemLink(section, item)}
                  </a>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(index)}
                    aria-label="Edit item"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(index)}
                    aria-label="Delete item"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ItemFormDialog
        open={dialogOpen}
        section={section}
        item={editingIndex !== undefined ? items[editingIndex] : undefined}
        itemIndex={editingIndex}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />
    </div>
  );
}
