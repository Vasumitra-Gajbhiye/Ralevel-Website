import { NextResponse } from "next/server";

/**
 * Enforces that the request comes from the same origin as the app.
 * Returns a NextResponse if forbidden; otherwise returns null.
 */
export function enforceSameOrigin(req: { headers: Headers }) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");

  // If either header is missing, treat as forbidden for admin/state-changing APIs.
  if (!origin || !host) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const originUrl = new URL(origin);

    // Require exact host (hostname + port) match
    if (originUrl.host !== host) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return null;
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

