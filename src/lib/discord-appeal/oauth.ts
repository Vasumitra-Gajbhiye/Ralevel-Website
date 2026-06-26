import crypto from "crypto";
import { cookies } from "next/headers";
import {
  getDiscordAppealConfig,
  getDiscordAppealRedirectUri,
  getDiscordAppealSiteUrl,
} from "./config";

export const DISCORD_APPEAL_SESSION_COOKIE = "discord_appeal_session";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export type DiscordAppealSession = {
  discordUserId: string;
  discordUsername: string;
  discordAvatar?: string;
  exp: number;
};

function getSessionSecret(): string {
  const secret = process.env.DISCORD_CLIENT_SECRET?.trim();
  if (!secret) {
    throw new Error("DISCORD_CLIENT_SECRET is not configured");
  }
  return secret;
}

function signPayload(payload: string): string {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

export function encodeSession(session: DiscordAppealSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function decodeSession(token: string): DiscordAppealSession | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = signPayload(payload);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (
    sigBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expectedBuf)
  ) {
    return null;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as DiscordAppealSession;

    if (!session.discordUserId || !session.discordUsername || !session.exp) {
      return null;
    }

    if (Date.now() > session.exp) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function getDiscordAppealSession(): Promise<DiscordAppealSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(DISCORD_APPEAL_SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export async function setDiscordAppealSession(
  session: Omit<DiscordAppealSession, "exp">,
): Promise<void> {
  const cookieStore = await cookies();
  const token = encodeSession({
    ...session,
    exp: Date.now() + SESSION_TTL_MS,
  });

  cookieStore.set(DISCORD_APPEAL_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearDiscordAppealSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(DISCORD_APPEAL_SESSION_COOKIE);
}

export function buildDiscordOAuthUrl(state: string): string {
  const config = getDiscordAppealConfig();
  if (!config) {
    throw new Error("Discord appeal OAuth is not configured");
  }

  const redirectUri = getDiscordAppealRedirectUri(getDiscordAppealSiteUrl());

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify",
    state,
    prompt: "consent",
  });

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

export type DiscordOAuthUser = {
  id: string;
  username: string;
  avatar: string | null;
};

export async function exchangeCodeForUser(
  code: string,
): Promise<DiscordOAuthUser> {
  const config = getDiscordAppealConfig();
  if (!config) {
    throw new Error("Discord appeal OAuth is not configured");
  }

  const redirectUri = getDiscordAppealRedirectUri(getDiscordAppealSiteUrl());

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    throw new Error(`Discord token exchange failed: ${body}`);
  }

  const tokenData = (await tokenRes.json()) as { access_token: string };

  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userRes.ok) {
    const body = await userRes.text();
    throw new Error(`Discord user fetch failed: ${body}`);
  }

  const user = (await userRes.json()) as DiscordOAuthUser;
  return user;
}

export function createOAuthState(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function encodeOAuthState(state: string): string {
  const exp = Date.now() + 10 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ state, exp })).toString(
    "base64url",
  );
  return `${payload}.${signPayload(payload)}`;
}

export function decodeOAuthState(token: string): string | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = signPayload(payload);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (
    sigBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expectedBuf)
  ) {
    return null;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { state: string; exp: number };

    if (!data.state || Date.now() > data.exp) return null;
    return data.state;
  } catch {
    return null;
  }
}
