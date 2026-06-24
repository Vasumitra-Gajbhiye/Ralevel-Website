import { authorizeAdminApi } from "@/lib/adminApiAuth";
import connectDB from "@/lib/mongodb";
import UserData from "@/models/userData";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [
      "owner",
      "admin",
      "mod_dep_head",
      "helper_dep_head",
      "graphic_dep_head",
      "info_dep_head",
    ],
  });
  if (auth instanceof Response) return auth;

  const q = new URL(req.url).searchParams.get("q")?.trim().toLowerCase() ?? "";

  await connectDB();

  const filter: Record<string, unknown> = {
    roles: { $exists: true, $not: { $size: 0 } },
    nickname: { $exists: true, $nin: [null, ""] },
    discordUserId: { $exists: true, $nin: [null, ""] },
  };

  if (q) {
    filter.nickname = { $regex: `^${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}` };
  }

  const users = await UserData.find(filter)
    .select("nickname email discordUserId name")
    .sort({ nickname: 1 })
    .limit(q ? 10 : 50)
    .lean();

  return NextResponse.json(
    users.map((user) => ({
      nickname: user.nickname,
      email: user.email,
      discordUserId: user.discordUserId,
      name: user.name,
    })),
  );
}
