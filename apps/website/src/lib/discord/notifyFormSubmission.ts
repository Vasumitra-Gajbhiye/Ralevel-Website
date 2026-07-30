import { notifyBotApplicationSubmitted } from "@/lib/discord/botClient";

export type FormSubmissionNotifyInput = {
  formTitle: string;
  formType: string;
  formSlug: string;
  cycleId: number;
  submitterName?: string;
  submitterEmail?: string;
  submissionId: string;
  hasFiles: boolean;
  pingUserIds: string[];
};

/** Ensures a valid http(s) origin — Discord rejects bare hosts like `localhost:3000`. */
export function normalizeSiteUrl(url: string | undefined): string {
  const raw = url?.trim().replace(/\/$/, "") ?? "";
  if (!raw) return "https://ralevel.com";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `http://${raw}`;
}

export function buildAdminUrl(input: {
  formType: string;
  formSlug: string;
  submissionId: string;
}): string {
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_URL);
  return `${siteUrl}/admin/forms/${input.formType}/${input.formSlug}/responses/${input.submissionId}`;
}

/**
 * Fire-and-forget: asks the applications bot to post the Discord ping.
 * Does nothing if BOT_INTERNAL_URL / INTERNAL_BOT_SECRET are unset.
 */
export async function notifyFormSubmission(
  data: FormSubmissionNotifyInput,
): Promise<void> {
  await notifyBotApplicationSubmitted(data);
}
