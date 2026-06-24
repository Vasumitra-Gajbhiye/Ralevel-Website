import { buildPingPayload } from "./buildPingContent";
import { formatSubmissionEmbed } from "./formatEmbed";
import { sendChannelMessage } from "./sendMessage";
import type { FormSubmissionNotification } from "./types";

export type { FormSubmissionNotification } from "./types";
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
  const pingPayload = buildPingPayload(data.pingUserIds);

  await sendChannelMessage(config.botToken, config.channelId, {
    embeds: [embed],
    ...pingPayload,
  });
}
