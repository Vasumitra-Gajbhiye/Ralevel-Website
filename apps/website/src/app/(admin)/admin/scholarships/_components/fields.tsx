"use client";

import AddPicker from "@/components/profile/AddPicker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cldImage } from "@/lib/cloudinary";
import { ANY_COUNTRY } from "@/lib/scholarships/constants";
import { COUNTRIES, countryName } from "@/lib/scholarships/countries";
import { cn } from "@/lib/utils";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical, Loader2, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";

/* --------------------------------- Layout ---------------------------------- */

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-5 py-8 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-10">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  error,
  optional,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {optional && <span className="ml-1.5 font-normal text-slate-400">Optional</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

/* --------------------------------- Inputs ---------------------------------- */

export function PillMultiSelect<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T[];
  onChange: (value: T[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const on = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            onClick={() =>
              onChange(on ? value.filter((v) => v !== option.value) : [...value, option.value])
            }
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
              on
                ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
            )}
          >
            {on && <Check className="h-3.5 w-3.5" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function CountryMultiField({
  value,
  onChange,
  allowAny = false,
  addLabel = "Add country",
}: {
  value: string[];
  onChange: (value: string[]) => void;
  allowAny?: boolean;
  addLabel?: string;
}) {
  const taken = new Set(value);
  const options = [
    ...(allowAny && !taken.has(ANY_COUNTRY) ? [{ value: ANY_COUNTRY, label: "Any country" }] : []),
    ...COUNTRIES.filter((c) => !taken.has(c.code)).map((c) => ({ value: c.code, label: c.name })),
  ];

  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {value.map((code) => (
            <li
              key={code}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 py-1 pl-3 pr-1 text-sm text-slate-700"
            >
              {code === ANY_COUNTRY ? "Any country" : countryName(code)}
              <button
                type="button"
                aria-label={`Remove ${countryName(code)}`}
                onClick={() => onChange(value.filter((c) => c !== code))}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <AddPicker
        label={addLabel}
        searchPlaceholder="Search countries"
        emptyText="No countries found."
        groups={[{ heading: "Countries", options }]}
        onSelect={(code) => onChange([...value, code])}
      />
    </div>
  );
}

/** One item per line; keeps its own text so blank lines can be typed. */
export function LinesTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  id,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  rows?: number;
  id?: string;
}) {
  // Seeded once from the form; the editor never replaces these from outside.
  const [text, setText] = useState(() => value.join("\n"));

  return (
    <Textarea
      id={id}
      rows={rows}
      value={text}
      placeholder={placeholder}
      onChange={(e) => {
        setText(e.target.value);
        onChange(
          e.target.value
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean),
        );
      }}
    />
  );
}

export function NumberInput({
  value,
  onChange,
  placeholder,
  id,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  id?: string;
}) {
  return (
    <Input
      id={id}
      type="number"
      inputMode="numeric"
      min={0}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
    />
  );
}

export function LogoField({
  value,
  onChange,
  uploadKey,
}: {
  value: string;
  onChange: (path: string) => void;
  uploadKey: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("key", uploadKey || "logo");
      const res = await fetch("/api/admin/scholarships/upload-logo", { method: "POST", body });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      onChange(data.path);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200">
        {value ? (
          <Image src={cldImage(value)} alt="" width={56} height={56} className="h-14 w-14 object-contain" />
        ) : (
          <span className="text-xs text-slate-400">None</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-slate-400"
      >
        {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
        {value ? "Replace" : "Upload logo"}
      </button>
      {value && !uploading && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          Remove
        </button>
      )}
    </div>
  );
}

/* ----------------------------- Sortable lists ------------------------------ */

type RowItem = { key: string };

function SortableRow({
  id,
  children,
  onRemove,
}: {
  id: string;
  children: React.ReactNode;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-2",
        isDragging && "z-10 shadow-md",
      )}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        className="mt-2 cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1 space-y-2">{children}</div>
      <button
        type="button"
        aria-label="Remove"
        onClick={onRemove}
        className="mt-1.5 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}

/**
 * Reorderable list of {title/label, detail} rows, driven by react-hook-form's
 * useFieldArray (`fields` carry a stable `id`).
 */
export function SortableFieldList({
  fields,
  onMove,
  onRemove,
  onAdd,
  addLabel,
  renderRow,
}: {
  fields: (RowItem | { id: string })[];
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  addLabel: string;
  renderRow: (index: number) => React.ReactNode;
}) {
  const dndId = useId();
  const ids = fields.map((f) => ("id" in f ? f.id : f.key));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onMove(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
  }

  return (
    <div className="space-y-2">
      {fields.length > 0 && (
        <DndContext id={dndId} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {ids.map((id, index) => (
                <SortableRow key={id} id={id} onRemove={() => onRemove(index)}>
                  {renderRow(index)}
                </SortableRow>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  );
}

export { arrayMove };
