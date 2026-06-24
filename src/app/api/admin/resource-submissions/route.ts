import { authorizeAdminApi } from "@/lib/adminApiAuth";
import connectDB from "@/lib/mongodb";
import {
  buildPaginatedResponse,
  parsePaginationParams,
} from "@/lib/pagination";
import Contributor from "@/models/Contributor";
import ResourceSubmission from "@/models/ResourceSubmission";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ================= GET ================= */

export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin"],
    rateLimit: { routeKey: "admin-resource-submissions-list" },
  });
  if (auth instanceof Response) return auth;

  await connectDB();

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const status = searchParams.get("status");

  const { page, limit, skip } = parsePaginationParams(
    new URL(req.url).searchParams,
  );

  const statusFilter =
    status && ["pending", "approved", "rejected"].includes(status)
      ? status
      : null;

  if (query) {
    const searchOr: mongoose.FilterQuery<unknown>[] = [
      { "contributor.email": query },
      { "contributor.discordOrRedditId": query },
      {
        "contributor.fullName": {
          $regex: `^${escapeRegex(query)}`,
          $options: "i",
        },
      },
    ];

    if (mongoose.Types.ObjectId.isValid(query)) {
      searchOr.unshift({ _id: new mongoose.Types.ObjectId(query) });
    }

    const [result] = await ResourceSubmission.aggregate([
      ...(statusFilter ? [{ $match: { status: statusFilter } }] : []),
      {
        $lookup: {
          from: Contributor.collection.collectionName,
          localField: "contributorId",
          foreignField: "_id",
          as: "contributor",
        },
      },
      { $unwind: "$contributor" },
      { $match: { $or: searchOr } },
      { $addFields: { contributorId: "$contributor" } },
      { $project: { contributor: 0 } },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);

    const total = result.metadata[0]?.total ?? 0;
    const submissions = result.data;

    return NextResponse.json(
      buildPaginatedResponse(submissions, total, page, limit),
    );
  }

  const mongoQuery: mongoose.FilterQuery<typeof ResourceSubmission> = {};
  if (statusFilter) {
    mongoQuery.status = statusFilter;
  }

  const [submissions, total] = await Promise.all([
    ResourceSubmission.find(mongoQuery)
      .populate("contributorId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ResourceSubmission.countDocuments(mongoQuery),
  ]);

  return NextResponse.json(
    buildPaginatedResponse(submissions, total, page, limit),
  );
}
