import connectDB from "@/lib/mongodb";
import { validateStaffIdentity } from "@/lib/staffIdentity";
import UserData from "@/models/userData";

export async function assertNicknameAvailable(
  nickname: string,
  excludeEmail?: string,
): Promise<void> {
  const query: Record<string, unknown> = { nickname };
  if (excludeEmail) {
    query.email = { $ne: excludeEmail };
  }

  const existing = await UserData.findOne(query).select("_id");
  if (existing) {
    throw new Error(`Nickname "${nickname}" is already taken`);
  }
}

export async function applyStaffIdentity(
  target: {
    nickname?: string;
    discordUserId?: string;
  },
  input: { nickname?: unknown; discordUserId?: unknown },
  excludeEmail?: string,
): Promise<boolean> {
  const validated = validateStaffIdentity(input);
  let changed = false;

  if (validated.nickname !== undefined) {
    await assertNicknameAvailable(validated.nickname, excludeEmail);
    target.nickname = validated.nickname;
    changed = true;
  }

  if (validated.discordUserId !== undefined) {
    target.discordUserId = validated.discordUserId;
    changed = true;
  }

  return changed;
}
