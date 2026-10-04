"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AID_BASIS,
  AID_BASIS_LABELS,
  AID_FORM_LABELS,
  AID_FORMS,
  AID_POLICIES,
  AID_POLICY_LABELS,
  TEST_POLICIES,
  TEST_POLICY_LABELS,
  type ScholarshipStatus,
} from "@/lib/scholarships/constants";
import { COUNTRIES } from "@/lib/scholarships/countries";
import { universityInputSchema, type UniversityInput } from "@/lib/validation/scholarships";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Field,
  FormSection,
  LinesTextarea,
  LogoField,
  NumberInput,
  PillMultiSelect,
  SortableFieldList,
} from "./fields";
import StatusBadge from "./StatusBadge";

const opts = <T extends string>(keys: readonly T[], labels: Record<T, string>) =>
  keys.map((k) => ({ value: k, label: labels[k] }));

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export default function UniversityEditor({
  id,
  initial,
  needsVerification: initialNeedsVerification = false,
}: {
  id?: string;
  initial: UniversityInput;
  needsVerification?: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(initialNeedsVerification);
  const savedStatus = initial.status;

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<UniversityInput>({
    resolver: zodResolver(universityInputSchema),
    defaultValues: initial,
  });
  const deadlines = useFieldArray({ control, name: "deadlines", keyName: "key" });
  const slug = watch("slug");

  function save(status: ScholarshipStatus) {
    return handleSubmit(
      async (values) => {
        setSaving(true);
        try {
          const next = { ...values, status };
          const res = await fetch(
            id ? `/api/admin/scholarships/universities/${id}` : "/api/admin/scholarships/universities",
            {
              method: id ? "PUT" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(next),
            },
          );
          const data = await res.json().catch(() => null);
          if (!res.ok) throw new Error(data?.error || "Save failed");

          toast.success(status === "published" ? "Published" : "Saved");
          if (!id) {
            router.replace(`/admin/scholarships/universities/${data.data.id}`);
            return;
          }
          reset(next);
          if (status === "published" && savedStatus !== "published") setNeedsVerification(false);
          router.refresh();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Save failed");
        } finally {
          setSaving(false);
        }
      },
      () => toast.error("Fix the highlighted fields first"),
    )();
  }

  async function markVerified() {
    if (!id) return;
    const res = await fetch(`/api/admin/scholarships/universities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify" }),
    });
    if (res.ok) {
      setNeedsVerification(false);
      toast.success("Marked as verified");
      router.refresh();
    } else toast.error("Couldn't update");
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="pb-32">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/scholarships/universities"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Universities
        </Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-lg font-semibold text-slate-900">
          {id ? initial.name || "Untitled" : "New university"}
        </h1>
        {id && <StatusBadge status={savedStatus} />}
        {needsVerification && (
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            Needs verifying
            {id && (
              <button type="button" onClick={markVerified} className="underline underline-offset-2">
                Mark verified
              </button>
            )}
          </span>
        )}
      </div>

      <div className="mt-2 divide-y divide-slate-200">
        <FormSection title="Basics">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" htmlFor="name" error={errors.name?.message}>
              <Input id="name" {...register("name")} />
            </Field>
            <Field label="Country" htmlFor="country" error={errors.country?.message}>
              <select id="country" className={selectClass} {...register("country")}>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="City" htmlFor="city" optional>
              <Input id="city" {...register("city")} />
            </Field>
            <Field label="Website" htmlFor="website" optional error={errors.website?.message}>
              <Input id="website" type="url" placeholder="https://" {...register("website")} />
            </Field>
          </div>
          <Field label="Logo" optional>
            <Controller
              control={control}
              name="logo"
              render={({ field }) => (
                <LogoField value={field.value} onChange={field.onChange} uploadKey={slug || "university"} />
              )}
            />
          </Field>
        </FormSection>

        <FormSection title="Financial aid">
          <Field label="Aid policy for international students" htmlFor="aidPolicy">
            <select id="aidPolicy" className={selectClass} {...register("aidPolicy")}>
              {AID_POLICIES.map((p) => (
                <option key={p} value={p}>
                  {AID_POLICY_LABELS[p]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Aid types" optional>
            <Controller
              control={control}
              name="aidTypes"
              render={({ field }) => (
                <PillMultiSelect options={opts(AID_BASIS, AID_BASIS_LABELS)} value={field.value} onChange={field.onChange} />
              )}
            />
          </Field>
          <label className="flex items-center justify-between gap-4 text-sm text-slate-700">
            No loans — aid is all grants
            <Controller
              control={control}
              name="noLoans"
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
            />
          </label>
          <Field label="Highlights" optional hint="One per line.">
            <Controller
              control={control}
              name="highlights"
              render={({ field }) => <LinesTextarea value={field.value} onChange={field.onChange} />}
            />
          </Field>
          <Field label="Description" htmlFor="description" optional hint="Markdown supported.">
            <Textarea id="description" rows={4} {...register("description")} />
          </Field>
        </FormSection>

        <FormSection title="Numbers" description="From the Common Data Set, section H6.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Average aid (USD / year)" optional>
              <Controller
                control={control}
                name="stats.avgAidUsd"
                render={({ field }) => <NumberInput value={field.value} onChange={field.onChange} />}
              />
            </Field>
            <Field label="International students aided" optional>
              <Controller
                control={control}
                name="stats.intlStudentsAided"
                render={({ field }) => <NumberInput value={field.value} onChange={field.onChange} />}
              />
            </Field>
            <Field label="Cost of attendance (USD / year)" optional>
              <Controller
                control={control}
                name="stats.costOfAttendanceUsd"
                render={({ field }) => <NumberInput value={field.value} onChange={field.onChange} />}
              />
            </Field>
            <Field label="Data year" htmlFor="dataYear" optional>
              <Input id="dataYear" placeholder="2024-25" {...register("stats.dataYear")} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Applying">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Tests" htmlFor="testPolicy">
              <select id="testPolicy" className={selectClass} {...register("testPolicy")}>
                {TEST_POLICIES.map((p) => (
                  <option key={p} value={p}>
                    {TEST_POLICY_LABELS[p]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Aid forms" optional>
            <Controller
              control={control}
              name="requiredForms"
              render={({ field }) => (
                <PillMultiSelect options={opts(AID_FORMS, AID_FORM_LABELS)} value={field.value} onChange={field.onChange} />
              )}
            />
          </Field>
          <Field label="Deadlines" optional>
            <SortableFieldList
              fields={deadlines.fields}
              onMove={deadlines.move}
              onRemove={deadlines.remove}
              onAdd={() => deadlines.append({ label: "", date: "" })}
              addLabel="Add deadline"
              renderRow={(i) => (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input placeholder="e.g. Early Decision" {...register(`deadlines.${i}.label`)} />
                  <Input type="date" {...register(`deadlines.${i}.date`)} />
                  {(errors.deadlines?.[i]?.label || errors.deadlines?.[i]?.date) && (
                    <p className="text-xs text-red-600 sm:col-span-2">
                      {errors.deadlines[i]?.label?.message ?? errors.deadlines[i]?.date?.message}
                    </p>
                  )}
                </div>
              )}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Financial aid page" htmlFor="aidPageUrl" optional error={errors.aidPageUrl?.message}>
              <Input id="aidPageUrl" type="url" placeholder="https://" {...register("aidPageUrl")} />
            </Field>
            <Field
              label="Net price calculator"
              htmlFor="netPriceCalculatorUrl"
              optional
              error={errors.netPriceCalculatorUrl?.message}
            >
              <Input id="netPriceCalculatorUrl" type="url" placeholder="https://" {...register("netPriceCalculatorUrl")} />
            </Field>
          </div>
        </FormSection>

        <details className="group py-8">
          <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
            <span className="mr-2 inline-block text-slate-400 transition-transform group-open:rotate-90">
              ›
            </span>
            More details
          </summary>
          <div className="mt-6 space-y-5 md:pl-[13.5rem]">
            <Field
              label="URL slug"
              htmlFor="slug"
              optional
              hint="Leave empty to generate from the name."
              error={errors.slug?.message}
            >
              <Input id="slug" {...register("slug")} />
            </Field>
          </div>
        </details>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:left-64">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3 md:px-8">
          <p className="min-w-0 flex-1 text-sm text-slate-500">{isDirty ? "Unsaved changes" : ""}</p>
          {id && initial.slug && (
            <Button asChild variant="ghost" size="sm">
              <a href={`/scholarships/universities/${initial.slug}`} target="_blank" rel="noopener noreferrer">
                Preview <ExternalLink />
              </a>
            </Button>
          )}
          {savedStatus === "published" ? (
            <>
              <Button type="button" variant="outline" size="sm" disabled={saving} onClick={() => save("draft")}>
                Unpublish
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={saving}
                onClick={() => save("published")}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {saving ? "Saving…" : "Save"}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={() => save(savedStatus === "archived" ? "archived" : "draft")}
              >
                {saving ? "Saving…" : "Save draft"}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={saving}
                onClick={() => save("published")}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Publish
              </Button>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
