import { getDiscordAppealConfig } from "./config";

export async function fetchGuildMemberRoles(
  botToken: string,
  guildId: string,
  userId: string,
): Promise<string[]> {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
    {
      headers: { Authorization: `Bot ${botToken}` },
    },
  );

  if (!response.ok) {
    return [];
  }

  const member = (await response.json()) as { roles?: string[] };
  return member.roles ?? [];
}

export function memberHasReviewerRole(
  memberRoleIds: string[],
  reviewerRoleIds: string[],
): boolean {
  if (reviewerRoleIds.length === 0) return false;
  return memberRoleIds.some((roleId) => reviewerRoleIds.includes(roleId));
}

export async function isDiscordAppealReviewer(
  discordUserId: string,
): Promise<boolean> {
  const config = getDiscordAppealConfig();
  if (!config) return false;

  const roles = await fetchGuildMemberRoles(
    config.botToken,
    config.guildId,
    discordUserId,
  );

  return memberHasReviewerRole(roles, config.reviewerRoleIds);
}
