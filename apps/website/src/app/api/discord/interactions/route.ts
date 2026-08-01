import { NextResponse } from "next/server";

/**
 * Proxies Discord Interactions to the applications bot.
 * Prefer pointing Discord Developer Portal Interactions Endpoint URL
 * directly at the bot (`https://<bot-host>/interactions`).
 * This route remains as a compatibility shim during cutover.
 */
export async function POST(req: Request) {
  const baseUrl = process.env.BOT_INTERNAL_URL?.trim().replace(/\/$/, "");
  if (!baseUrl) {
    return NextResponse.json(
      { error: "BOT_INTERNAL_URL is not configured" },
      { status: 503 },
    );
  }

  const body = await req.arrayBuffer();
  const headers = new Headers();
  const signature = req.headers.get("X-Signature-Ed25519");
  const timestamp = req.headers.get("X-Signature-Timestamp");
  if (signature) headers.set("X-Signature-Ed25519", signature);
  if (timestamp) headers.set("X-Signature-Timestamp", timestamp);
  headers.set(
    "Content-Type",
    req.headers.get("Content-Type") ?? "application/json",
  );

  try {
    const response = await fetch(`${baseUrl}/interactions`, {
      method: "POST",
      headers,
      body,
      // Discord requires a reply within ~3s; fail fast if bot is unreachable.
      signal: AbortSignal.timeout(2500),
    });

    const responseBody = await response.arrayBuffer();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `[discord/interactions] proxy to ${baseUrl}/interactions failed:`,
      message,
    );
    return NextResponse.json(
      {
        error: "Failed to reach applications bot",
        botInternalUrl: baseUrl,
        detail: message,
      },
      { status: 502 },
    );
  }
}
