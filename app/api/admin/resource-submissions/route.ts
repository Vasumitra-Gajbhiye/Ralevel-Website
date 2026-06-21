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

  const { page, limit, skip } = parsePaginationParams(new URL(req.url).searchParams);

  const mongoQuery: any = {};

  // 🎯 Status filter
  if (status && ["pending", "approved", "rejected"].includes(status)) {
    mongoQuery.status = status;
  }

  // 🔎 Search logic
  if (query) {
    const orConditions: any[] = [];

    // 🔎 If valid submission ID
    if (mongoose.Types.ObjectId.isValid(query)) {
      orConditions.push({ _id: query });
    }

    // 🔎 Search contributors
    const matchingContributors = await Contributor.find({
      $or: [
        { email: query },
        { discordOrRedditId: query },
        { fullName: { $regex: query, $options: "i" } },
      ],
    }).select("_id");

    if (matchingContributors.length > 0) {
      orConditions.push({
        contributorId: { $in: matchingContributors.map((c) => c._id) },
      });
    }

    if (orConditions.length > 0) {
      mongoQuery.$or = orConditions;
    }
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
    buildPaginatedResponse(submissions, total, page, limit)
  );
}
