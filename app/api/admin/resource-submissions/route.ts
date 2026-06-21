import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import {
  buildPaginatedResponse,
  parsePaginationParams,
} from "@/lib/pagination";
import { requireRoles } from "@/lib/requireRoles";
import Contributor from "@/models/Contributor";
import ResourceSubmission from "@/models/ResourceSubmission";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

/* ================= GET ================= */

export async function GET(req: Request) {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireRoles(session, ["owner", "admin"]);

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
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}
