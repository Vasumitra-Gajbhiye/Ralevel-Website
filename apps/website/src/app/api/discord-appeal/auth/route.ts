import { NextResponse } from "next/server";
import {
  buildDiscordOAuthUrl,
  createOAuthState,
  encodeOAuthState,
  normalizeDiscordOAuthReturnTo,
} from "@/lib/discord-appeal/oauth";
import { getDiscordAppealConfig } from "@/lib/discord-appeal/config";
import { cookies } from "next/headers";

const OAUTH_STATE_COOKIE = "discord_appeal_oauth_state";

export async function GET(req: Request) {
  const config = getDiscordAppealConfig();
  if (!config) {
    return NextResponse.json(
      { error: "Discord appeal OAuth is not configured" },
      { status: 503 },
    );
  }

  const url = new URL(req.url);
  const returnTo = normalizeDiscordOAuthReturnTo(
    url.searchParams.get("returnTo"),
  );

  const state = createOAuthState();
  const signedState = encodeOAuthState(state, returnTo);
  const cookieStore = await cookies();

  cookieStore.set(OAUTH_STATE_COOKIE, signedState, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  const oauthUrl = buildDiscordOAuthUrl(state);
  return NextResponse.redirect(oauthUrl);
}
