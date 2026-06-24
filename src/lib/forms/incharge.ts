import "server-only";

import connectDB from "@/lib/mongodb";
import { isAdmin } from "@/lib/roles";
import type { Role } from "@/lib/roles";
import UserData from "@/models/userData";
import {
  allInchargeHaveVoted,
  getUnvotedIncharge,
  MAX_INCHARGE_NICKNAMES,
  type FormInchargeConfig,
  type InchargeMember,
  type VoteRecord,
} from "./incharge.shared";

export {
  allInchargeHaveVoted,
  getUnvotedIncharge,
  MAX_INCHARGE_NICKNAMES,
  type FormInchargeConfig,
  type InchargeMember,
  type VoteRecord,
};

export async function resolveInchargeMembers(
  nicknames: string[] | undefined,
): Promise<InchargeMember[]> {
  if (!nicknames?.length) return [];

  await connectDB();

  const uniqueNicknames = [...new Set(nicknames.map((n) => n.trim().toLowerCase()))];
  const users = await UserData.find({
    nickname: { $in: uniqueNicknames },
    discordUserId: { $exists: true, $nin: [null, ""] },
  })
    .select("nickname email discordUserId")
    .lean();

  const byNickname = new Map(
    users.map((user) => [
      user.nickname as string,
      {
        nickname: user.nickname as string,
        email: user.email as string,
        discordUserId: user.discordUserId as string,
      },
    ]),
  );

  return uniqueNicknames
    .map((nickname) => byNickname.get(nickname))
    .filter((member): member is InchargeMember => Boolean(member));
}

export async function canVoteOnForm(input: {
  roles?: Role[];
  email?: string | null;
  form: FormInchargeConfig;
}): Promise<boolean> {
  if (isAdmin(input.roles)) return true;
  if (!input.email) return false;

  const members = await resolveInchargeMembers(input.form.inchargeNicknames);
  const email = input.email.toLowerCase();
  return members.some((member) => member.email.toLowerCase() === email);
}

export async function normalizeInchargeNicknames(
  nicknames: unknown,
): Promise<string[]> {
  if (!Array.isArray(nicknames)) {
    throw new Error("nicknames must be an array");
  }

  const normalized: string[] = [];
  for (const raw of nicknames) {
    if (typeof raw !== "string") {
      throw new Error("Each nickname must be a string");
    }
    const nickname = raw.trim().toLowerCase();
    if (!nickname) continue;
    if (!normalized.includes(nickname)) {
      normalized.push(nickname);
    }
  }

  if (normalized.length > MAX_INCHARGE_NICKNAMES) {
    throw new Error(`At most ${MAX_INCHARGE_NICKNAMES} incharge members are allowed`);
  }

  await connectDB();

  for (const nickname of normalized) {
    const user = await UserData.findOne({
      nickname,
      discordUserId: { $exists: true, $nin: [null, ""] },
    }).select("_id");

    if (!user) {
      throw new Error(
        `No staff member found with nickname "${nickname}" and a Discord user ID`,
      );
    }
  }

  return normalized;
}
