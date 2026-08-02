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

  useEffect(() => {
    if (open) {
      setSubject(initialSubject);
      setBody(initialBody);
    }
  }, [open, initialSubject, initialBody]);

  const previewHtml = useMemo(
    () => decisionEmailHtml({ decision, body }),
    [decision, body],
  );

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
  };

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
          : "Rejection email sent",
      );
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSending(false);
    }
  };

  const title =
    decision === "accepted" ? "Send acceptance email" : "Send rejection email";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Preview the email that will be sent to{" "}
            <span className="font-medium text-foreground">
              {submitterEmail || "unknown"}
            </span>
            . You can personalize it before sending. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="decision-subject">Subject</Label>
              <Input
                id="decision-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="decision-body">Body</Label>
              <Textarea
                id="decision-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[280px] font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email preview</Label>
            <div className="overflow-hidden rounded-lg border bg-slate-100">
              <div className="border-b bg-white px-4 py-2 text-sm">
                <span className="text-muted-foreground">Subject: </span>
                <span className="font-medium">{subject || "(empty)"}</span>
              </div>
              <iframe
                title="Email preview"
                srcDoc={previewHtml}
                className="h-[340px] w-full bg-white"
                sandbox=""
              />
            </div>
          </div>
        </div>

        <DialogFooter>
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
                ? "Confirm & send acceptance"
                : "Confirm & send rejection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
