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
  DECISION_EMAIL_VARIABLES,
  type DecisionEmailTemplates,
} from "@/lib/emails/decisionEmail";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formType: string;
  initialTemplates: DecisionEmailTemplates;
  onSaved?: (templates: DecisionEmailTemplates) => void;
};

export default function DecisionEmailsEditor({
  open,
  onOpenChange,
  formType,
  initialTemplates,
  onSaved,
}: Props) {
  const [templates, setTemplates] =
    useState<DecisionEmailTemplates>(initialTemplates);
  const [saving, setSaving] = useState(false);

  const updateField = (
    kind: "accepted" | "rejected",
    field: "subject" | "body",
    value: string,
  ) => {
    setTemplates((prev) => ({
      ...prev,
      [kind]: { ...prev[kind], [field]: value },
    }));
  };

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setTemplates(initialTemplates);
    }
    onOpenChange(next);
  };

  const handleSave = async () => {
    if (
      !templates.accepted.subject.trim() ||
      !templates.accepted.body.trim() ||
      !templates.rejected.subject.trim() ||
      !templates.rejected.body.trim()
    ) {
      toast.error("Subject and body are required for both emails");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/forms/decision-emails", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType,
          accepted: templates.accepted,
          rejected: templates.rejected,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to save");
        return;
      }
      onSaved?.(json.templates);
      toast.success("Decision emails saved");
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit decision emails</DialogTitle>
          <DialogDescription>
            Templates for accept and reject emails sent from{" "}
            <span className="capitalize">{formType}</span> responses. Use
            variables to personalize.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 pb-2">
          {DECISION_EMAIL_VARIABLES.map((variable) => (
            <span
              key={variable}
              className="rounded-md border bg-muted/50 px-2 py-1 font-mono text-xs text-muted-foreground"
            >
              {variable}
            </span>
          ))}
        </div>

        <Tabs defaultValue="accepted">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          {(["accepted", "rejected"] as const).map((kind) => (
            <TabsContent key={kind} value={kind} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor={`${kind}-subject`}>Subject</Label>
                <Input
                  id={`${kind}-subject`}
                  value={templates[kind].subject}
                  onChange={(e) => updateField(kind, "subject", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${kind}-body`}>Body</Label>
                <Textarea
                  id={`${kind}-body`}
                  value={templates[kind].body}
                  onChange={(e) => updateField(kind, "body", e.target.value)}
                  className="min-h-[220px] font-mono text-sm"
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
