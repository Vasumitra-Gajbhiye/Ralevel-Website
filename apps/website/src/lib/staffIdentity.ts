import { isValidDiscordUserId } from "@/lib/discord/validatePingUserIds";

const NICKNAME_RE = /^[a-z0-9][a-z0-9-]{0,30}[a-z0-9]$|^[a-z0-9]$/;

export function normalizeNickname(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidNickname(nickname: string): boolean {
  const normalized = normalizeNickname(nickname);
  return normalized.length >= 2 && normalized.length <= 32 && NICKNAME_RE.test(normalized);
}

export function validateStaffIdentity(input: {
  nickname?: unknown;
  discordUserId?: unknown;
}): { nickname?: string; discordUserId?: string } {
  const result: { nickname?: string; discordUserId?: string } = {};

  if (input.nickname !== undefined) {
    if (typeof input.nickname !== "string") {
      throw new Error("Nickname must be a string");
    }
    const nickname = normalizeNickname(input.nickname);
    if (!nickname) {
      throw new Error("Nickname cannot be empty");
    }
    if (!isValidNickname(nickname)) {
      throw new Error(
        "Nickname must be 2–32 characters (lowercase letters, numbers, hyphens)",
      );
    }
    result.nickname = nickname;
  }

  if (input.discordUserId !== undefined) {
    if (typeof input.discordUserId !== "string") {
      throw new Error("Discord user ID must be a string");
    }
    const discordUserId = input.discordUserId.trim();
    if (!discordUserId) {
      throw new Error("Discord user ID cannot be empty");
    }
    if (!isValidDiscordUserId(discordUserId)) {
      throw new Error("Invalid Discord user ID");
    }
    result.discordUserId = discordUserId;
  }

  return result;
}
