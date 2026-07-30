import connectDB from "../db.js";
import UserData from "../models/UserData.js";
import type { InchargeMember } from "./incharge.js";

export async function resolveInchargeMembers(
  nicknames: string[] | undefined,
): Promise<InchargeMember[]> {
  if (!nicknames?.length) return [];

  await connectDB();

  const uniqueNicknames = [
    ...new Set(nicknames.map((n) => n.trim().toLowerCase())),
  ];
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
