import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { applyStaffIdentity } from "@/lib/admin/staffIdentity";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import { invalidateUserCache } from "@/lib/redis-cache";
import UserData from "@/models/userData";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin"],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const { email, nickname, discordUserId } = (await req.json()) as {
    email?: string;
    nickname?: unknown;
    discordUserId?: unknown;
  };

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (nickname === undefined && discordUserId === undefined) {
    return NextResponse.json(
      { error: "Provide nickname and/or discordUserId" },
      { status: 400 },
    );
  }

  const target = await UserData.findOne({ email });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (target.roles?.includes("owner") && email !== auth.user?.email) {
    return NextResponse.json(
      { error: "Owner identity cannot be modified by others" },
      { status: 403 },
    );
  }

  try {
    const changed = await applyStaffIdentity(
      target,
      { nickname, discordUserId },
      email,
    );
    if (changed) {
      await target.save();
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Invalid staff identity";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  await invalidateUserCache(email);

  return NextResponse.json({
    success: true,
    nickname: target.nickname,
    discordUserId: target.discordUserId,
  });
}
