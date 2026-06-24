import {
  notifyFormReminder,
  type FormReminderNotification,
} from "@r-alevel/discord-bot";
import {
  buildAdminUrl,
  getDiscordConfig,
} from "@/lib/discord/notifyFormSubmission";

export type FormReminderNotifyInput = Omit<
  FormReminderNotification,
  "adminUrl"
>;

export async function notifyFormReminderDiscord(
  data: FormReminderNotifyInput,
): Promise<void> {
  const config = getDiscordConfig();
  if (!config) return;

  await notifyFormReminder(config, {
    ...data,
    adminUrl: buildAdminUrl({
      formType: data.formType,
      formSlug: data.formSlug,
      submissionId: data.submissionId,
    }),
  });
}

export function getReminderRoleIds(tier: 5 | 7): string[] {
  const jrAdmin = process.env.DISCORD_JR_ADMIN_ROLE_ID?.trim();
  const srAdmin = process.env.DISCORD_SR_ADMIN_ROLE_ID?.trim();

  if (tier === 5) {
    return jrAdmin ? [jrAdmin] : [];
  }

  const roleIds: string[] = [];
  if (jrAdmin) roleIds.push(jrAdmin);
  if (srAdmin) roleIds.push(srAdmin);
  return roleIds;
}
