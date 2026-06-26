"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

type AppealType = "ban" | "warning" | "timeout";

type AppealFormValues = {
  readRules: boolean;
  appealType: AppealType | "";
  q1: string;
  q2: string;
  q3: string;
  confirmSubmit: boolean;
  website: string;
};

type DiscordSession = {
  discordUserId: string;
  discordUsername: string;
  discordAvatar?: string;
};

const APPEAL_TYPE_OPTIONS: { value: AppealType; label: string }[] = [
  { value: "ban", label: "Ban Appeal" },
  { value: "warning", label: "Warnings Appeal" },
  { value: "timeout", label: "Immediate Timeout/Mute Removal" },
];

const STEP_TITLES: Record<AppealType, string> = {
  ban: "Ban Appeal",
  warning: "Warnings Appeal",
  timeout: "Immediate Timeout/Mute Removal",
};

const Q1_LABELS: Record<AppealType, string> = {
  ban: "What do you know about why you were banned?",
  warning: "What do you know about why you were warned?",
  timeout: "What do you know about why you were timed out/muted?",
};

const MIN_CHARS = 100;
const MAX_CHARS = 1024;

const APPEAL_PURPLE = "#674AB3";
const APPEAL_PURPLE_LIGHT = "#CEA2D7";

const stepCircleBase =
  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold";

function discordAvatarUrl(session: DiscordSession): string | null {
  if (!session.discordAvatar) return null;
  return `https://cdn.discordapp.com/avatars/${session.discordUserId}/${session.discordAvatar}.png`;
}

type AppealClientProps = {
  rulesContent: string[];
  authError?: string;
};

export default function AppealClient({
  rulesContent,
  authError,
}: AppealClientProps) {
  const [step, setStep] = useState(1);
  const [session, setSession] = useState<DiscordSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<AppealFormValues>({
    defaultValues: {
      readRules: false,
      appealType: "",
      q1: "",
      q2: "",
      q3: "",
      confirmSubmit: false,
      website: "",
    },
    mode: "onBlur",
  });

  const appealType = watch("appealType") as AppealType | "";

  useEffect(() => {
    if (authError === "oauth_denied") {
      toast.error("Discord authorization was cancelled.");
    } else if (authError === "form_banned") {
      toast.error("You are banned from accessing this form.");
    } else if (authError === "oauth_failed" || authError === "oauth_invalid") {
      toast.error("Discord sign-in failed. Please try again.");
    } else if (authError === "oauth_state") {
      toast.error("Discord sign-in expired. Please try again.");
    }
  }, [authError]);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/discord-appeal/session");
        if (res.ok) {
          const data = await res.json();
          setSession({
            discordUserId: data.discordUserId,
            discordUsername: data.discordUsername,
            discordAvatar: data.discordAvatar,
          });
        }
      } catch {
        // unauthenticated
      } finally {
        setSessionLoading(false);
      }
    }

    loadSession();
  }, []);

  const step2Title = useMemo(() => {
    if (!appealType) return "Appeal Questions";
    return STEP_TITLES[appealType];
  }, [appealType]);

  const q1Label = useMemo(() => {
    if (!appealType) return "Question 1";
    return Q1_LABELS[appealType];
  }, [appealType]);

  async function goNext() {
    if (step === 1) {
      const valid = await trigger(["readRules", "appealType"]);
      if (!valid) return;
    }
    if (step === 2) {
      const valid = await trigger(["q1", "q2", "q3"]);
      if (!valid) return;
    }
    setStep((s) => Math.min(3, s + 1));
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  const onSubmit = async (data: AppealFormValues) => {
    if (!session) {
      toast.error("Please connect your Discord account first.");
      return;
    }

    try {
      const res = await fetch("/api/discord-appeal/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appealType: data.appealType,
          responses: { q1: data.q1, q2: data.q2, q3: data.q3 },
          website: data.website,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Submission failed");
        return;
      }

      setShowSuccess(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-24">
        <Card className="w-full max-w-lg border-muted/60 p-2 shadow-xl">
          <CardContent className="space-y-6 px-6 py-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">
              Discord Ban Appeal
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Connect your Discord account to submit an appeal. You must
              authorize the application on the account you wish to be unbanned.
            </p>
            <Button asChild size="lg" className="w-full py-6 text-base">
              <a href="/api/discord-appeal/auth">Connect with Discord</a>
            </Button>
            <p className="text-sm text-muted-foreground">
              Discord may ask permission to send you direct messages so we can
              confirm your submission was received.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avatarUrl = discordAvatarUrl(session);

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-20">
        <Card className="overflow-hidden border-none shadow-2xl">
          <div className="h-36 w-full bg-gradient-to-r from-indigo-400 to-violet-600" />

          <div className="flex items-start justify-between px-10 pt-8 pb-4">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                Discord Ban Appeal
              </h1>
              <p className="max-w-3xl text-base text-muted-foreground">
                Submit an appeal for a ban, warning, or timeout on the r/alevel
                Discord server.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-full border bg-muted/40 px-2 py-1">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={session.discordUsername}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: APPEAL_PURPLE }}
                >
                  {session.discordUsername.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium">
                {session.discordUsername}
              </span>
            </div>
          </div>

          <div className="px-10 pb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center gap-2">
                  <span
                    className={cn(
                      stepCircleBase,
                      step < n && "bg-muted text-muted-foreground",
                    )}
                    style={
                      step === n
                        ? { backgroundColor: APPEAL_PURPLE, color: "#fff" }
                        : step > n
                          ? {
                              backgroundColor: APPEAL_PURPLE_LIGHT,
                              color: APPEAL_PURPLE,
                            }
                          : undefined
                    }
                  >
                    {n}
                  </span>
                  {n < 3 && <span className="h-px w-8 bg-border" />}
                </div>
              ))}
            </div>
          </div>

          <CardContent className="px-10 pb-10">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                {...register("website")}
              />

              {step === 1 && (
                <div className="space-y-8">
                  <div className="rounded-xl border bg-muted/40 px-6 py-5">
                    <ul className="space-y-2">
                      {rulesContent.map((rule, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span
                            className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                            style={{ backgroundColor: APPEAL_PURPLE }}
                          />
                          <span className="text-sm leading-relaxed text-muted-foreground">
                            {rule}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3 rounded-xl border px-6 py-5">
                    <Label>
                      Have you read all the information above?{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="readRules"
                      rules={{
                        validate: (value) =>
                          value ||
                          "You must confirm you have read the information",
                      }}
                      render={({ field }) => (
                        <label className="flex cursor-pointer items-center gap-3">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(checked === true)
                            }
                          />
                          <span className="text-sm">I have.</span>
                        </label>
                      )}
                    />
                    {errors.readRules && (
                      <p className="text-sm text-red-500">
                        {errors.readRules.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 rounded-xl border px-6 py-5">
                    <div>
                      <Label className="text-base font-semibold uppercase tracking-wide">
                        Check <span className="text-red-500">*</span>
                      </Label>
                      <p className="mt-1 text-sm text-muted-foreground">
                        What are you submitting?
                      </p>
                    </div>
                    <Controller
                      control={control}
                      name="appealType"
                      rules={{ required: "Please select an appeal type" }}
                      render={({ field }) => (
                        <div className="space-y-3">
                          {APPEAL_TYPE_OPTIONS.map((opt) => (
                            <label
                              key={opt.value}
                              className="flex cursor-pointer items-center gap-3"
                            >
                              <input
                                type="radio"
                                value={opt.value}
                                checked={field.value === opt.value}
                                onChange={() => field.onChange(opt.value)}
                                className="h-4 w-4"
                              />
                              <span className="text-sm">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    />
                    {errors.appealType && (
                      <p className="text-sm text-red-500">
                        {errors.appealType.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-semibold uppercase tracking-wide">
                      {step2Title}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Please provide detailed responses. A proper grammatical
                      structure is required.
                    </p>
                  </div>

                  {(["q1", "q2", "q3"] as const).map((fieldName, index) => {
                    const labels = [
                      q1Label,
                      "Do you feel the action taken was reasonable or unreasonable? Explain why.",
                      "Why should your appeal be accepted?",
                    ];

                    return (
                      <div key={fieldName} className="space-y-3">
                        <Label htmlFor={fieldName}>
                          Q{index + 1}. {labels[index]}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id={fieldName}
                          rows={5}
                          placeholder={`[Minimum ${MIN_CHARS} Characters]`}
                          {...register(fieldName, {
                            required: "This field is required",
                            minLength: {
                              value: MIN_CHARS,
                              message: `Minimum ${MIN_CHARS} characters required`,
                            },
                            maxLength: {
                              value: MAX_CHARS,
                              message: `Maximum ${MAX_CHARS} characters allowed`,
                            },
                          })}
                        />
                        {errors[fieldName] && (
                          <p className="text-sm text-red-500">
                            {errors[fieldName]?.message}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-semibold uppercase tracking-wide">
                    Confirmation
                  </h2>
                  <div className="space-y-3 rounded-xl border px-6 py-5">
                    <div>
                      <Label className="text-base font-semibold uppercase tracking-wide">
                        Check <span className="text-red-500">*</span>
                      </Label>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Ensure that you have read through your responses and are
                        confident with submitting this appeal form.
                      </p>
                    </div>
                    <Controller
                      control={control}
                      name="confirmSubmit"
                      rules={{
                        validate: (value) =>
                          value || "You must confirm before submitting",
                      }}
                      render={({ field }) => (
                        <label className="flex cursor-pointer items-center gap-3">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(checked === true)
                            }
                          />
                          <span className="text-sm font-medium">
                            I wish to submit my appeal form.
                          </span>
                        </label>
                      )}
                    />
                    {errors.confirmSubmit && (
                      <p className="text-sm text-red-500">
                        {errors.confirmSubmit.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-10 flex items-center justify-between">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={goBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={goNext}
                    className="text-white shadow hover:opacity-90"
                    style={{ backgroundColor: APPEAL_PURPLE }}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="text-white shadow hover:opacity-90"
                    style={{ backgroundColor: APPEAL_PURPLE }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit
                        <Check className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <AlertDialogTitle className="text-center">
              Appeal Submitted
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center leading-relaxed">
              Your appeal has been received. You will be notified via Discord DM
              once it has been reviewed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
