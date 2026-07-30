export function normalizeSiteUrl(url: string | undefined): string {
  const raw = url?.trim().replace(/\/$/, "") ?? "";
  if (!raw) return "https://ralevel.com";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `http://${raw}`;
}

export function buildAdminUrl(input: {
  formType: string;
  formSlug: string;
  submissionId: string;
}): string {
  const siteUrl = normalizeSiteUrl(
    process.env.NEXT_PUBLIC_URL ?? process.env.SITE_URL,
  );
  return `${siteUrl}/admin/forms/${input.formType}/${input.formSlug}/responses/${input.submissionId}`;
}

export function isDiscordNotificationsEnabled(): boolean {
  const flag = process.env.DISCORD_NOTIFICATIONS_ENABLED?.toLowerCase();
  return flag === "true" || flag === "1";
}

export function getApplicationsDiscordConfig():
  | { botToken: string; channelId: string }
  | null {
  if (!isDiscordNotificationsEnabled()) return null;

  const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
  const channelId = process.env.DISCORD_APPLICATIONS_CHANNEL_ID?.trim();

  if (!botToken || !channelId) {
    console.warn(
      "[bot] notifications enabled but DISCORD_BOT_TOKEN or DISCORD_APPLICATIONS_CHANNEL_ID is missing",
    );
    return null;
  }

  return { botToken, channelId };
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

export const DISCORD_APPEAL_INVITE_URL = "https://discord.gg/xEk5GsgfHC";

export type DiscordAppealBotConfig = {
  publicKey: string;
  botToken: string;
  guildId: string;
  banAppealChannelId: string;
  reviewerRoleIds: string[];
};

const ADDITIONAL_APPEAL_REVIEWER_ROLE_IDS = [
  "1516144911961948252",
  "1474372339000152250",
];

function parseReviewerRoleIds(): string[] {
  const explicit = process.env.DISCORD_APPEAL_REVIEWER_ROLE_IDS?.trim();
  const baseIds = explicit
    ? explicit
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
    : [
        process.env.DISCORD_JR_ADMIN_ROLE_ID,
        process.env.DISCORD_SR_ADMIN_ROLE_ID,
      ]
        .map((id) => id?.trim())
        .filter((id): id is string => Boolean(id));

  return [...new Set([...baseIds, ...ADDITIONAL_APPEAL_REVIEWER_ROLE_IDS])];
}

export function getDiscordPublicKey(): string | null {
  return process.env.DISCORD_PUBLIC_KEY?.trim() || null;
}

export function getDiscordAppealBotConfig(): DiscordAppealBotConfig | null {
  const publicKey = process.env.DISCORD_PUBLIC_KEY?.trim();
  const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
  const guildId = process.env.DISCORD_GUILD_ID?.trim();
  const banAppealChannelId = process.env.DISCORD_BAN_APPEAL_CHANNEL_ID?.trim();

  if (!publicKey || !botToken || !guildId || !banAppealChannelId) {
    return null;
  }

  return {
    publicKey,
    botToken,
    guildId,
    banAppealChannelId,
    reviewerRoleIds: parseReviewerRoleIds(),
  };
}
