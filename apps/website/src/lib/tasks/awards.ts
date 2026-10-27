/** Star ledger reads and writes for /tasks. Server-only. */
import connectDB from "@/lib/mongodb";
import TaskStarAward from "@/models/taskStarAward";
import TaskStarCertificate from "@/models/taskStarCertificate";
import { Types } from "mongoose";
import { certificatesDue } from "./stars";

export type StarStanding = { stars: number; issued: number; due: number };

type Totals = { _id: Types.ObjectId | string; total: number };

const toObjectId = (id: string) => new Types.ObjectId(id);

/** Stars and certificates per person, for one department (or one person across departments). */
async function standings(match: Record<string, unknown>, groupBy: "$userId" | "$departmentKey") {
  await connectDB();
  const [awards, certs] = await Promise.all([
    TaskStarAward.aggregate<Totals>([{ $match: match }, { $group: { _id: groupBy, total: { $sum: "$stars" } } }]),
    TaskStarCertificate.aggregate<Totals>([{ $match: match }, { $group: { _id: groupBy, total: { $sum: 1 } } }]),
  ]);
  const issuedBy = new Map(certs.map((c) => [String(c._id), c.total]));
  const out = new Map<string, StarStanding>();
  for (const a of awards) {
    const issued = issuedBy.get(String(a._id)) ?? 0;
    out.set(String(a._id), { stars: a.total, issued, due: certificatesDue(a.total, issued) });
  }
  return out;
}

/** userId → standing, for everyone with stars in the department. */
export function departmentStandings(departmentKey: string): Promise<Map<string, StarStanding>> {
  return standings({ departmentKey }, "$userId");
}

/** departmentKey → standing, for each department where the person has stars. */
export function personStandings(userId: string): Promise<Map<string, StarStanding>> {
  return standings({ userId: toObjectId(userId) }, "$departmentKey");
}

export async function starTotal(userId: string, departmentKey: string): Promise<number> {
  await connectDB();
  const [row] = await TaskStarAward.aggregate<Totals>([
    { $match: { userId: toObjectId(userId), departmentKey } },
    { $group: { _id: null, total: { $sum: "$stars" } } },
  ]);
  return row?.total ?? 0;
}

/**
 * Records the stars for an approved task. Returns the person's total before
 * and after, or null when the task had already paid out.
 */
export async function awardStars(input: {
  taskId: Types.ObjectId;
  taskTitle: string;
  departmentKey: string;
  userId: string;
  stars: number;
  awardedBy: string;
}): Promise<{ before: number; after: number } | null> {
  const before = await starTotal(input.userId, input.departmentKey);
  const result = await TaskStarAward.updateOne(
    { taskId: input.taskId },
    {
      $setOnInsert: {
        userId: input.userId,
        departmentKey: input.departmentKey,
        taskTitle: input.taskTitle,
        stars: input.stars,
        awardedBy: input.awardedBy,
      },
    },
    { upsert: true },
  );
  if (!result.upsertedCount) return null;
  return { before, after: before + input.stars };
}

/** Takes back a task's stars (it was un-completed). Returns how many. */
export async function revokeStars(taskId: Types.ObjectId): Promise<number> {
  const award = await TaskStarAward.findOneAndDelete({ taskId }).lean<{ stars: number }>();
  return award?.stars ?? 0;
}
