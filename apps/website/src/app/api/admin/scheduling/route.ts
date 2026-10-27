import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import { getAdminSchedulingList } from "@/lib/data/admin/scheduling";
import connectDB from "@/lib/mongodb";
import { parsePaginationParams } from "@/lib/pagination";
import {
  scheduleItemDeleteSchema,
  scheduleItemPatchSchema,
} from "@/lib/validation/scheduling";
import { firstIssue } from "@/lib/validation/scholarships";
import ScheduleItem from "@/models/scheduleItem";
import { NextResponse } from "next/server";

/* ================= GET ================= */
export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    section: "scheduling",
    rateLimit: { routeKey: "admin-scheduling-list" },
  });
  if (auth instanceof Response) return auth;

  const { page, limit, skip } = parsePaginationParams(
    new URL(req.url).searchParams,
  );

  const result = await getAdminSchedulingList({ page, limit, skip });

  return NextResponse.json(result);
}

/* ================= POST ================= */
export async function POST(req: Request) {
  const auth = await authorizeAdminApi(req, {
    section: "scheduling",
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const created = await ScheduleItem.create({});
  return NextResponse.json(created);
}

/* ================= PATCH ================= */
export async function PATCH(req: Request) {
  const auth = await authorizeAdminApi(req, {
    section: "scheduling",
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  const parsed = scheduleItemPatchSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: firstIssue(parsed.error) },
      { status: 400 },
    );
  }

  await connectDB();

  const { id, patch } = parsed.data;
  await ScheduleItem.findByIdAndUpdate(id, { $set: patch });

  return NextResponse.json({ success: true });
}

/* ================= DELETE ================= */
export async function DELETE(req: Request) {
  const auth = await authorizeAdminApi(req, {
    section: "scheduling",
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  const parsed = scheduleItemDeleteSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: firstIssue(parsed.error) },
      { status: 400 },
    );
  }

  await connectDB();

  await ScheduleItem.findByIdAndDelete(parsed.data.id);

  return NextResponse.json({ success: true });
}
