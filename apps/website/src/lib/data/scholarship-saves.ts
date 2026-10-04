import connectDB from "@/lib/mongodb";
import { isOneOf, TRACKER_STATUSES, type TrackerStatus } from "@/lib/scholarships/constants";
import {
  SCHOLARSHIP_SUMMARY_FIELDS,
  serializeScholarshipSummary,
  type ScholarshipDoc,
} from "@/lib/scholarships/serialize";
import Scholarship from "@/models/scholarship";
import ScholarshipSave from "@/models/scholarshipSave";
import type { SavedScholarship, SaveState } from "@/types/scholarships";
import mongoose from "mongoose";

type SaveDoc = {
  scholarshipId: mongoose.Types.ObjectId | (ScholarshipDoc & { status?: string }) | null;
  status?: string;
  completedRequirementIds?: string[];
  updatedAt?: Date;
};

function toState(doc: SaveDoc): SaveState {
  return {
    status: isOneOf(TRACKER_STATUSES, doc.status) ? doc.status : "saved",
    completedRequirementIds: doc.completedRequirementIds ?? [],
  };
}

export async function getSaveState(
  userId: string,
  scholarshipId: string,
): Promise<SaveState | null> {
  await connectDB();
  const doc = await ScholarshipSave.findOne({ userId, scholarshipId })
    .select("status completedRequirementIds")
    .lean<SaveDoc | null>();
  return doc ? toState(doc) : null;
}

/** Map of scholarshipId → tracker status for the given ids. */
export async function getSavedStatuses(
  userId: string,
  scholarshipIds: string[],
): Promise<Record<string, TrackerStatus>> {
  if (scholarshipIds.length === 0) return {};
  await connectDB();
  const docs = await ScholarshipSave.find({
    userId,
    scholarshipId: { $in: scholarshipIds },
  })
    .select("scholarshipId status")
    .lean<SaveDoc[]>();
  return Object.fromEntries(docs.map((d) => [String(d.scholarshipId), toState(d).status]));
}

/** Saved scholarships that are still published (matches the tracker list). */
export async function countSaves(userId: string): Promise<number> {
  if (!mongoose.Types.ObjectId.isValid(userId)) return 0;
  await connectDB();
  const [result] = await ScholarshipSave.aggregate<{ n: number }>([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: Scholarship.collection.name,
        localField: "scholarshipId",
        foreignField: "_id",
        pipeline: [{ $match: { status: "published" } }, { $project: { _id: 1 } }],
        as: "scholarship",
      },
    },
    { $match: { "scholarship.0": { $exists: true } } },
    { $count: "n" },
  ]);
  return result?.n ?? 0;
}

export async function getSavedScholarships(userId: string): Promise<SavedScholarship[]> {
  await connectDB();
  const docs = await ScholarshipSave.find({ userId })
    .populate({
      path: "scholarshipId",
      select: `${SCHOLARSHIP_SUMMARY_FIELDS} status requirements`,
    })
    .sort({ updatedAt: -1 })
    .lean<SaveDoc[]>();

  return docs.flatMap((doc) => {
    const s = doc.scholarshipId;
    if (!s || s instanceof mongoose.Types.ObjectId || s.status !== "published") return [];
    return [
      {
        scholarship: {
          ...serializeScholarshipSummary(s),
          requirementIds: (s.requirements ?? []).map((r) => String(r._id)),
        },
        ...toState(doc),
        updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : "",
      },
    ];
  });
}

/* -------------------------------- Mutations -------------------------------- */

export async function addSave(userId: string, scholarshipId: string): Promise<SaveState | null> {
  await connectDB();
  const exists = await Scholarship.exists({ _id: scholarshipId, status: "published" });
  if (!exists) return null;

  const result = await ScholarshipSave.updateOne(
    { userId, scholarshipId },
    { $setOnInsert: { status: "saved", completedRequirementIds: [] } },
    { upsert: true },
  );
  if (result.upsertedCount > 0) {
    await Scholarship.updateOne({ _id: scholarshipId }, { $inc: { saveCount: 1 } });
  }
  return getSaveState(userId, scholarshipId);
}

export async function updateSave(
  userId: string,
  scholarshipId: string,
  patch: { status?: TrackerStatus; completedRequirementIds?: string[] },
): Promise<SaveState | null> {
  await connectDB();
  const doc = await ScholarshipSave.findOneAndUpdate(
    { userId, scholarshipId },
    { $set: patch },
    { new: true },
  )
    .select("status completedRequirementIds")
    .lean<SaveDoc | null>();
  return doc ? toState(doc) : null;
}

export async function removeSave(userId: string, scholarshipId: string): Promise<void> {
  await connectDB();
  const result = await ScholarshipSave.deleteOne({ userId, scholarshipId });
  if (result.deletedCount > 0) {
    await Scholarship.updateOne(
      { _id: scholarshipId, saveCount: { $gt: 0 } },
      { $inc: { saveCount: -1 } },
    );
  }
}
