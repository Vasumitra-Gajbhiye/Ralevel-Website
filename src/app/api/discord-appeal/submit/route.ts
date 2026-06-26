import {
  postDiscordAppealReview,
  sendDiscordAppealAckDm,
} from "@/lib/discord/notifyDiscordAppeal";
import { getDiscordAppealSession } from "@/lib/discord-appeal/oauth";
import { enforceRateLimit } from "@/lib/rateLimit";
import connectDB from "@/lib/mongodb";
import DiscordAppealBan from "@/models/DiscordAppealBan";
import DiscordAppealSubmission from "@/models/DiscordAppealSubmission";
import { NextResponse } from "next/server";

const MIN_RESPONSE_LENGTH = 100;
const MAX_RESPONSE_LENGTH = 1024;
const BAN_APPEAL_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

const APPEAL_TYPES = ["ban", "warning", "timeout"] as const;
type AppealType = (typeof APPEAL_TYPES)[number];

function isValidAppealType(value: unknown): value is AppealType {
  return typeof value === "string" && APPEAL_TYPES.includes(value as AppealType);
}

function validateResponse(value: unknown, label: string): string | null {
  if (typeof value !== "string") return `${label} is required`;
  const trimmed = value.trim();
  if (trimmed.length < MIN_RESPONSE_LENGTH) {
    return `${label} must be at least ${MIN_RESPONSE_LENGTH} characters`;
  }
  if (trimmed.length > MAX_RESPONSE_LENGTH) {
    return `${label} must be at most ${MAX_RESPONSE_LENGTH} characters`;
  }
  return null;
}

export async function POST(req: Request) {
  const session = await getDiscordAppealSession();
  if (!session) {
    return NextResponse.json(
      { error: "Discord authentication required" },
      { status: 401 },
    );
  }

  const rlError = await enforceRateLimit(req, "discord-appeal-submit", {
    limit: 5,
    windowSec: 5 * 60,
  });
  if (rlError) return rlError;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.website) {
    return NextResponse.json({ error: "Spam detected" }, { status: 400 });
  }

  const appealType = body.appealType;
  if (!isValidAppealType(appealType)) {
    return NextResponse.json({ error: "Invalid appeal type" }, { status: 400 });
  }

  const responses = body.responses as Record<string, unknown> | undefined;
  const q1Error = validateResponse(responses?.q1, "Question 1");
  const q2Error = validateResponse(responses?.q2, "Question 2");
  const q3Error = validateResponse(responses?.q3, "Question 3");
  const fieldError = q1Error || q2Error || q3Error;
  if (fieldError) {
    return NextResponse.json({ error: fieldError }, { status: 400 });
  }

  await connectDB();

  const banned = await DiscordAppealBan.findOne({
    discordUserId: session.discordUserId,
  }).lean();

  if (banned) {
    return NextResponse.json(
      { error: "You are banned from submitting appeals on this form." },
      { status: 403 },
    );
  }

  if (appealType === "ban") {
    const recentBanAppeal = await DiscordAppealSubmission.findOne({
      discordUserId: session.discordUserId,
      appealType: "ban",
      submittedAt: { $gte: new Date(Date.now() - BAN_APPEAL_COOLDOWN_MS) },
    }).lean();

    if (recentBanAppeal) {
      return NextResponse.json(
        {
          error:
            "You may only submit a ban appeal once per week. Please try again later.",
        },
        { status: 429 },
      );
    }
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    undefined;

  const submission = await DiscordAppealSubmission.create({
    discordUserId: session.discordUserId,
    discordUsername: session.discordUsername,
    discordAvatar: session.discordAvatar,
    appealType,
    responses: {
      q1: (responses!.q1 as string).trim(),
      q2: (responses!.q2 as string).trim(),
      q3: (responses!.q3 as string).trim(),
    },
    status: "pending",
    metadata: {
      ip,
      userAgent: req.headers.get("user-agent") ?? undefined,
    },
  });

  const submissionId = submission._id.toString();

  try {
    const messageId = await postDiscordAppealReview({
      submissionId,
      discordUserId: session.discordUserId,
      discordUsername: session.discordUsername,
      appealType,
      responses: submission.responses,
      status: "pending",
    });

    if (messageId) {
      submission.discordMessageId = messageId;
      await submission.save();
    }
  } catch (err) {
    console.error("[discord-appeal] Failed to post staff review message:", err);
  }

  try {
    await sendDiscordAppealAckDm(session.discordUserId);
  } catch (err) {
    console.error("[discord-appeal] Failed to send acknowledgment DM:", err);
  }

  return NextResponse.json({ success: true, submissionId });
}
