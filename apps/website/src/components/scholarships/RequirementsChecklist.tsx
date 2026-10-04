"use client";

import { cn } from "@/lib/utils";
import type { ScholarshipDetail } from "@/types/scholarships";
import { Check } from "lucide-react";
import { useSaveState } from "./SaveState";

/** Requirements become tickable once the scholarship is saved. */
export default function RequirementsChecklist({
  requirements,
}: {
  requirements: ScholarshipDetail["requirements"];
}) {
  const { state, toggleRequirement } = useSaveState();
  if (requirements.length === 0) return null;

  const done = new Set(state?.completedRequirementIds ?? []);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-slate-900">You&apos;ll need</p>
        {state ? (
          <p className="text-xs text-slate-500">
            {requirements.filter((r) => done.has(r.id)).length}/{requirements.length} done
          </p>
        ) : (
          <p className="text-xs text-slate-400">Save to tick these off</p>
        )}
      </div>
      <ul className="space-y-1">
        {requirements.map((req) => {
          const checked = done.has(req.id);
          const body = (
            <>
              <span
                className={cn(
                  "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border",
                  checked
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-white",
                )}
              >
                {checked && <Check className="h-3 w-3" />}
              </span>
              <span className="min-w-0">
                <span className={cn("block text-[15px] text-slate-800", checked && "text-slate-400 line-through")}>
                  {req.label}
                </span>
                {req.detail && (
                  <span className="block text-sm text-slate-500">{req.detail}</span>
                )}
              </span>
            </>
          );

          return (
            <li key={req.id}>
              {state ? (
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => toggleRequirement(req.id)}
                  className="flex w-full items-start gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                >
                  {body}
                </button>
              ) : (
                <div className="flex items-start gap-3 px-2 py-1.5">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
