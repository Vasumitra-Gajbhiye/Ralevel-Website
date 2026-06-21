import { getAuthSession } from "@/lib/getAuthSession";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import {
  buildPaginatedResponse,
  parsePaginationParams,
} from "@/lib/pagination";
import { requireRoles } from "@/lib/requireRoles";
import StaffMember from "@/models/staffMember";
import { NextResponse } from "next/server";

const RANK_ORDER: Record<string, number> = {
  community_lead: 1,
  admin: 2,
  senior_mod: 3,
  junior_mod: 4,
  trial_mod: 5,
  former_staff: 6,
};

/* ================= GET: LIST STAFF ================= */
export async function GET(req: Request) {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireRoles(session, ["owner", "admin", "mod_dep_head"]);

    const { page, limit, skip } = parsePaginationParams(new URL(req.url).searchParams);

    const [result] = await StaffMember.aggregate([
      {
        $addFields: {
          rankOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$rank", "community_lead"] }, then: 1 },
                { case: { $eq: ["$rank", "admin"] }, then: 2 },
                { case: { $eq: ["$rank", "senior_mod"] }, then: 3 },
                { case: { $eq: ["$rank", "junior_mod"] }, then: 4 },
                { case: { $eq: ["$rank", "trial_mod"] }, then: 5 },
                { case: { $eq: ["$rank", "former_staff"] }, then: 6 },
              ],
              default: 99,
            },
          },
        },
      },
      {
        $sort: {
          rankOrder: 1,
          createdAt: 1,
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                rankOrder: 0,
              },
            },
          ],
        },
      },
    ]);

    const total = result.metadata[0]?.total ?? 0;
    const staff = result.data;

    return NextResponse.json(buildPaginatedResponse(staff, total, page, limit));
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}

/* ================= POST: ADD STAFF ================= */
export async function POST(req: Request) {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireRoles(session, ["owner", "admin", "mod_dep_head"]);

    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;

    const staff = await StaffMember.create({
      username: "",
      email: "",
      realName: "",
      userId: "",

      rank: "trial_mod",
      activity: "not_required",
      behaviour: "no_record",
      state: "active",

      positionStart: null,
      lastPromotion: null,
      notes: "",
    });

    return NextResponse.json(staff, { status: 201 });
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}
