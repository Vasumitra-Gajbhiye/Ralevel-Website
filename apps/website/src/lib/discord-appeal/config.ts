import { normalizeSiteUrl } from "@/lib/discord/notifyFormSubmission";

export const DISCORD_APPEAL_INVITE_URL = "https://discord.gg/xEk5GsgfHC";

/** Website-side OAuth config (warning/timeout appeal form). Discord token lives on the applications bot. */
export type DiscordAppealConfig = {
  clientId: string;
  clientSecret: string;
  publicKey: string;
  guildId: string;
};

export function getDiscordPublicKey(): string | null {
  return process.env.DISCORD_PUBLIC_KEY?.trim() || null;
}

export function getDiscordAppealConfig(): DiscordAppealConfig | null {
  const clientId = process.env.DISCORD_CLIENT_ID?.trim();
  const clientSecret = process.env.DISCORD_CLIENT_SECRET?.trim();
  const publicKey = process.env.DISCORD_PUBLIC_KEY?.trim();
  const guildId = process.env.DISCORD_GUILD_ID?.trim();

  if (!clientId || !clientSecret || !publicKey || !guildId) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    publicKey,
    guildId,
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
