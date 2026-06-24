import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import {
  buildPaginatedResponse,
  parsePaginationParams,
} from "@/lib/pagination";
import StaffMember from "@/models/staffMember";
import { NextResponse } from "next/server";

/* ================= GET: LIST STAFF ================= */
export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin", "mod_dep_head"],
    rateLimit: { routeKey: "admin-team-list" },
  });
  if (auth instanceof Response) return auth;

  await connectDB();

  const { page, limit, skip } = parsePaginationParams(
    new URL(req.url).searchParams,
  );

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
}

/* ================= POST: ADD STAFF ================= */
export async function POST(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin", "mod_dep_head"],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

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
}
