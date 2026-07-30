import connectDB from "@/lib/mongodb";
import DiscordAppealBan from "@/models/DiscordAppealBan";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  decodeOAuthState,
  exchangeCodeForUser,
  setDiscordAppealSession,
} from "@/lib/discord-appeal/oauth";
import {
  buildDiscordAppealFormUrl,
  getDiscordAppealConfig,
} from "@/lib/discord-appeal/config";

const OAUTH_STATE_COOKIE = "discord_appeal_oauth_state";

export async function GET(req: Request) {
  const config = getDiscordAppealConfig();
  if (!config) {
    return NextResponse.redirect(
      buildDiscordAppealFormUrl("/discord-appeal-form?error=oauth_not_configured"),
    );
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      buildDiscordAppealFormUrl("/discord-appeal-form?error=oauth_denied"),
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      buildDiscordAppealFormUrl("/discord-appeal-form?error=oauth_invalid"),
    );
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(OAUTH_STATE_COOKIE);

  const expectedState = storedState ? decodeOAuthState(storedState) : null;
  if (!expectedState || expectedState !== state) {
    return NextResponse.redirect(
      buildDiscordAppealFormUrl("/discord-appeal-form?error=oauth_state"),
    );
  }

  try {
    const user = await exchangeCodeForUser(code);

    await connectDB();
    const banned = await DiscordAppealBan.findOne({
      discordUserId: user.id,
    }).lean();

    if (banned) {
      return NextResponse.redirect(
        buildDiscordAppealFormUrl("/discord-appeal-form?error=form_banned"),
      );
    }

    await setDiscordAppealSession({
      discordUserId: user.id,
      discordUsername: user.username,
      discordAvatar: user.avatar ?? undefined,
    });

    return NextResponse.redirect(buildDiscordAppealFormUrl());
  } catch (err) {
    console.error("[discord-appeal] OAuth callback failed:", err);
    return NextResponse.redirect(
      buildDiscordAppealFormUrl("/discord-appeal-form?error=oauth_failed"),
    );
  }
}
