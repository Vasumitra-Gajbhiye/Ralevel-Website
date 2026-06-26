import { DiscordApiError } from "./sendMessage";

const DISCORD_API_BASE = "https://discord.com/api/v10";

export async function unbanMember(
  botToken: string,
  guildId: string,
  userId: string,
): Promise<void> {
  const response = await fetch(
    `${DISCORD_API_BASE}/guilds/${guildId}/bans/${userId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    },
  );

  if (!response.ok && response.status !== 404) {
    const body = await response.text();
    throw new DiscordApiError(`Failed to unban member`, response.status, body);
  }
}
