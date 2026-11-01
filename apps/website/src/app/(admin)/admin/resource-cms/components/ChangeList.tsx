import { Badge } from "@/components/ui/badge";
import type { ResourceCmsGroupedChange } from "@/types/resources2";

function ValueBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "before" | "after";
}) {
  const isEmpty = !value.trim();
  return (
    <div
      className={
        tone === "before"
          ? "rounded-md border border-red-100 bg-red-50/70 p-3"
          : "rounded-md border border-emerald-100 bg-emerald-50/70 p-3"
      }
    >
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="whitespace-pre-wrap break-words text-sm text-slate-800">
        {isEmpty ? "(empty)" : value}
      </p>
    </div>
  );
}

/** Before/after view of a set of resource CMS changes. */
export default function ChangeList({
  changes,
  emptyText = "No content changes.",
}: {
  changes: ResourceCmsGroupedChange[];
  emptyText?: string;
}) {
  if (changes.length === 0) {
    return <p className="text-sm text-slate-500">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {changes.map((change, index) => (
        <div key={index} className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{change.sectionLabel}</Badge>
            {change.type === "added" && <Badge className="bg-emerald-600">Added</Badge>}
            {change.type === "removed" && <Badge variant="destructive">Removed</Badge>}
            {change.type === "modified" && <Badge variant="secondary">Updated</Badge>}
            <span className="font-medium text-slate-900">{change.label}</span>
          </div>

          {change.type === "modified" && (
            <div className="mt-3 space-y-3">
              {change.fields.map((field) => (
                <div key={field.field} className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {field.fieldLabel}
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <ValueBlock label="Before" value={field.before} tone="before" />
                    <ValueBlock label="After" value={field.after} tone="after" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
