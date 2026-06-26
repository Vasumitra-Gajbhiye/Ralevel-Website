import { normalizeSiteUrl } from "@/lib/discord/notifyFormSubmission";

export type DiscordAppealConfig = {
  clientId: string;
  clientSecret: string;
  publicKey: string;
  botToken: string;
  guildId: string;
  banAppealChannelId: string;
  reviewerRoleIds: string[];
};

function parseReviewerRoleIds(): string[] {
  const explicit = process.env.DISCORD_APPEAL_REVIEWER_ROLE_IDS?.trim();
  if (explicit) {
    return explicit
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }

  const fallback = [
    process.env.DISCORD_JR_ADMIN_ROLE_ID,
    process.env.DISCORD_SR_ADMIN_ROLE_ID,
  ]
    .map((id) => id?.trim())
    .filter((id): id is string => Boolean(id));

  return fallback;
}

export function getDiscordPublicKey(): string | null {
  return process.env.DISCORD_PUBLIC_KEY?.trim() || null;
}

export function getDiscordAppealConfig(): DiscordAppealConfig | null {
  const clientId = process.env.DISCORD_CLIENT_ID?.trim();
  const clientSecret = process.env.DISCORD_CLIENT_SECRET?.trim();
  const publicKey = process.env.DISCORD_PUBLIC_KEY?.trim();
  const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
  const guildId = process.env.DISCORD_GUILD_ID?.trim();
  const banAppealChannelId = process.env.DISCORD_BAN_APPEAL_CHANNEL_ID?.trim();

  if (
    !clientId ||
    !clientSecret ||
    !publicKey ||
    !botToken ||
    !guildId ||
    !banAppealChannelId
  ) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    publicKey,
    botToken,
    guildId,
    banAppealChannelId,
    reviewerRoleIds: parseReviewerRoleIds(),
  };
}

export function getDiscordAppealSiteUrl(): string {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_URL);
}

export function getDiscordAppealRedirectUri(siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, "");
  return `${base}/api/discord-appeal/callback`;
}

export function buildDiscordAppealFormUrl(
  path = "/discord-appeal-form",
): string {
  return new URL(path, getDiscordAppealSiteUrl()).toString();
}
