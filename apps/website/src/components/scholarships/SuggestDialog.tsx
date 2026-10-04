"use client";

import BlogSignInDialog from "@/components/blogs-v2/BlogSignInDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

type SuggestDialogProps = {
  signedIn: boolean;
  triggerLabel: string;
  /** Set for "Report outdated info" on a detail page. */
  correction?: { scholarshipId: string; title: string };
};

const EMPTY = { title: "", url: "", deadline: "", notes: "" };

export default function SuggestDialog({ signedIn, triggerLabel, correction }: SuggestDialogProps) {
  const [open, setOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [values, setValues] = useState(EMPTY);
  const [sending, setSending] = useState(false);

  function openDialog() {
    if (!signedIn) {
      setSignInOpen(true);
      return;
    }
    setValues(correction ? { ...EMPTY, title: correction.title } : EMPTY);
    setOpen(true);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/scholarships/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          kind: correction ? "correction" : "new",
          ...(correction ? { scholarshipId: correction.scholarshipId } : {}),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error);
      toast.success(correction ? "Thanks — we'll check it" : "Thanks — we'll review it");
      setOpen(false);
    } catch (err) {
      toast.error((err instanceof Error && err.message) || "Couldn't send. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="font-medium text-blue-600 underline-offset-2 hover:text-blue-700 hover:underline"
      >
        {triggerLabel}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="tracking-normal sm:max-w-md">
          <form onSubmit={submit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {correction ? "Report outdated info" : "Suggest a scholarship"}
              </DialogTitle>
              <DialogDescription>
                {correction
                  ? "Tell us what's changed and we'll update it."
                  : "Our team checks every suggestion before it goes live."}
              </DialogDescription>
            </DialogHeader>

            {!correction && (
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Scholarship name</span>
                <Input required maxLength={160} value={values.title} onChange={set("title")} />
              </label>
            )}
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                {correction ? "Link to the updated info" : "Link"}{" "}
                <span className="font-normal text-slate-400">Optional</span>
              </span>
              <Input type="url" placeholder="https://" value={values.url} onChange={set("url")} />
            </label>
            {!correction && (
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Deadline <span className="font-normal text-slate-400">If you know it</span>
                </span>
                <Input maxLength={60} placeholder="e.g. 15 January" value={values.deadline} onChange={set("deadline")} />
              </label>
            )}
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                {correction ? "What's outdated?" : "Anything else"}{" "}
                {!correction && <span className="font-normal text-slate-400">Optional</span>}
              </span>
              <Textarea
                rows={3}
                maxLength={1000}
                required={Boolean(correction)}
                value={values.notes}
                onChange={set("notes")}
              />
            </label>

            <DialogFooter>
              <Button type="submit" disabled={sending} className="bg-blue-600 text-white hover:bg-blue-700">
                {sending ? "Sending…" : "Send"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <BlogSignInDialog
        open={signInOpen}
        onOpenChange={setSignInOpen}
        title="Sign in to send suggestions"
        description="We ask you to sign in so we can follow up if we have questions."
      />
    </>
  );
}
