"use client";

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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  decisionEmailHtml,
  type DecisionStatus,
} from "@/lib/emails/decisionEmail";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export type SubmissionDecision = {
  status: DecisionStatus;
  sentAt: string;
  sentByAdminId: string;
  sentByAdminName: string;
  email: {
    subject: string;
    body: string;
    wasPersonalized: boolean;
    templateSubject: string;
    templateBody: string;
  };
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decision: DecisionStatus;
  submissionId: string;
  submitterEmail?: string | null;
  initialSubject: string;
  initialBody: string;
  onSent: (decision: SubmissionDecision) => void;
};

export default function DecisionEmailModal({
  open,
  onOpenChange,
  decision,
  submissionId,
  submitterEmail,
  initialSubject,
  initialBody,
  onSent,
}: Props) {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    if (open) {
      setSubject(initialSubject);
      setBody(initialBody);
      setTab("edit");
    }
  }, [open, initialSubject, initialBody]);

  const previewHtml = useMemo(
    () => decisionEmailHtml({ decision, body }),
    [decision, body],
  );

  const handleSend = async () => {
    if (!submitterEmail) {
      toast.error("This submission has no email address");
      return;
    }
    if (!subject.trim() || !body.trim()) {
      toast.error("Subject and body are required");
      return;
    }

    try {
      setSending(true);
      const res = await fetch("/api/forms/submissions/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          decision,
          subject: subject.trim(),
          body: body.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to send");
        return;
      }
      onSent(json.decision);
      toast.success(
        decision === "accepted"
          ? "Acceptance email sent"
          : "Decline email sent",
      );
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSending(false);
    }
  };

  const title =
    decision === "accepted" ? "Accept application" : "Decline application";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <div className="space-y-4 px-6 pt-6 pb-4">
          <DialogHeader className="space-y-2 pr-6">
            <DialogTitle className="text-xl">{title}</DialogTitle>
            <DialogDescription>
              Sending to{" "}
              <span className="font-medium text-foreground">
                {submitterEmail || "unknown"}
              </span>
              . You can edit the message before it goes out.
            </DialogDescription>
          </DialogHeader>

          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wide">
              To
            </span>
            <span className="font-medium text-foreground">
              {submitterEmail || "No email on file"}
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2">
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as "edit" | "preview")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="mt-5 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="decision-subject">Subject</Label>
                <Input
                  id="decision-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="decision-body">Message</Label>
                <Textarea
                  id="decision-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-h-[240px] resize-y text-sm leading-relaxed"
                />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-5">
              <div className="overflow-hidden rounded-xl border bg-muted/40">
                <div className="border-b bg-background/80 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Subject · </span>
                  <span className="font-medium text-foreground">
                    {subject.trim() || "(empty)"}
                  </span>
                </div>
                <iframe
                  title="Email preview"
                  srcDoc={previewHtml}
                  className="h-[420px] w-full bg-white"
                  sandbox=""
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="gap-3 border-t bg-muted/20 px-6 py-4 sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground sm:order-first">
            This decision is final.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={sending || !submitterEmail}
              variant={decision === "rejected" ? "destructive" : "default"}
            >
              {sending
                ? "Sending…"
                : decision === "accepted"
                  ? "Send acceptance email"
                  : "Send decline email"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
