import "server-only";

import { Resend } from "resend";

// Same default as the bot (apps/bot/src/lib/appeals.ts). Locally, set
// RESEND_FROM_EMAIL=onboarding@resend.dev to send from your own Resend account.
const DEFAULT_FROM = "r/alevel <application@ralevel.com>";

let resend: Resend | null = null;

export type SendEmailResult =
  | { status: "sent" }
  /** No RESEND_API_KEY outside production: the email was logged, not sent. */
  | { status: "skipped" }
  | { status: "failed"; error: unknown };

export async function sendEmail(message: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[email] RESEND_API_KEY is not set, skipped "${message.subject}" to ${message.to}`,
      );
      return { status: "skipped" };
    }
    return { status: "failed", error: new Error("RESEND_API_KEY is not set") };
  }

  resend ??= new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM,
      ...message,
    });
    return error ? { status: "failed", error } : { status: "sent" };
  } catch (error) {
    return { status: "failed", error };
  }
}
