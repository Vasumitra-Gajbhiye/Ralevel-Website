"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cldImage } from "@/lib/cloudinary";
import type {
  FeaturedCard,
  ResourcesHomepageConfig,
  ResourceSubjectSummary,
} from "@/types/resources2";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import FeaturedCardDialog from "./FeaturedCardDialog";

function move<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function OrderButtons({
  index,
  count,
  onMove,
}: {
  index: number;
  count: number;
  onMove: (direction: -1 | 1) => void;
}) {
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onMove(-1)}
        disabled={index === 0}
        aria-label="Move up"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onMove(1)}
        disabled={index === count - 1}
        aria-label="Move down"
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
    </>
  );
}

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function HomepageEditorClient({
  initialConfig,
  subjects,
}: {
  initialConfig: ResourcesHomepageConfig;
  subjects: ResourceSubjectSummary[];
}) {
  const [featured, setFeatured] = useState(initialConfig.featured);
  const [popularSlugs, setPopularSlugs] = useState(initialConfig.popularSlugs);
  const [savedSignature, setSavedSignature] = useState(() =>
    JSON.stringify(initialConfig),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | undefined>();

  const subjectBySlug = new Map(subjects.map((s) => [s.slug, s]));
  const isDirty = JSON.stringify({ featured, popularSlugs }) !== savedSignature;

  function openDialog(index?: number) {
    setEditingIndex(index);
    setDialogOpen(true);
  }

  function handleCardSave(card: FeaturedCard) {
    if (editingIndex === undefined) {
      setFeatured((prev) => [...prev, card]);
    } else {
      setFeatured((prev) => prev.map((c, i) => (i === editingIndex ? card : c)));
    }
  }

  function handleCardDelete(index: number) {
    if (!confirm(`Delete "${featured[index].title}"?`)) return;
    setFeatured((prev) => prev.filter((_, i) => i !== index));
  }

  function togglePopular(slug: string, checked: boolean) {
    setPopularSlugs((prev) =>
      checked ? [...prev, slug] : prev.filter((s) => s !== slug),
    );
  }

  async function save() {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/resource-cms/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured, popularSlugs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");

      setFeatured(data.featured);
      setPopularSlugs(data.popularSlugs);
      setSavedSignature(
        JSON.stringify({ featured: data.featured, popularSlugs: data.popularSlugs }),
      );
      toast.success("Saved — live on /resources");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <a
            href="/admin/resource-cms"
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            ← Resource CMS
          </a>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Resources page
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Featured cards and popular subjects on{" "}
            <a
              href="/resources"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              /resources
            </a>
            . Changes go live when you save.
          </p>
        </div>
        <Button onClick={save} disabled={!isDirty || isSaving}>
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isDirty ? "Save" : "Saved"}
        </Button>
      </div>

      <Panel
        title="Featured"
        description="Shown as a horizontal row, in this order."
        action={
          <Button size="sm" onClick={() => openDialog()}>
            <Plus className="h-4 w-4" />
            Add card
          </Button>
        }
      >
        {featured.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No featured cards. The section is hidden until you add one.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {featured.map((card, index) => (
              <div
                key={`${card.href}-${index}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
              >
                <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                  {card.image && (
                    <Image
                      src={cldImage(card.image)}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {card.title}
                    {card.badge && (
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600">
                        {card.badge}
                      </span>
                    )}
                  </p>
                  <a
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full items-center gap-1 truncate text-xs text-blue-600 hover:underline"
                  >
                    <span className="truncate">{card.href}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
                <div className="flex shrink-0 items-center">
                  <OrderButtons
                    index={index}
                    count={featured.length}
                    onMove={(d) => setFeatured((prev) => move(prev, index, d))}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDialog(index)}
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCardDelete(index)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel
        title="Popular subjects"
        description="Shown to signed-out students and students with no subjects on their profile."
      >
        {popularSlugs.length > 0 && (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {popularSlugs.map((slug, index) => (
              <div
                key={slug}
                className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50"
              >
                <span className="w-5 text-xs text-slate-400">{index + 1}</span>
                <span className="flex-1 text-sm font-medium text-slate-900">
                  {subjectBySlug.get(slug)?.subject ?? slug}
                </span>
                <OrderButtons
                  index={index}
                  count={popularSlugs.length}
                  onMove={(d) => setPopularSlugs((prev) => move(prev, index, d))}
                />
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
          {subjects.map((subject) => {
            const id = `popular-${subject.slug}`;
            return (
              <label
                key={subject.slug}
                htmlFor={id}
                className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
              >
                <Checkbox
                  id={id}
                  checked={popularSlugs.includes(subject.slug)}
                  onCheckedChange={(checked) =>
                    togglePopular(subject.slug, checked === true)
                  }
                />
                {subject.subject}
              </label>
            );
          })}
        </div>
      </Panel>

      <FeaturedCardDialog
        open={dialogOpen}
        card={editingIndex === undefined ? undefined : featured[editingIndex]}
        onOpenChange={setDialogOpen}
        onSave={handleCardSave}
      />
    </div>
  );
}
