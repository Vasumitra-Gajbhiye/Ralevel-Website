import { DiscordApiError } from "./sendMessage";

const DISCORD_API_BASE = "https://discord.com/api/v10";

export async function createDmChannel(
  botToken: string,
  recipientId: string,
): Promise<string> {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me/channels`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recipient_id: recipientId }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new DiscordApiError(
      `Failed to create DM channel`,
      response.status,
      body,
    );
  }

  const data = (await response.json()) as { id: string };
  return data.id;
}

export async function sendDirectMessage(
  botToken: string,
  recipientId: string,
  content: string,
): Promise<void> {
  const channelId = await createDmChannel(botToken, recipientId);

  const response = await fetch(
    `${DISCORD_API_BASE}/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new DiscordApiError(`Failed to send DM`, response.status, body);
  }
}
