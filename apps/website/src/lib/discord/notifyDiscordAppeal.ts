import { notifyBotAppealSubmitted } from "@/lib/discord/botClient";

export type DiscordAppealNotification = {
  submissionId: string;
  discordUserId: string;
  discordUsername: string;
  appealType: "ban" | "warning" | "timeout";
  responses: { q1: string; q2: string; q3: string };
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
};

/**
 * Asks the applications bot to post the staff review message and send the ack DM.
 * Returns the Discord message ID when available.
 */
export async function postDiscordAppealReview(
  data: DiscordAppealNotification,
): Promise<string | null> {
  const result = await notifyBotAppealSubmitted({
    ...data,
    sendAckDm: true,
  });
  return result?.messageId ?? null;
}
