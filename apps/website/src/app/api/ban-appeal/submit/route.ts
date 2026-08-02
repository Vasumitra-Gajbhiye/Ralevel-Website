import { banAppealConfirmationEmail } from "@/lib/emails/banAppealEmail";
import { postDiscordAppealReview } from "@/lib/discord/notifyDiscordAppeal";
import { getDiscordAppealSession } from "@/lib/discord-appeal/oauth";
import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import { enforceRateLimit } from "@/lib/rateLimit";
import DiscordAppealSubmission from "@/models/DiscordAppealSubmission";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const MIN_RESPONSE_LENGTH = 100;
const MAX_RESPONSE_LENGTH = 1024;
const BAN_APPEAL_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

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
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json(
      { error: "Google or email authentication required" },
      { status: 401 },
    );
  }

  const discordSession = await getDiscordAppealSession();
  if (!discordSession) {
    return NextResponse.json(
      { error: "Discord authentication required" },
      { status: 401 },
    );
  }

  const rlError = await enforceRateLimit(req, "ban-appeal-submit", {
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

  const responses = body.responses as Record<string, unknown> | undefined;
  const q1Error = validateResponse(responses?.q1, "Question 1");
  const q2Error = validateResponse(responses?.q2, "Question 2");
  const q3Error = validateResponse(responses?.q3, "Question 3");
  const fieldError = q1Error || q2Error || q3Error;
  if (fieldError) {
    return NextResponse.json({ error: fieldError }, { status: 400 });
  }

  await connectDB();

  const cooldownSince = new Date(Date.now() - BAN_APPEAL_COOLDOWN_MS);
  const recentBanAppeal = await DiscordAppealSubmission.findOne({
    appealType: "ban",
    submittedAt: { $gte: cooldownSince },
    $or: [
      { clerkUserId: session.userId },
      { discordUserId: discordSession.discordUserId },
    ],
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

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    undefined;

  const submitterName = session.user.name?.trim() || undefined;
  const submitterEmail = session.user.email;

  const submission = await DiscordAppealSubmission.create({
    submitterEmail,
    clerkUserId: session.userId,
    submitterName,
    discordUserId: discordSession.discordUserId,
    discordUsername: discordSession.discordUsername,
    discordAvatar: discordSession.discordAvatar,
    appealType: "ban",
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
      appealType: "ban",
      submitterEmail,
      submitterName,
      discordUserId: discordSession.discordUserId,
      discordUsername: discordSession.discordUsername,
      responses: submission.responses,
      status: "pending",
      sendAckDm: false,
    });

    if (messageId) {
      submission.discordMessageId = messageId;
      await submission.save();
    }
  } catch (err) {
    console.error("[ban-appeal] Failed to notify applications bot:", err);
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "r/alevel <application@ralevel.com>",
        to: submitterEmail,
        subject: "We received your ban appeal",
        html: banAppealConfirmationEmail({ name: submitterName }),
      });
    } catch (err) {
      console.error("[ban-appeal] Failed to send confirmation email:", err);
    }
  }

  return NextResponse.json({ success: true, submissionId });
}
