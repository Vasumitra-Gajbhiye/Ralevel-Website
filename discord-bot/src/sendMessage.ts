import type { DiscordMessagePayload } from "./types";

const DISCORD_API_BASE = "https://discord.com/api/v10";

export class DiscordApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: string,
  ) {
    super(message);
    this.name = "DiscordApiError";
  }
}

export async function sendChannelMessage(
  botToken: string,
  channelId: string,
  payload: DiscordMessagePayload,
): Promise<void> {
  const response = await fetch(
    `${DISCORD_API_BASE}/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new DiscordApiError(
      `Discord API returned ${response.status}`,
      response.status,
      body,
    );
  }
}
