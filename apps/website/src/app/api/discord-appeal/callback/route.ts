import connectDB from "@/lib/mongodb";
import DiscordAppealBan from "@/models/DiscordAppealBan";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  decodeOAuthStatePayload,
  exchangeCodeForUser,
  normalizeDiscordOAuthReturnTo,
  setDiscordAppealSession,
  type DiscordOAuthReturnPath,
} from "@/lib/discord-appeal/oauth";
import {
  buildDiscordAppealFormUrl,
  getDiscordAppealConfig,
} from "@/lib/discord-appeal/config";

const OAUTH_STATE_COOKIE = "discord_appeal_oauth_state";

function redirectWithError(
  returnTo: DiscordOAuthReturnPath,
  error: string,
) {
  return NextResponse.redirect(
    buildDiscordAppealFormUrl(`${returnTo}?error=${error}`),
  );
}

export async function GET(req: Request) {
  let returnTo = normalizeDiscordOAuthReturnTo(null);

  const config = getDiscordAppealConfig();
  if (!config) {
    return redirectWithError(returnTo, "oauth_not_configured");
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const cookieStore = await cookies();
  const storedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(OAUTH_STATE_COOKIE);

  const decoded = storedState ? decodeOAuthStatePayload(storedState) : null;
  if (decoded) {
    returnTo = decoded.returnTo;
  }

  if (error) {
    return redirectWithError(returnTo, "oauth_denied");
  }

  if (!code || !state) {
    return redirectWithError(returnTo, "oauth_invalid");
  }

  if (!decoded || decoded.state !== state) {
    return redirectWithError(returnTo, "oauth_state");
  }

  try {
    const user = await exchangeCodeForUser(code);

    await connectDB();
    const banned = await DiscordAppealBan.findOne({
      discordUserId: user.id,
    }).lean();

    if (banned) {
      return redirectWithError(returnTo, "form_banned");
    }

    await setDiscordAppealSession({
      discordUserId: user.id,
      discordUsername: user.username,
      discordAvatar: user.avatar ?? undefined,
    });

    return NextResponse.redirect(buildDiscordAppealFormUrl(returnTo));
  } catch (err) {
    console.error("[discord-appeal] OAuth callback failed:", err);
    return redirectWithError(returnTo, "oauth_failed");
  }
}
