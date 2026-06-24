const DISCORD_SNOWFLAKE_RE = /^\d{17,20}$/;
export const MAX_DISCORD_PING_USER_IDS = 10;

export function isValidDiscordUserId(id: string): boolean {
  return DISCORD_SNOWFLAKE_RE.test(id.trim());
}

export function normalizeDiscordPingUserIds(userIds: unknown): string[] {
  if (!Array.isArray(userIds)) {
    throw new Error("userIds must be an array");
  }

  const normalized: string[] = [];
  for (const raw of userIds) {
    if (typeof raw !== "string") {
      throw new Error("Each user ID must be a string");
    }
    const id = raw.trim();
    if (!id) continue;
    if (!isValidDiscordUserId(id)) {
      throw new Error(`Invalid Discord user ID: ${id}`);
    }
    if (!normalized.includes(id)) {
      normalized.push(id);
    }
  }

  if (normalized.length > MAX_DISCORD_PING_USER_IDS) {
    throw new Error(
      `At most ${MAX_DISCORD_PING_USER_IDS} Discord user IDs are allowed`,
    );
  }

  return normalized;
}
