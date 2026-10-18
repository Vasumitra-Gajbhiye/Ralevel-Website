import { enforceSameOrigin } from "@/lib/csrf";
import { getAuthSession } from "@/lib/getAuthSession";
import { DEV_ACT_AS_COOKIE, devImpersonationAllowed } from "@/lib/tasks/actor";
import { jsonError } from "@/lib/tasks/api";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";

/**
 * Local-only "view as" for checking /tasks permissions. 404 unless every guard
 * in devImpersonationAllowed holds (never in production).
 */
async function allowed(req: Request) {
  const session = await getAuthSession();
  if (!session) return null;
  if (!devImpersonationAllowed({ id: session.userData.id, roles: session.userData.roles })) return null;
  return enforceSameOrigin(req) ?? "ok";
}

export async function POST(req: Request) {
  const check = await allowed(req);
  if (!check) return jsonError("Not found", 404);
  if (check instanceof Response) return check;

  const { userId } = (await req.json().catch(() => ({}))) as { userId?: unknown };
  if (typeof userId !== "string" || !isValidObjectId(userId)) return jsonError("Pick a user");

  const res = NextResponse.json({ data: { userId } });
  res.cookies.set(DEV_ACT_AS_COOKIE, userId, { httpOnly: true, sameSite: "lax", path: "/" });
  return res;
}

export async function DELETE(req: Request) {
  const check = await allowed(req);
  if (!check) return jsonError("Not found", 404);
  if (check instanceof Response) return check;

  const res = NextResponse.json({ data: { userId: null } });
  res.cookies.delete(DEV_ACT_AS_COOKIE);
  return res;
}
