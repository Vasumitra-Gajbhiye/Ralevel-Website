import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import { Role } from "@/lib/roles";
import Contributor from "@/models/Contributor";
import ResourceSubmission from "@/models/ResourceSubmission";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
/* ================= HELPERS ================= */

function requireResourceAdminAccess(session: any): Role[] {
  const roles = session?.userData?.roles as Role[] | undefined;

  if (!roles || !roles.some((r) => ["owner", "admin"].includes(r))) {
    throw new Error("FORBIDDEN");
  }

  return roles;
}

/* ================= GET ================= */

export async function GET(req: Request) {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireResourceAdminAccess(session);

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const status = searchParams.get("status");

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

    const submissions = await ResourceSubmission.find(mongoQuery)
      .populate("contributorId")
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json(submissions);
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}
