import { processFormReminders } from "@/lib/forms/processFormReminders";
import { NextResponse } from "next/server";

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processFormReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron/form-reminders]", err);
    return NextResponse.json(
      { error: "Failed to process form reminders" },
      { status: 500 },
    );
  }
}
