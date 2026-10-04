import {
  authorizeScholarshipAdmin,
  jsonError,
  revalidateScholarshipSurfaces,
} from "@/lib/scholarships/adminApi";
import { isOneOf } from "@/lib/scholarships/constants";
import { applyScholarshipAction } from "@/lib/scholarships/mutations";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const BULK_ACTIONS = ["publish", "unpublish", "archive"] as const;
const MAX_BULK = 100;

export async function POST(req: Request) {
  const auth = await authorizeScholarshipAdmin(req, { write: true });
  if (auth instanceof Response) return auth;

  const body = (await req.json()) as { ids?: unknown; action?: unknown };
  if (!isOneOf(BULK_ACTIONS, body.action)) return jsonError("Unknown action");

  const ids = Array.isArray(body.ids)
    ? body.ids.filter(
        (id): id is string => typeof id === "string" && mongoose.Types.ObjectId.isValid(id),
      )
    : [];
  if (ids.length === 0 || ids.length > MAX_BULK) return jsonError("Select 1–100 items");

  let done = 0;
  const skipped: string[] = [];
  for (const id of ids) {
    const result = await applyScholarshipAction(id, body.action, auth);
    if (result.ok) done++;
    else skipped.push(result.error);
  }

  revalidateScholarshipSurfaces();
  return NextResponse.json({ done, skipped });
}
