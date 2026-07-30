import { NextResponse } from "next/server";

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/**
 * Compatibility shim: forwards form-reminder cron to the applications bot.
 * Prefer scheduling Coolify cron against the bot `/cron/form-reminders` URL.
 */
export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = process.env.BOT_INTERNAL_URL?.trim().replace(/\/$/, "");
  if (!baseUrl) {
    return NextResponse.json(
      { error: "BOT_INTERNAL_URL is not configured" },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(`${baseUrl}/cron/form-reminders`, {
      method: "GET",
      headers: {
        Authorization: req.headers.get("authorization") ?? "",
      },
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    console.error("[cron/form-reminders] proxy failed", err);
    return NextResponse.json(
      { error: "Failed to reach applications bot" },
      { status: 502 },
    );
  }
}
