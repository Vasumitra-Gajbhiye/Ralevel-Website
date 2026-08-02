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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useClerk } from "@clerk/nextjs";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { DiscordIdentity } from "./types";

type BanAppealFormValues = {
  readRules: boolean;
  banId: string;
  q1: string;
  q2: string;
  q3: string;
  confirmSubmit: boolean;
  website: string;
};

const MIN_CHARS = 100;
const MAX_CHARS = 1024;
const MAX_BAN_ID = 128;

const APPEAL_PURPLE = "#674AB3";
const APPEAL_PURPLE_LIGHT = "#CEA2D7";

const stepCircleBase =
  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold";

type BanAppealClientProps = {
  rulesContent: string[];
  userEmail: string;
  userName: string | null;
  discord: DiscordIdentity;
  onDiscordDisconnected: () => void;
};

function discordAvatarUrl(identity: DiscordIdentity): string | null {
  if (!identity.discordAvatar) return null;
  return `https://cdn.discordapp.com/avatars/${identity.discordUserId}/${identity.discordAvatar}.png`;
}

export default function BanAppealClient({
  rulesContent,
  userEmail,
  userName,
  discord,
  onDiscordDisconnected,
}: BanAppealClientProps) {
  const { signOut } = useClerk();
  const [step, setStep] = useState(1);
  const [disconnecting, setDisconnecting] = useState<"google" | "discord" | null>(
    null,
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<BanAppealFormValues>({
    defaultValues: {
      readRules: false,
      banId: "",
      q1: "",
      q2: "",
      q3: "",
      confirmSubmit: false,
      website: "",
    },
    mode: "onBlur",
  });

  async function goNext() {
    if (step === 1) {
      const valid = await trigger(["readRules", "banId"]);
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

  async function handleDisconnectGoogle() {
    setDisconnecting("google");
    try {
      await signOut({ redirectUrl: "/ban-appeal" });
    } catch {
      toast.error("Failed to sign out. Please try again.");
      setDisconnecting(null);
    }
  }

  async function handleDisconnectDiscord() {
    setDisconnecting("discord");
    try {
      const res = await fetch("/api/discord-appeal/session", {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Failed to disconnect Discord. Please try again.");
        return;
      }
      toast.success("Disconnected from Discord.");
      onDiscordDisconnected();
    } catch {
      toast.error("Failed to disconnect Discord. Please try again.");
    } finally {
      setDisconnecting(null);
    }
  }

  const onSubmit = async (data: BanAppealFormValues) => {
    try {
      const res = await fetch("/api/ban-appeal/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          banId: data.banId,
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

  const avatarUrl = discordAvatarUrl(discord);

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-20">
        <Card className="overflow-hidden border-none shadow-2xl">
          <div className="h-36 w-full bg-gradient-to-r from-indigo-400 to-violet-600" />

          <div className="space-y-4 px-10 pt-8 pb-4">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                Ban Appeal
              </h1>
              <p className="max-w-3xl text-base text-muted-foreground">
                Submit a ban appeal for the r/alevel Discord server. You will be
                notified of the decision by email.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-sm">
                <span className="font-medium">Google</span>
                <span className="max-w-[180px] truncate text-muted-foreground">
                  {userName ? `${userName} · ` : ""}
                  {userEmail}
                </span>
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline hover:text-foreground"
                  disabled={disconnecting === "google"}
                  onClick={handleDisconnectGoogle}
                >
                  {disconnecting === "google" ? "…" : "Disconnect"}
                </button>
              </div>
              <div className="flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-sm">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={discord.discordUsername}
                    width={20}
                    height={20}
                    className="h-5 w-5 rounded-full"
                  />
                ) : null}
                <span className="font-medium">@{discord.discordUsername}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {discord.discordUserId}
                </span>
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline hover:text-foreground"
                  disabled={disconnecting === "discord"}
                  onClick={handleDisconnectDiscord}
                >
                  {disconnecting === "discord" ? "…" : "Disconnect"}
                </button>
              </div>
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
                    <Label htmlFor="banId">
                      Ban ID <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enter the Ban ID you received when you were banned. Do not
                      share it with anyone.
                    </p>
                    <Input
                      id="banId"
                      autoComplete="off"
                      placeholder="Your Ban ID"
                      {...register("banId", {
                        required: "Ban ID is required",
                        validate: (value) => {
                          const trimmed = value.trim();
                          if (!trimmed) return "Ban ID is required";
                          if (trimmed.length > MAX_BAN_ID) {
                            return `Ban ID must be at most ${MAX_BAN_ID} characters`;
                          }
                          return true;
                        },
                      })}
                    />
                    {errors.banId && (
                      <p className="text-sm text-red-500">
                        {errors.banId.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-semibold uppercase tracking-wide">
                      Ban Appeal
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Please provide detailed responses. A proper grammatical
                      structure is required.
                    </p>
                  </div>

                  {(
                    [
                      [
                        "q1",
                        "What do you know about why you were banned?",
                      ],
                      [
                        "q2",
                        "Do you feel the action taken was reasonable or unreasonable? Explain why.",
                      ],
                      ["q3", "Why should your appeal be accepted?"],
                    ] as const
                  ).map(([fieldName, label], index) => (
                    <div key={fieldName} className="space-y-3">
                      <Label htmlFor={fieldName}>
                        Q{index + 1}. {label}{" "}
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
                  ))}
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
                        confident with submitting this appeal form. The decision
                        will be emailed to {userEmail}.
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
              Your ban appeal has been received. You will be notified by email
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
