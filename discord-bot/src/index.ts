import { buildPingPayload } from "./buildPingContent";
import { formatSubmissionEmbed } from "./formatEmbed";
import { formatReminderEmbed } from "./formatReminderEmbed";
import { sendChannelMessage } from "./sendMessage";
import type {
  FormReminderNotification,
  FormSubmissionNotification,
} from "./types";

export type { FormSubmissionNotification, FormReminderNotification } from "./types";
export { DiscordApiError } from "./sendMessage";

export type DiscordConfig = {
  botToken: string;
  channelId: string;
};

export async function notifyNewSubmission(
  config: DiscordConfig,
  data: FormSubmissionNotification,
): Promise<void> {
  const embed = formatSubmissionEmbed(data);
  const pingPayload = buildPingPayload({ userIds: data.pingUserIds });

  await sendChannelMessage(config.botToken, config.channelId, {
    embeds: [embed],
    ...pingPayload,
  });
}

export async function notifyFormReminder(
  config: DiscordConfig,
  data: FormReminderNotification,
): Promise<void> {
  const embed = formatReminderEmbed(data);
  const pingPayload = buildPingPayload({
    userIds: data.pingUserIds,
    roleIds: data.pingRoleIds,
  });

  await sendChannelMessage(config.botToken, config.channelId, {
    embeds: [embed],
    ...pingPayload,
  });
}
