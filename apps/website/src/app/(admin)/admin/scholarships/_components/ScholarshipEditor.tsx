"use client";

import AddPicker from "@/components/profile/AddPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AdminScholarshipMeta, UniversityOption } from "@/lib/data/admin/scholarships";
import {
  AID_BASIS,
  AID_BASIS_LABELS,
  COVER_LABELS,
  COVERS,
  FIELD_OF_STUDY_LABELS,
  FIELDS_OF_STUDY,
  FUNDING_TYPE_LABELS,
  FUNDING_TYPES,
  PROVIDER_TYPE_LABELS,
  PROVIDER_TYPES,
  REQUIREMENT_TAG_LABELS,
  REQUIREMENT_TAGS,
  STUDY_LEVEL_LABELS,
  STUDY_LEVELS,
  type ScholarshipStatus,
} from "@/lib/scholarships/constants";
import {
  scholarshipInputSchema,
  scholarshipPublishIssues,
  type ScholarshipInput,
} from "@/lib/validation/scholarships";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  CountryMultiField,
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

export default function ScholarshipEditor({
  id,
  initial,
  meta,
  universities,
}: {
  id?: string;
  initial: ScholarshipInput;
  meta?: AdminScholarshipMeta;
  universities: UniversityOption[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [publishIssues, setPublishIssues] = useState<string[]>([]);
  const [needsVerification, setNeedsVerification] = useState(meta?.needsVerification ?? false);
  const savedStatus = initial.status;

  const form = useForm<ScholarshipInput>({
    resolver: zodResolver(scholarshipInputSchema),
    defaultValues: initial,
  });
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = form;

  // keyName keeps RHF from overwriting each requirement's own `id`.
  const requirements = useFieldArray({ control, name: "requirements", keyName: "key" });
  const steps = useFieldArray({ control, name: "applySteps", keyName: "key" });
  const extraLinks = useFieldArray({ control, name: "extraLinks", keyName: "key" });

  const nationalityMode = watch("nationality.mode");
  const slug = watch("slug");

  async function persist(values: ScholarshipInput) {
    setSaving(true);
    try {
      const res = await fetch(id ? `/api/admin/scholarships/${id}` : "/api/admin/scholarships", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Save failed");

      toast.success(values.status === "published" ? "Published" : "Saved");
      if (!id) {
        router.replace(`/admin/scholarships/${data.data.id}`);
        return;
      }
      // Reload so new requirements get their server ids.
      const fresh = await fetch(`/api/admin/scholarships/${id}`).then((r) => r.json());
      if (fresh?.data?.input) reset(fresh.data.input);
      if (values.status === "published" && savedStatus !== "published") setNeedsVerification(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function save(status: ScholarshipStatus) {
    return handleSubmit(
      async (values) => {
        const next = { ...values, status };
        if (status === "published") {
          const issues = scholarshipPublishIssues(next);
          setPublishIssues(issues);
          if (issues.length) return;
        }
        await persist(next);
      },
      () => toast.error("Fix the highlighted fields first"),
    )();
  }

  async function markVerified() {
    if (!id) return;
    const res = await fetch(`/api/admin/scholarships/${id}`, {
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
          href="/admin/scholarships"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Scholarships
        </Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-lg font-semibold text-slate-900">
          {id ? initial.title || "Untitled" : "New scholarship"}
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
            <Field label="Title" htmlFor="title" error={errors.title?.message}>
              <Input id="title" {...register("title")} />
            </Field>
            <Field label="Provider" htmlFor="provider" error={errors.provider?.message}>
              <Input id="provider" placeholder="e.g. University of Toronto" {...register("provider")} />
            </Field>
            <Field label="Provider type" htmlFor="providerType">
              <select id="providerType" className={selectClass} {...register("providerType")}>
                {PROVIDER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {PROVIDER_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Funding" htmlFor="fundingType">
              <select id="fundingType" className={selectClass} {...register("fundingType")}>
                {FUNDING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {FUNDING_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Logo" optional>
            <Controller
              control={control}
              name="logo"
              render={({ field }) => (
                <LogoField value={field.value} onChange={field.onChange} uploadKey={slug || "scholarship"} />
              )}
            />
          </Field>
        </FormSection>

        <FormSection title="About">
          <Field
            label="Summary"
            htmlFor="summary"
            hint="One or two sentences. Shown at the top of the page."
            error={errors.summary?.message}
          >
            <Textarea id="summary" rows={2} maxLength={280} {...register("summary")} />
          </Field>
          <Field label="Amount" htmlFor="amountText" optional hint='e.g. "Up to £10,000 a year"'>
            <Input id="amountText" {...register("amountText")} />
          </Field>
          <Field label="Covers" optional>
            <Controller
              control={control}
              name="covers"
              render={({ field }) => (
                <PillMultiSelect options={opts(COVERS, COVER_LABELS)} value={field.value} onChange={field.onChange} />
              )}
            />
          </Field>
          <Field label="Description" htmlFor="description" optional hint="Markdown supported.">
            <Textarea id="description" rows={5} {...register("description")} />
          </Field>
          <label className="flex items-center justify-between gap-4 text-sm text-slate-700">
            Renewable each year
            <Controller
              control={control}
              name="renewable"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </label>
        </FormSection>

        <FormSection title="Who can apply">
          <Field label="Study level" error={errors.studyLevels?.message}>
            <Controller
              control={control}
              name="studyLevels"
              render={({ field }) => (
                <PillMultiSelect
                  options={opts(STUDY_LEVELS, STUDY_LEVEL_LABELS)}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </Field>
          <Field label="Where you study" hint="Countries the scholarship can be used in.">
            <Controller
              control={control}
              name="destinations"
              render={({ field }) => (
                <CountryMultiField value={field.value} onChange={field.onChange} allowAny />
              )}
            />
          </Field>
          <Field label="Nationality" error={errors.nationality?.countries?.message}>
            <select className={cn(selectClass, "mb-2 sm:w-64")} {...register("nationality.mode")}>
              <option value="any">Open to all nationalities</option>
              <option value="include">Only these countries</option>
              <option value="exclude">Everyone except these countries</option>
            </select>
            {nationalityMode !== "any" && (
              <Controller
                control={control}
                name="nationality.countries"
                render={({ field }) => <CountryMultiField value={field.value} onChange={field.onChange} />}
              />
            )}
            <Input
              className="mt-2"
              placeholder='Note, e.g. "Commonwealth countries"'
              {...register("nationality.note")}
            />
          </Field>
          <Field label="Fields of study" hint="Leave empty if any field is fine.">
            <Controller
              control={control}
              name="fieldsOfStudy"
              render={({ field }) => (
                <PillMultiSelect
                  options={opts(FIELDS_OF_STUDY, FIELD_OF_STUDY_LABELS)}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </Field>
          <Field label="Awarded for" optional>
            <Controller
              control={control}
              name="basis"
              render={({ field }) => (
                <PillMultiSelect options={opts(AID_BASIS, AID_BASIS_LABELS)} value={field.value} onChange={field.onChange} />
              )}
            />
          </Field>
          <Field label="Other criteria" optional hint="One per line.">
            <Controller
              control={control}
              name="otherCriteria"
              render={({ field }) => <LinesTextarea value={field.value} onChange={field.onChange} />}
            />
          </Field>
          <Field label="How they choose" optional hint="Selection criteria, one per line.">
            <Controller
              control={control}
              name="selectionCriteria"
              render={({ field }) => <LinesTextarea value={field.value} onChange={field.onChange} />}
            />
          </Field>
        </FormSection>

        <FormSection title="How to apply">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Apply link" htmlFor="applyUrl" error={errors.applyUrl?.message}>
              <Input id="applyUrl" type="url" placeholder="https://" {...register("applyUrl")} />
            </Field>
            <Field label="Official page" htmlFor="officialUrl" optional error={errors.officialUrl?.message}>
              <Input id="officialUrl" type="url" placeholder="https://" {...register("officialUrl")} />
            </Field>
          </div>
          <Field label="Requirements" hint="Students can tick these off once they save the scholarship.">
            <SortableFieldList
              fields={requirements.fields}
              onMove={requirements.move}
              onRemove={requirements.remove}
              onAdd={() => requirements.append({ label: "", detail: "" })}
              addLabel="Add requirement"
              renderRow={(i) => (
                <>
                  <Input placeholder="e.g. Personal essay" {...register(`requirements.${i}.label`)} />
                  <Input
                    placeholder="Detail (optional)"
                    className="text-slate-600"
                    {...register(`requirements.${i}.detail`)}
                  />
                  {errors.requirements?.[i]?.label && (
                    <p className="text-xs text-red-600">{errors.requirements[i]?.label?.message}</p>
                  )}
                </>
              )}
            />
          </Field>
          <Field label="Requirement tags" optional hint='Powers filters like "No essay".'>
            <Controller
              control={control}
              name="requirementTags"
              render={({ field }) => (
                <PillMultiSelect
                  options={opts(REQUIREMENT_TAGS, REQUIREMENT_TAG_LABELS)}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </Field>
          <Field label="Steps" optional>
            <SortableFieldList
              fields={steps.fields}
              onMove={steps.move}
              onRemove={steps.remove}
              onAdd={() => steps.append({ title: "", detail: "" })}
              addLabel="Add step"
              renderRow={(i) => (
                <>
                  <Input placeholder="e.g. Apply for admission" {...register(`applySteps.${i}.title`)} />
                  <Input
                    placeholder="Detail (optional)"
                    className="text-slate-600"
                    {...register(`applySteps.${i}.detail`)}
                  />
                  {errors.applySteps?.[i]?.title && (
                    <p className="text-xs text-red-600">{errors.applySteps[i]?.title?.message}</p>
                  )}
                </>
              )}
            />
          </Field>
        </FormSection>

        <FormSection title="Key dates">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Opens" htmlFor="opensAt" optional>
              <Input id="opensAt" type="date" {...register("opensAt")} />
            </Field>
            <Field label="Deadline" htmlFor="deadline" error={errors.deadline?.message}>
              <Input id="deadline" type="date" {...register("deadline")} />
            </Field>
            <Field label="Results" htmlFor="resultsAt" optional>
              <Input id="resultsAt" type="date" {...register("resultsAt")} />
            </Field>
          </div>
          <Field label="Deadline note" htmlFor="deadlineNote" optional hint='e.g. "Varies by country"'>
            <Input id="deadlineNote" {...register("deadlineNote")} />
          </Field>
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-4 text-sm text-slate-700">
              Rolling deadline
              <Controller
                control={control}
                name="rolling"
                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
              />
            </label>
            <label className="flex items-center justify-between gap-4 text-sm text-slate-700">
              Runs every year
              <Controller
                control={control}
                name="recurring"
                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
              />
            </label>
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
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Amount in USD / year" optional hint="Only used for sorting.">
                <Controller
                  control={control}
                  name="usdPerYearApprox"
                  render={({ field }) => <NumberInput value={field.value} onChange={field.onChange} />}
                />
              </Field>
              <Field label="Duration (years)" optional>
                <Controller
                  control={control}
                  name="durationYears"
                  render={({ field }) => <NumberInput value={field.value} onChange={field.onChange} />}
                />
              </Field>
              <Field label="Grades" htmlFor="minGrades" optional>
                <Input id="minGrades" placeholder="e.g. A*AA" {...register("minGrades")} />
              </Field>
            </div>
            <Field label="Offered at" optional hint="Links this scholarship to university pages.">
              <Controller
                control={control}
                name="universityIds"
                render={({ field }) => (
                  <UniversityPicker value={field.value} onChange={field.onChange} options={universities} />
                )}
              />
            </Field>
            <Field label="Extra links" optional>
              <SortableFieldList
                fields={extraLinks.fields}
                onMove={extraLinks.move}
                onRemove={extraLinks.remove}
                onAdd={() => extraLinks.append({ label: "", url: "" })}
                addLabel="Add link"
                renderRow={(i) => (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input placeholder="Label" {...register(`extraLinks.${i}.label`)} />
                    <Input placeholder="https://" {...register(`extraLinks.${i}.url`)} />
                    {(errors.extraLinks?.[i]?.label || errors.extraLinks?.[i]?.url) && (
                      <p className="text-xs text-red-600 sm:col-span-2">
                        {errors.extraLinks[i]?.label?.message ?? errors.extraLinks[i]?.url?.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </Field>
            <Field label="Tags" optional hint="One per line — helps search.">
              <Controller
                control={control}
                name="tags"
                render={({ field }) => <LinesTextarea value={field.value} onChange={field.onChange} rows={2} />}
              />
            </Field>
            <Field
              label="URL slug"
              htmlFor="slug"
              optional
              hint="Leave empty to generate from the title."
              error={errors.slug?.message}
            >
              <Input id="slug" placeholder="lester-b-pearson-scholarship" {...register("slug")} />
            </Field>
          </div>
        </details>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:left-64">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3 md:px-8">
          {publishIssues.length > 0 ? (
            <p className="flex min-w-0 flex-1 items-start gap-1.5 text-sm text-amber-800">
              <span className="min-w-0">Can&apos;t publish yet: {publishIssues.join(" · ")}</span>
              <button type="button" aria-label="Dismiss" onClick={() => setPublishIssues([])}>
                <X className="h-4 w-4" />
              </button>
            </p>
          ) : (
            <p className="min-w-0 flex-1 text-sm text-slate-500">{isDirty ? "Unsaved changes" : ""}</p>
          )}
          {id && initial.slug && (
            <Button asChild variant="ghost" size="sm">
              <a href={`/scholarships/${initial.slug}`} target="_blank" rel="noopener noreferrer">
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
              <Button type="button" variant="outline" size="sm" disabled={saving} onClick={() => save(savedStatus === "archived" ? "archived" : "draft")}>
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

function UniversityPicker({
  value,
  onChange,
  options,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  options: UniversityOption[];
}) {
  const byId = new Map(options.map((o) => [o.id, o.name]));
  const taken = new Set(value);

  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {value.map((id) => (
            <li
              key={id}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 py-1 pl-3 pr-1 text-sm text-slate-700"
            >
              {byId.get(id) ?? "Unknown university"}
              <button
                type="button"
                aria-label="Remove"
                onClick={() => onChange(value.filter((v) => v !== id))}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <AddPicker
        label="Add university"
        searchPlaceholder="Search universities"
        emptyText="No universities yet."
        groups={[
          {
            heading: "Universities",
            options: options.filter((o) => !taken.has(o.id)).map((o) => ({ value: o.id, label: o.name })),
          },
        ]}
        onSelect={(id) => onChange([...value, id])}
      />
    </div>
  );
}
