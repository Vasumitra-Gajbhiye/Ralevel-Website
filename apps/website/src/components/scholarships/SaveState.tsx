"use client";

import BlogSignInDialog from "@/components/blogs-v2/BlogSignInDialog";
import type { TrackerStatus } from "@/lib/scholarships/constants";
import { cn } from "@/lib/utils";
import type { SaveState } from "@/types/scholarships";
import { Bookmark } from "lucide-react";
import posthog from "posthog-js";
import { createContext, useContext, useState } from "react";
import { toast } from "sonner";

type SaveContextValue = {
  state: SaveState | null;
  signedIn: boolean;
  pending: boolean;
  toggleSave: () => void;
  setStatus: (status: TrackerStatus) => void;
  toggleRequirement: (requirementId: string) => void;
};

const SaveContext = createContext<SaveContextValue | null>(null);

async function callSaves(method: string, body: Record<string, unknown>) {
  const res = await fetch("/api/scholarships/saves", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Something went wrong");
  return data?.data as SaveState | undefined;
}

/** Optimistic save/tracker state for one scholarship. */
export function SaveStateProvider({
  scholarshipId,
  initialState,
  signedIn,
  children,
}: {
  scholarshipId: string;
  initialState: SaveState | null;
  signedIn: boolean;
  children: React.ReactNode;
}) {
  const [state, setState] = useState(initialState);
  const [pending, setPending] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  async function run(next: SaveState | null, method: string, body: Record<string, unknown>) {
    const previous = state;
    setState(next);
    setPending(true);
    try {
      const confirmed = await callSaves(method, { scholarshipId, ...body });
      if (next && confirmed) setState(confirmed);
      return true;
    } catch (err) {
      setState(previous);
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      return false;
    } finally {
      setPending(false);
    }
  }

  async function toggleSave() {
    if (!signedIn) {
      setSignInOpen(true);
      return;
    }
    if (pending) return;
    if (state) {
      await run(null, "DELETE", {});
    } else if (await run({ status: "saved", completedRequirementIds: [] }, "POST", {})) {
      posthog.capture("scholarship_saved", { scholarship_id: scholarshipId });
    }
  }

  function setStatus(status: TrackerStatus) {
    if (!state) return;
    posthog.capture("scholarship_status_changed", { scholarship_id: scholarshipId, status });
    void run({ ...state, status }, "PATCH", { status });
  }

  function toggleRequirement(requirementId: string) {
    if (!state) return;
    const done = state.completedRequirementIds.includes(requirementId)
      ? state.completedRequirementIds.filter((id) => id !== requirementId)
      : [...state.completedRequirementIds, requirementId];
    void run({ ...state, completedRequirementIds: done }, "PATCH", {
      completedRequirementIds: done,
    });
  }

  return (
    <SaveContext.Provider
      value={{ state, signedIn, pending, toggleSave, setStatus, toggleRequirement }}
    >
      {children}
      <BlogSignInDialog
        open={signInOpen}
        onOpenChange={setSignInOpen}
        title="Sign in to save scholarships"
        description="Save scholarships, track your applications and tick off requirements as you go."
      />
    </SaveContext.Provider>
  );
}

export function useSaveState(): SaveContextValue {
  const ctx = useContext(SaveContext);
  if (!ctx) throw new Error("useSaveState must be used inside <SaveStateProvider>");
  return ctx;
}

export function SaveButton({
  variant = "icon",
  className,
}: {
  variant?: "icon" | "button";
  className?: string;
}) {
  const { state, toggleSave } = useSaveState();
  const saved = Boolean(state);
  const label = saved ? "Saved" : "Save";

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={toggleSave}
        aria-pressed={saved}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
          saved
            ? "border-blue-200 bg-blue-50 text-blue-700"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
          className,
        )}
      >
        <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleSave}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save scholarship"}
      title={saved ? "Remove from saved" : "Save"}
      className={cn(
        "relative z-10 rounded-full p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
        saved ? "text-blue-600" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
        className,
      )}
    >
      <Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
    </button>
  );
}
