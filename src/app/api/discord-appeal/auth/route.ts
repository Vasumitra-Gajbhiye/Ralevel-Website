import { NextResponse } from "next/server";
import {
  buildDiscordOAuthUrl,
  createOAuthState,
  encodeOAuthState,
} from "@/lib/discord-appeal/oauth";
import { getDiscordAppealConfig } from "@/lib/discord-appeal/config";
import { cookies } from "next/headers";

const OAUTH_STATE_COOKIE = "discord_appeal_oauth_state";

export async function GET() {
  const config = getDiscordAppealConfig();
  if (!config) {
    return NextResponse.json(
      { error: "Discord appeal OAuth is not configured" },
      { status: 503 },
    );
  }

  const state = createOAuthState();
  const signedState = encodeOAuthState(state);
  const cookieStore = await cookies();

  cookieStore.set(OAUTH_STATE_COOKIE, signedState, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  const url = buildDiscordOAuthUrl(state);
  return NextResponse.redirect(url);
}
