import {
  buildAppealActionRow,
  formatAppealEmbed,
  type DiscordAppealNotification,
} from "./formatAppealEmbed";
import { sendChannelMessage } from "./sendMessage";

export async function postAppealReviewMessage(
  botToken: string,
  channelId: string,
  data: DiscordAppealNotification,
): Promise<string> {
  const embed = formatAppealEmbed(data);
  const components = [buildAppealActionRow(data.submissionId)];

  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ embeds: [embed], components }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Discord API returned ${response.status}: ${body}`);
  }

  const message = (await response.json()) as { id: string };
  return message.id;
}

export async function editAppealReviewMessage(
  botToken: string,
  channelId: string,
  messageId: string,
  data: DiscordAppealNotification,
): Promise<void> {
  const embed = formatAppealEmbed(data);
  const components = [buildAppealActionRow(data.submissionId, true)];

  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ embeds: [embed], components }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Discord API returned ${response.status}: ${body}`);
  }
}
