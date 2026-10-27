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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PendingDot } from "./shared";

export function UnsavedBar({
  count,
  onDiscard,
  onReview,
}: {
  count: number;
  onDiscard: () => void;
  onReview: () => void;
}) {
  const label = count === 1 ? "1 unsaved change" : `${count} unsaved changes`;

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {count > 0 ? label : ""}
      </p>
      {count > 0 && (
        // md:left-64 keeps the bar clear of the admin sidebar (w-64).
        <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:left-64 md:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
              <PendingDot className="h-2 w-2" />
              {label}
            </p>
            <div className="flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Discard
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Discard {label}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Every page goes back to its saved access. This can&apos;t be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep editing</AlertDialogCancel>
                    <AlertDialogAction onClick={onDiscard}>Discard</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                size="sm"
                onClick={onReview}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Review &amp; save
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
