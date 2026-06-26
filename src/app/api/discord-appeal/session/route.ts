import { getDiscordAppealSession } from "@/lib/discord-appeal/oauth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getDiscordAppealSession();

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    discordUserId: session.discordUserId,
    discordUsername: session.discordUsername,
    discordAvatar: session.discordAvatar,
  });
}
