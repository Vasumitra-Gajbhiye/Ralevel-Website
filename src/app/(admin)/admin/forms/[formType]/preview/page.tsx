"use client";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { CreateFormValues } from "@/types/form";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import { Check, ChevronDown } from "lucide-react";

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

export default function FormPageClient() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const [form, setForm] = useState<CreateFormValues | null>(null);
  const [errorElement, setErrorElement] = useState<HTMLElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("form-preview");
    if (stored) {
      setForm(JSON.parse(stored));
    }
  }, []);
  const {
    register,
    handleSubmit,
    reset,
    control,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm({
    shouldFocusError: true,
    mode: "onBlur",
  });

  const onSubmit = async (data: any) => {
    if (!form) return;
    try {
      let res: Response;

      // 🔹 RESOURCE FORM → multipart + Drive
      if (form.slug === "resource") {
        const formData = new FormData();

        // 🔑 map form fields → API fields
        const keyMap: Record<string, string> = {
          "contributor.fullName": "fullName",
          "contributor.email": "email",
          "contributor.discordOrRedditId": "discordOrRedditId",

          "academic.board": "board",
          "academic.subject": "subject",
          "academic.topic": "topic",

          "resource.resourceTitle": "resourceTitle",
          "resource.description": "description",
          "resource.resourceType": "resourceType", // ✅ ADD THIS

          "resourceContent.links": "links",
        };

        for (const section of form.sections) {
          for (const field of section.fields) {
            const value = data?.[section.id]?.[field.id];
            if (value === undefined || value === null) continue;

            // 📁 FILES (handle BEFORE keyMap)
            if (field.type === "file") {
              if (value instanceof FileList) {
                Array.from(value).forEach((file) => {
                  formData.append("files", file);
                });
              }
              continue; // ⬅️ important
            }

            const flatKey = keyMap[`${section.id}.${field.id}`];
            if (!flatKey) continue;
            else if (Array.isArray(value)) {
              value.forEach((v) => formData.append(flatKey, String(v)));
            } else {
              formData.append(flatKey, String(value));
            }
          }
        }

        res = await fetch("/api/resources/submit", {
          method: "POST",
          body: formData, // ❗ no headers
        });
      }

      // 🔹 ALL OTHER FORMS → JSON
      else {
        const enrichedResponses = buildStructuredResponses(form, data);

        res = await fetch(`/api/forms/${form.slug}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cycleId: form.cycleId, // ✅ inject here
            formType: form.slug, // ✅ inject here
            responses: enrichedResponses,
          }),
        });
      }

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setShowDuplicateModal(true);
          return;
        }

        toast.error(json.message || "Submission failed");
        return;
      }

      setShowConfirmation(true);
      reset();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  if (!form) return;

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
                                    v.startsWith("__OTHER__:"),
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
                                      current.filter((v) => v !== option),
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
                                    selectedValues.filter((v) => v !== option),
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
                                        (v) => !v.startsWith("__OTHER__:"),
                                      ),
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
                                  if (!isMultiple) {
                                    controllerField.onChange(
                                      `__OTHER__:${val}`,
                                    );
                                    return;
                                  }

                                  const filtered = selectedValues.filter(
                                    (v) => !v.startsWith("__OTHER__:"),
                                  );

                                  if (field.maxSelections === 1) {
                                    controllerField.onChange([
                                      `__OTHER__:${val}`,
                                    ]);
                                    return;
                                  }

                                  controllerField.onChange([
                                    ...filtered,
                                    `__OTHER__:${val}`,
                                  ]);
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
                                            "__OTHER__:",
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
                                        <div className="p-3">
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
                                              },
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
                                              },
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
                                              "",
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
                                      value.filter((v) => v !== option),
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
                                            (v) => v !== "__OTHER__",
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
                                                "__OTHER__",
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
                                                e.target.value,
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
                            <Input
                              id={inputName}
                              type="file"
                              multiple={field.multiple}
                              {...register(inputName)}
                            />
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
                      {"Submit Application"}
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
