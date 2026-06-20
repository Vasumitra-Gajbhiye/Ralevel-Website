"use client";

import posthog from "posthog-js";
import ErrorPopover from "@/components/form/ErrorPopover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  ChevronDown,
  FileArchive,
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
type FormField = {
  id: string;
  label: string;
  type: "text" | "email" | "textarea" | "url" | "file";
  required?: boolean;
};

const MAX_FILES_PER_SUBMISSION = 10;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB per file
function IntroductionBlocks({ blocks }: { blocks: any[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return (
            <p
              key={index}
              className="text-sm leading-relaxed text-muted-foreground"
            >
              {block.text}
            </p>
          );
        }

        if (block.type === "bullet_list") {
          return (
            <ul key={index} className="space-y-2">
              {block.items.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="mt-2 h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: block.bulletColor }}
                  />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          );
        }

        return null;
      })}
    </div>
  );
}

function buildStructuredResponses(form: any, data: any) {
  const structured: Record<string, Record<string, any>> = {};

  for (const section of form.sections || []) {
    const sectionData = data?.[section.id];
    if (!sectionData) continue;

    structured[section.id] = {};

    for (const field of section.fields || []) {
      const value = sectionData?.[field.id];

      if (value !== undefined && value !== null && value !== "") {
        structured[section.id][field.id] = value;
      }
    }

    // Remove empty sections
    if (Object.keys(structured[section.id]).length === 0) {
      delete structured[section.id];
    }
  }

  return structured;
}

type FormPageProps = {
  form: any;
};
export default function FormPageClient({ form }: FormPageProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showFileErrorModal, setShowFileErrorModal] = useState(false);
  const [fileErrorMessage, setFileErrorMessage] = useState<string | null>(null);
  const [errorElement, setErrorElement] = useState<HTMLElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filePreviews, setFilePreviews] = useState<
    Record<string, { file: File; url: string }[]>
  >({});
  useEffect(() => {
    return () => {
      Object.values(filePreviews).forEach((files) => {
        files.forEach((f) => {
          if (f.url) URL.revokeObjectURL(f.url);
        });
      });
    };
  }, [filePreviews]);
  const removeFile = (inputName: string, index: number) => {
    setFilePreviews((prev) => {
      const updated = { ...prev };
      const arr = [...(updated[inputName] || [])];

      const removed = arr[index];
      if (removed?.url) URL.revokeObjectURL(removed.url);

      arr.splice(index, 1);
      updated[inputName] = arr;

      // keep react-hook-form value in sync
      setValue(
        inputName as any,
        arr.map((f) => f.file)
      );

      return updated;
    });
  };
  const {
    register,
    handleSubmit,
    reset,
    control,
    setFocus,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    shouldFocusError: true,
    mode: "onBlur",
  });
  const onSubmit = async (data: any) => {
    console.log("FORM DATA:", data);

    try {
      let res: Response;

      // 🔹 RESOURCE FORM → multipart (multi-resource support)
      if (form.slug === "resource") {
        const formData = new FormData();

        // =============================
        // 1️⃣ Contributor
        // =============================
        formData.append("fullName", data?.contributor?.fullName || "");
        formData.append("email", data?.contributor?.email || "");
        formData.append(
          "discordOrRedditId",
          data?.contributor?.discordOrRedditId || ""
        );

        // =============================
        // 2️⃣ Detect resource blocks dynamically
        // =============================

        let resourceIndex = 0;

        // Your UI creates numbered resource sections
        // e.g. resource_1, resource_2, resource_3

        Object.keys(data).forEach((sectionKey) => {
          if (!sectionKey.startsWith("resource_")) return;

          const resource = data[sectionKey];
          if (!resource?.resourceTitle) return;

          // Title
          formData.append(
            `resources[${resourceIndex}][title]`,
            resource.resourceTitle
          );

          // Description
          formData.append(
            `resources[${resourceIndex}][description]`,
            resource.description || ""
          );

          // Resource Type
          formData.append(
            `resources[${resourceIndex}][resourceType]`,
            resource.resourceType || "Files"
          );

          // Links
          if (Array.isArray(resource.links)) {
            resource.links.forEach((link: string) => {
              if (link) {
                formData.append(`resources[${resourceIndex}][links][]`, link);
              }
            });
          }

          // Files
          // Files (TS-safe version)
          const filesValue = resource?.files as any;

          if (filesValue) {
            // Case 1: FileList
            if (
              typeof FileList !== "undefined" &&
              filesValue instanceof FileList
            ) {
              for (let i = 0; i < filesValue.length; i++) {
                const file = filesValue.item(i);
                if (file) {
                  formData.append(`resources[${resourceIndex}][files][]`, file);
                }
              }
            }

            // Case 2: Array
            else if (Array.isArray(filesValue)) {
              for (const file of filesValue) {
                if (file) {
                  formData.append(`resources[${resourceIndex}][files][]`, file);
                }
              }
            }
          }

          resourceIndex++;
        });
        console.log("sdfsdfsdfd");
        res = await fetch("/api/resources/submit", {
          method: "POST",
          body: formData,
        });
      }
      // 🔹 ALL OTHER FORMS → multipart-aware (handles file fields)
      else {
        const enrichedResponses = buildStructuredResponses(form, data);

        // Detect if the form contains file fields
        let hasFiles = false;
        const formData = new FormData();

        formData.append("responses", JSON.stringify(enrichedResponses));

        for (const section of form.sections || []) {
          const sectionData = data?.[section.id];
          if (!sectionData) continue;

          for (const field of section.fields || []) {
            if (field.type !== "file") continue;

            const value = sectionData?.[field.id];
            if (!value) continue;

            hasFiles = true;
            if (typeof FileList !== "undefined" && value instanceof FileList) {
              for (let i = 0; i < value.length; i++) {
                const file = value.item(i);
                if (file) formData.append(`files:${field.id}`, file);
              }
            } else if (Array.isArray(value)) {
              for (const file of value) {
                if (file) formData.append(`files:${field.id}`, file);
              }
            }
          }
        }

        if (hasFiles) {
          res = await fetch(`/api/forms/${form.slug}/submit`, {
            method: "POST",
            body: formData,
          });
        } else {
          res = await fetch(`/api/forms/${form.slug}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cycleId: form.cycleId,
              formType: form.slug,
              responses: enrichedResponses,
            }),
          });
        }
      }

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setShowDuplicateModal(true);
          return;
        }

        // Handle required file errors from backend
        if (json?.type === "FILE_REQUIRED") {
          setFileErrorMessage(json.message || "A required file is missing.");
          setShowFileErrorModal(true);
          return;
        }

        toast.error(json.message || "Submission failed");
        return;
      }

      setShowConfirmation(true);
      posthog.capture("form_submitted", {
        form_slug: form.slug,
        form_title: form.title,
        form_type: form.formType,
      });
      reset();
    } catch (err) {
      console.error(err);
      posthog.captureException(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-20">
        <Card className="overflow-hidden border-none shadow-2xl">
          {/* BANNER */}
          {form.banner && (
            <div className="relative h-36 w-full overflow-hidden">
              {form.banner.type === "gradient" ? (
                <div
                  className={`h-full w-full bg-gradient-to-r ${form.banner.value}`}
                />
              ) : (
                <img
                  src={form.banner.value}
                  alt={`${form.title} banner`}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          )}

          {/* HEADER */}
          <div className="px-10 pt-8 pb-4 space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {form.title.replace(/\s+Intake\s+\d+$/i, "")}
            </h1>

            {form.subtitle && (
              <p className="max-w-3xl text-muted-foreground text-base">
                {form.subtitle}
              </p>
            )}
          </div>

          {/* INTRO / RULES */}
          {form.introductionBlocks && (
            <div className="px-10 pb-6">
              <div className="rounded-xl border bg-muted/40 px-6 py-5">
                <IntroductionBlocks blocks={form.introductionBlocks} />
              </div>
            </div>
          )}
          {/* FORM */}
          <CardContent className="px-10 pb-10">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Honeypot anti‑spam field (hidden from users) */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                {...register("website")}
              />
              {form.sections?.map((section: any) => (
                <div key={section.id} className="space-y-6 mt-12">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold">{section.title}</h2>

                    {section.subtitle && (
                      <p className="text-sm text-muted-foreground">
                        {section.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    {section.fields.map((field: any) => {
                      const inputName = `${section.id}.${field.id}`;
                      return (
                        <div key={field.id} className="space-y-3">
                          <Label htmlFor={inputName}>
                            {field.label}
                            {field.required && (
                              <span className="ml-1 text-red-500">*</span>
                            )}
                          </Label>

                          {field.type === "textarea" ? (
                            <Textarea
                              id={inputName}
                              rows={5}
                              placeholder={field.placeholder}
                              {...register(inputName, {
                                required: field.required
                                  ? `${field.label} is required`
                                  : false,
                              })}
                            />
                          ) : field.type !== "select" &&
                            field.type !== "checkbox" &&
                            field.type !== "radio" &&
                            field.type !== "file" ? (
                            <Input
                              id={inputName}
                              type={field.type}
                              placeholder={field.placeholder}
                              {...register(inputName, {
                                required: field.required
                                  ? `${field.label} is required`
                                  : false,

                                ...(field.type === "email" && {
                                  pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message:
                                      "Please enter a valid email address",
                                  },
                                }),
                              })}
                            />
                          ) : field.type === "select" ? (
                            <Controller
                              control={control}
                              name={inputName}
                              rules={{
                                required: field.required
                                  ? `${field.label} is required`
                                  : false,
                              }}
                              render={({ field: controllerField }) => {
                                const isMultiple = field.multiple;
                                const rawValue = controllerField.value;

                                const selectedValues = Array.isArray(rawValue)
                                  ? rawValue
                                  : rawValue
                                  ? [rawValue]
                                  : [];

                                const customValue =
                                  selectedValues.find((v) =>
                                    v.startsWith("__OTHER__:")
                                  ) || "";

                                const isOtherSelected = !!customValue;

                                const toggleOption = (option: string) => {
                                  if (!isMultiple) {
                                    controllerField.onChange(option);
                                    return;
                                  }

                                  if (field.maxSelections === 1) {
                                    controllerField.onChange([option]);
                                    return;
                                  }

                                  const current = selectedValues;

                                  if (current.includes(option)) {
                                    controllerField.onChange(
                                      current.filter((v) => v !== option)
                                    );
                                  } else {
                                    if (
                                      field.maxSelections &&
                                      current.length >= field.maxSelections
                                    )
                                      return;
                                    controllerField.onChange([
                                      ...current,
                                      option,
                                    ]);
                                  }
                                };
                                const removeOption = (option: string) => {
                                  controllerField.onChange(
                                    selectedValues.filter((v) => v !== option)
                                  );
                                };
                                const toggleOther = () => {
                                  // Single select mode → replace
                                  if (!isMultiple) {
                                    controllerField.onChange("__OTHER__:");
                                    return;
                                  }

                                  // If already selected → remove
                                  if (isOtherSelected) {
                                    controllerField.onChange(
                                      selectedValues.filter(
                                        (v) => !v.startsWith("__OTHER__:")
                                      )
                                    );
                                    return;
                                  }

                                  // If maxSelections === 1 → replace
                                  if (field.maxSelections === 1) {
                                    controllerField.onChange(["__OTHER__:"]);
                                    return;
                                  }

                                  // Normal multi-select behavior
                                  controllerField.onChange([
                                    ...selectedValues,
                                    "__OTHER__:",
                                  ]);
                                };

                                const updateOtherValue = (val: string) => {
                                  const filtered = selectedValues.filter(
                                    (v) => !v.startsWith("__OTHER__:")
                                  );

                                  if (field.maxSelections === 1) {
                                    controllerField.onChange([
                                      `__OTHER__:${val}`,
                                    ]);
                                  } else {
                                    controllerField.onChange([
                                      ...filtered,
                                      `__OTHER__:${val}`,
                                    ]);
                                  }
                                };

                                return (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <div
                                        role="button"
                                        tabIndex={0}
                                        className="w-full flex flex-wrap items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm min-h-[40px] cursor-pointer"
                                      >
                                        {selectedValues.length === 0 && (
                                          <span className="text-muted-foreground">
                                            Select option
                                          </span>
                                        )}

                                        {selectedValues.map((opt: string) => {
                                          const label = opt.startsWith(
                                            "__OTHER__:"
                                          )
                                            ? opt.replace("__OTHER__:", "")
                                            : opt;

                                          return (
                                            <Badge
                                              key={opt}
                                              variant="secondary"
                                              className="flex items-center gap-1"
                                            >
                                              {label}
                                              {isMultiple && (
                                                <span
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeOption(opt);
                                                  }}
                                                  className="cursor-pointer"
                                                >
                                                  <X className="h-3 w-3" />
                                                </span>
                                              )}
                                            </Badge>
                                          );
                                        })}

                                        <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                                      </div>
                                    </PopoverTrigger>

                                    <PopoverContent
                                      align="start"
                                      className="w-[var(--radix-popover-trigger-width)] p-0"
                                    >
                                      {field.options.length > 10 ? (
                                        <div className="p-2">
                                          <div className="flex flex-wrap gap-2">
                                            {field.options.map(
                                              (opt: string) => {
                                                const isSelected =
                                                  selectedValues.includes(opt);
                                                return (
                                                  <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() =>
                                                      toggleOption(opt)
                                                    }
                                                    className={`text-xs px-2.5 py-1 rounded-full border transition whitespace-nowrap
                                                    ${
                                                      isSelected
                                                        ? "bg-black text-white border-black"
                                                        : "bg-background text-foreground border-border hover:bg-muted"
                                                    }`}
                                                  >
                                                    {opt}
                                                  </button>
                                                );
                                              }
                                            )}
                                            {field.allowOther && (
                                              <button
                                                type="button"
                                                onClick={toggleOther}
                                                className={`text-xs px-2.5 py-1 rounded-full border transition whitespace-nowrap
                                                  ${
                                                    isOtherSelected
                                                      ? "bg-black text-white border-black"
                                                      : "bg-background text-foreground border-border hover:bg-muted"
                                                  }`}
                                              >
                                                Other
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      ) : (
                                        <Command>
                                          <CommandInput placeholder="Search..." />
                                          <CommandEmpty>
                                            No option found.
                                          </CommandEmpty>
                                          <CommandGroup>
                                            {field.options.map(
                                              (opt: string) => {
                                                const isSelected =
                                                  selectedValues.includes(opt);
                                                return (
                                                  <CommandItem
                                                    key={opt}
                                                    onSelect={() =>
                                                      toggleOption(opt)
                                                    }
                                                  >
                                                    <div className="flex items-center justify-between w-full">
                                                      <span>{opt}</span>
                                                      {isSelected && (
                                                        <Check className="h-4 w-4 text-primary" />
                                                      )}
                                                    </div>
                                                  </CommandItem>
                                                );
                                              }
                                            )}
                                            {field.allowOther && (
                                              <CommandItem
                                                onSelect={toggleOther}
                                              >
                                                <div className="flex items-center justify-between w-full">
                                                  <span>
                                                    Other (please specify)
                                                  </span>
                                                  {isOtherSelected && (
                                                    <Check className="h-4 w-4 text-primary" />
                                                  )}
                                                </div>
                                              </CommandItem>
                                            )}
                                          </CommandGroup>
                                        </Command>
                                      )}
                                      {field.allowOther && isOtherSelected && (
                                        <div className="p-3 border-t">
                                          <Input
                                            value={customValue.replace(
                                              "__OTHER__:",
                                              ""
                                            )}
                                            placeholder="Please specify"
                                            onChange={(e) =>
                                              updateOtherValue(e.target.value)
                                            }
                                          />
                                        </div>
                                      )}
                                    </PopoverContent>
                                  </Popover>
                                );
                              }}
                            />
                          ) : field.type === "checkbox" ? (
                            <Controller
                              control={control}
                              name={inputName}
                              rules={{
                                required: field.required
                                  ? `${field.label} is required`
                                  : false,
                              }}
                              render={({ field: controllerField }) => {
                                const value: string[] =
                                  controllerField.value || [];

                                const toggle = (option: string) => {
                                  // If already selected → remove
                                  if (value.includes(option)) {
                                    controllerField.onChange(
                                      value.filter((v) => v !== option)
                                    );
                                    return;
                                  }

                                  // If multiple is false → always replace
                                  if (field.multiple === false) {
                                    controllerField.onChange([option]);
                                    return;
                                  }

                                  // If maxSelections === 1 → replace
                                  if (field.maxSelections === 1) {
                                    controllerField.onChange([option]);
                                    return;
                                  }

                                  // Respect maxSelections > 1
                                  if (
                                    field.maxSelections &&
                                    value.length >= field.maxSelections
                                  ) {
                                    return;
                                  }

                                  // Normal multi-select
                                  controllerField.onChange([...value, option]);
                                };

                                return (
                                  <div className="space-y-5">
                                    {field.options.map((opt: string) => {
                                      const checked = value.includes(opt);

                                      return (
                                        <label
                                          key={opt}
                                          className="flex items-center gap-3 cursor-pointer mt-6"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggle(opt)}
                                            className="h-4 w-4"
                                          />
                                          <span className="text-sm">{opt}</span>
                                        </label>
                                      );
                                    })}

                                    {field.allowOther && (
                                      <label className="flex items-center gap-3">
                                        <input
                                          type="checkbox"
                                          checked={value.includes("__OTHER__")}
                                          onChange={() => toggle("__OTHER__")}
                                          className="h-4 w-4"
                                        />
                                        <span className="text-sm">
                                          Other (please specify)
                                        </span>
                                      </label>
                                    )}

                                    {value.includes("__OTHER__") && (
                                      <Input
                                        placeholder="Please specify"
                                        onChange={(e) => {
                                          const filtered = value.filter(
                                            (v) => v !== "__OTHER__"
                                          );
                                          controllerField.onChange([
                                            ...filtered,
                                            e.target.value,
                                          ]);
                                        }}
                                      />
                                    )}
                                  </div>
                                );
                              }}
                            />
                          ) : field.type === "radio" ? (
                            <Controller
                              control={control}
                              name={inputName}
                              rules={{
                                required: field.required
                                  ? `${field.label} is required`
                                  : false,
                              }}
                              render={({ field: controllerField }) => {
                                const value = controllerField.value;

                                return (
                                  <div className="space-y-3">
                                    {field.options.map((opt: string) => (
                                      <label
                                        key={opt}
                                        className="flex items-center gap-3 cursor-pointer"
                                      >
                                        <input
                                          type="radio"
                                          value={opt}
                                          checked={value === opt}
                                          onChange={() =>
                                            controllerField.onChange(opt)
                                          }
                                          className="h-4 w-4"
                                        />
                                        <span className="text-sm">{opt}</span>
                                      </label>
                                    ))}

                                    {field.allowOther && (
                                      <>
                                        <label className="flex items-center gap-3">
                                          <input
                                            type="radio"
                                            value="__OTHER__"
                                            checked={value === "__OTHER__"}
                                            onChange={() =>
                                              controllerField.onChange(
                                                "__OTHER__"
                                              )
                                            }
                                            className="h-4 w-4"
                                          />
                                          <span className="text-sm">
                                            Other (please specify)
                                          </span>
                                        </label>

                                        {value === "__OTHER__" && (
                                          <Input
                                            placeholder="Please specify"
                                            onChange={(e) =>
                                              controllerField.onChange(
                                                e.target.value
                                              )
                                            }
                                          />
                                        )}
                                      </>
                                    )}
                                  </div>
                                );
                              }}
                            />
                          ) : field.type === "file" ? (
                            <div className="relative">
                              <label
                                htmlFor={inputName}
                                className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 px-6 py-8 text-center cursor-pointer hover:bg-muted/40 transition"
                              >
                                <span className="text-sm font-medium">
                                  Drag & drop files here or click to upload
                                </span>

                                <span className="text-xs text-muted-foreground">
                                  {field.multiple
                                    ? "You can upload multiple files"
                                    : "Single file upload"}
                                </span>

                                <Input
                                  id={inputName}
                                  type="file"
                                  multiple={field.multiple}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  {...register(inputName, {
                                    onChange: (e: any) => {
                                      const files = Array.from(
                                        e.target.files || []
                                      ) as File[];

                                      // ---- Client-side validation ----
                                      if (
                                        files.length > MAX_FILES_PER_SUBMISSION
                                      ) {
                                        setFileErrorMessage(
                                          `You can upload a maximum of ${MAX_FILES_PER_SUBMISSION} files.`
                                        );
                                        setShowFileErrorModal(true);
                                        e.target.value = "";
                                        return;
                                      }

                                      for (const file of files) {
                                        if (file.size > MAX_FILE_SIZE_BYTES) {
                                          setFileErrorMessage(
                                            `File "${file.name}" exceeds the 10MB size limit.`
                                          );
                                          setShowFileErrorModal(true);
                                          e.target.value = "";
                                          return;
                                        }
                                      }

                                      setFilePreviews((prev: any) => {
                                        const previous = prev[inputName] || [];

                                        // cleanup old URLs
                                        previous.forEach((p: any) => {
                                          if (p.url) URL.revokeObjectURL(p.url);
                                        });

                                        const next = files.map((file: any) => ({
                                          file,
                                          url: URL.createObjectURL(file),
                                        }));

                                        return {
                                          ...prev,
                                          [inputName]: next,
                                        };
                                      });
                                    },
                                  })}
                                />
                              </label>
                              {filePreviews[inputName]?.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {filePreviews[inputName].map((item, i) => {
                                    const file = item.file;
                                    const previewUrl = item.url;

                                    return (
                                      <div
                                        key={i}
                                        className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm"
                                      >
                                        <div className="flex items-center gap-3 min-w-0">
                                          <span className="flex items-center">
                                            {file.type.startsWith("image/") ? (
                                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                            ) : file.type.includes("pdf") ||
                                              file.type.includes("word") ||
                                              file.name.endsWith(".docx") ? (
                                              <FileText className="h-5 w-5 text-muted-foreground" />
                                            ) : file.type.includes("zip") ? (
                                              <FileArchive className="h-5 w-5 text-muted-foreground" />
                                            ) : (
                                              <Paperclip className="h-5 w-5 text-muted-foreground" />
                                            )}
                                          </span>
                                          <a
                                            href={previewUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="truncate underline hover:text-primary"
                                          >
                                            {file.name}
                                          </a>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="text-xs text-muted-foreground">
                                            {(file.size / 1024).toFixed(1)} KB
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              removeFile(inputName, i)
                                            }
                                            className="text-red-500 hover:text-red-700 text-xs"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ) : (
                            <Input
                              id={inputName}
                              type={field.type}
                              placeholder={field.placeholder}
                              {...register(inputName, {
                                required: field.required
                                  ? `${field.label} is required`
                                  : false,
                              })}
                            />
                          )}

                          {(errors as any)?.[section.id]?.[field.id] && (
                            <p className="text-sm text-red-500">
                              {
                                (errors as any)[section.id][field.id]
                                  ?.message as string
                              }
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-6">
                    <div className="h-px bg-border" />
                  </div>
                </div>
              ))}

              <div className="pt-12">
                <div className="rounded-xl border bg-muted/40 px-6 py-6">
                  <div className="flex flex-col items-center gap-4">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full max-w-md text-base font-medium
                   bg-gradient-to-r from-slate-900 to-slate-800
                   hover:from-slate-800 hover:to-slate-700
                   shadow-lg"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground max-w-md">
                      By submitting this application, you confirm that all
                      information provided is accurate. We'll get back to you
                      soon!
                    </p>
                  </div>
                </div>
              </div>
            </form>
            {errorElement && errorMessage && (
              <ErrorPopover reference={errorElement} message={errorMessage} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* FILE VALIDATION ERROR MODAL */}
      <AlertDialog
        open={showFileErrorModal}
        onOpenChange={setShowFileErrorModal}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <X className="h-6 w-6 text-red-600" />
            </div>

            <AlertDialogTitle className="text-center text-lg font-semibold">
              File upload error
            </AlertDialogTitle>

            <AlertDialogDescription className="text-center text-sm text-muted-foreground">
              {fileErrorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4">
            <AlertDialogAction className="w-full">Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* SUBMITTING MODAL */}
      <AlertDialog open={isSubmitting}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>

            <AlertDialogTitle className="text-center text-lg font-semibold">
              Submitting your application
            </AlertDialogTitle>

            <AlertDialogDescription className="text-center text-sm text-muted-foreground">
              Please wait while we securely upload your files and process your
              submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      {/* CONFIRMATION MODAL */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="space-y-4">
            {/* ICON */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="text-green-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <AlertDialogTitle className="text-center text-lg font-semibold">
              Application submitted successfully
            </AlertDialogTitle>

            <AlertDialogDescription asChild>
              <div className="space-y-3 text-center text-sm text-muted-foreground">
                <p>
                  Thank you for applying to{" "}
                  <span className="font-medium text-foreground">r/alevel</span>.
                  Your application has been received and recorded.
                </p>

                <p>
                  Our team will carefully review your submission and contact you
                  within the next few days.
                </p>

                <div className="rounded-md bg-muted px-3 py-2 text-sm">
                  Please watch for emails from
                  <br />
                  <span className="font-medium text-foreground">
                    application@ralevel.com
                  </span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4">
            <AlertDialogAction className="w-full">Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DUPLICATE SUBMISSION MODAL */}
      <AlertDialog
        open={showDuplicateModal}
        onOpenChange={setShowDuplicateModal}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="text-yellow-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01"
                />
              </svg>
            </div>

            <AlertDialogTitle className="text-center text-lg font-semibold">
              Already Submitted
            </AlertDialogTitle>

            <AlertDialogDescription asChild>
              <div className="space-y-3 text-center text-sm text-muted-foreground">
                <p>
                  Our records show that this email has already submitted an
                  application for this intake.
                </p>

                <p>
                  If you believe this is a mistake, please contact the team at:
                </p>

                <div className="rounded-md bg-muted px-3 py-2 text-sm">
                  <span className="font-medium text-foreground">
                    application@ralevel.com
                  </span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4">
            <AlertDialogAction className="w-full">Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
