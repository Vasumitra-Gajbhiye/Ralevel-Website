"use client";

import ApplyFormCard from "@/components/apply/ApplyFormCard";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  APPLY_CARD_GRADIENTS,
  APPLY_CARD_ICON_NAMES,
  getApplyCardIcon,
} from "@/lib/apply-cards";
import type { AdminApplyCard } from "@/lib/data/admin/applyCards";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type ApplyCardFormValues = {
  title: string;
  description: string;
  status: "open" | "soon";
  gradient: string;
  icon: string;
  logo: string;
  steps: string[];
  ctaText: string;
};

function valuesFromCard(card: AdminApplyCard): ApplyCardFormValues {
  return {
    title: card.title,
    description: card.description,
    status: card.status,
    gradient: card.gradient,
    icon: card.icon,
    logo: card.logo ?? "",
    steps: card.steps.length > 0 ? card.steps : [""],
    ctaText: card.ctaText,
  };
}

type ApplyCardFormDialogProps = {
  open: boolean;
  card: AdminApplyCard | null;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ApplyCardFormValues) => Promise<void>;
};

export default function ApplyCardFormDialog({
  open,
  card,
  saving,
  onOpenChange,
  onSubmit,
}: ApplyCardFormDialogProps) {
  const [values, setValues] = useState<ApplyCardFormValues | null>(
    card ? valuesFromCard(card) : null,
  );

  useEffect(() => {
    if (open && card) {
      setValues(valuesFromCard(card));
    }
  }, [open, card]);

  const gradientOptions = useMemo(() => {
    const current = values?.gradient;
    if (current && !(APPLY_CARD_GRADIENTS as readonly string[]).includes(current)) {
      return [current, ...APPLY_CARD_GRADIENTS];
    }
    return [...APPLY_CARD_GRADIENTS];
  }, [values?.gradient]);

  if (!card || !values) return null;

  function update<K extends keyof ApplyCardFormValues>(
    key: K,
    value: ApplyCardFormValues[K],
  ) {
    setValues((current) => (current ? { ...current, [key]: value } : current));
  }

  function updateStep(index: number, value: string) {
    setValues((current) => {
      if (!current) return current;
      const steps = [...current.steps];
      steps[index] = value;
      return { ...current, steps };
    });
  }

  function addStep() {
    setValues((current) =>
      current ? { ...current, steps: [...current.steps, ""] } : current,
    );
  }

  function removeStep(index: number) {
    setValues((current) => {
      if (!current) return current;
      const steps = current.steps.filter((_, i) => i !== index);
      return { ...current, steps: steps.length > 0 ? steps : [""] };
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!values) return;
    await onSubmit({
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
      ctaText: values.ctaText.trim(),
      logo: values.logo.trim(),
      steps: values.steps.map((step) => step.trim()).filter(Boolean),
    });
  }

  const canSubmit =
    values.title.trim().length > 0 &&
    values.description.trim().length > 0 &&
    values.ctaText.trim().length > 0 &&
    values.gradient.trim().length > 0 &&
    !saving;

  const IconPreview = getApplyCardIcon(values.icon);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Edit apply card</DialogTitle>
          <DialogDescription>
            Updates the listing card on /apply. Closing the actual application
            still happens under Form submission.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="apply-title">Title</Label>
              <Input
                id="apply-title"
                value={values.title}
                onChange={(e) => update("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="apply-description">Description</Label>
              <Textarea
                id="apply-description"
                value={values.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="apply-cta">CTA text</Label>
              <Input
                id="apply-cta"
                value={values.ctaText}
                onChange={(e) => update("ctaText", e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
              <div>
                <p className="text-sm font-medium">Open on /apply</p>
                <p className="text-xs text-neutral-500">
                  Display only. Does not close the intake form.
                </p>
              </div>
              <Switch
                checked={values.status === "open"}
                onCheckedChange={(checked) =>
                  update("status", checked ? "open" : "soon")
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Icon</Label>
              <Select
                value={values.icon}
                onValueChange={(icon) => update("icon", icon)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLY_CARD_ICON_NAMES.map((name) => {
                    const Icon = getApplyCardIcon(name);
                    return (
                      <SelectItem key={name} value={name}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {name}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="apply-logo">Logo URL (optional)</Label>
              <Input
                id="apply-logo"
                value={values.logo}
                onChange={(e) => update("logo", e.target.value)}
                placeholder="/logo/reddit.svg"
              />
              <p className="text-xs text-neutral-500">
                If set, this image replaces the icon on the card.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Gradient</Label>
              <div className="grid grid-cols-6 gap-2">
                {gradientOptions.map((gradient) => (
                  <button
                    key={gradient}
                    type="button"
                    aria-label={`Use ${gradient}`}
                    onClick={() => update("gradient", gradient)}
                    className={`h-10 rounded-md bg-gradient-to-r ${gradient} ring-offset-2 ${
                      values.gradient === gradient
                        ? "ring-2 ring-neutral-900"
                        : "ring-1 ring-black/10"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Steps</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStep}
                >
                  <Plus className="h-4 w-4" />
                  Add step
                </Button>
              </div>
              <div className="space-y-2">
                {values.steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-center text-xs text-neutral-400">
                      {index + 1}
                    </span>
                    <Input
                      value={step}
                      onChange={(e) => updateStep(index, e.target.value)}
                      placeholder="Step description"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-neutral-500 hover:text-red-600"
                      onClick={() => removeStep(index)}
                      aria-label={`Remove step ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-700">Preview</p>
            <div className="overflow-hidden rounded-xl">
              <ApplyFormCard
                preview
                card={{
                  title: values.title || "Card title",
                  description:
                    values.description || "Card description appears here.",
                  status: values.status,
                  gradient: values.gradient,
                  icon: values.icon,
                  logo: values.logo.trim() || undefined,
                  steps: values.steps.map((step) => step.trim()).filter(Boolean),
                  ctaText: values.ctaText || "Apply",
                }}
              />
            </div>
            <p className="flex items-center gap-2 text-xs text-neutral-500">
              <IconPreview className="h-3.5 w-3.5" />
              /apply/{card.slug}
            </p>
          </div>

          <DialogFooter className="lg:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
