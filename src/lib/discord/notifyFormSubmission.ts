import {
  notifyNewSubmission,
  type FormSubmissionNotification,
} from "@r-alevel/discord-bot";

export type FormSubmissionNotifyInput = Omit<
  FormSubmissionNotification,
  "adminUrl"
>;

function isEnabled(): boolean {
  const flag = process.env.DISCORD_NOTIFICATIONS_ENABLED?.toLowerCase();
  return flag === "true" || flag === "1";
}

function getConfig():
  | { botToken: string; channelId: string }
  | null {
  if (!isEnabled()) return null;

  const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
  const channelId = process.env.DISCORD_APPLICATIONS_CHANNEL_ID?.trim();

  if (!botToken || !channelId) {
    console.warn(
      "[discord] notifications enabled but DISCORD_BOT_TOKEN or DISCORD_APPLICATIONS_CHANNEL_ID is missing",
    );
    return null;
  }

  return { botToken, channelId };
}

/** Ensures a valid http(s) origin — Discord rejects bare hosts like `localhost:3000`. */
export function normalizeSiteUrl(url: string | undefined): string {
  const raw = url?.trim().replace(/\/$/, "") ?? "";
  if (!raw) return "https://ralevel.com";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `http://${raw}`;
}

function buildAdminUrl(input: FormSubmissionNotifyInput): string {
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_URL);
  return `${siteUrl}/admin/forms/${input.formType}/${input.formSlug}/responses/${input.submissionId}`;
}

export async function notifyFormSubmission(
  data: FormSubmissionNotifyInput,
): Promise<void> {
  const config = getConfig();
  if (!config) return;

  await notifyNewSubmission(config, {
    ...data,
    adminUrl: buildAdminUrl(data),
  });
}
