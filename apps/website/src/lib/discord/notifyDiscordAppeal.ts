import {
  editAppealReviewMessage,
  postAppealReviewMessage,
  sendDirectMessage,
  type DiscordAppealNotification,
} from "@r-alevel/discord-bot";
import {
  DISCORD_APPEAL_INVITE_URL,
  getDiscordAppealConfig,
} from "@/lib/discord-appeal/config";

const APPEAL_TYPE_LABELS: Record<DiscordAppealNotification["appealType"], string> =
  {
    ban: "ban appeal",
    warning: "warnings appeal",
    timeout: "timeout/mute appeal",
  };

export async function postDiscordAppealReview(
  data: DiscordAppealNotification,
): Promise<string | null> {
  const config = getDiscordAppealConfig();
  if (!config) {
    console.warn("[discord-appeal] Discord appeal config is incomplete");
    return null;
  }

  return postAppealReviewMessage(
    config.botToken,
    config.banAppealChannelId,
    data,
  );
}

export async function updateDiscordAppealReviewMessage(
  channelId: string,
  messageId: string,
  data: DiscordAppealNotification,
): Promise<void> {
  const config = getDiscordAppealConfig();
  if (!config) return;

  await editAppealReviewMessage(
    config.botToken,
    channelId,
    messageId,
    data,
  );
}

export async function sendDiscordAppealAckDm(
  discordUserId: string,
): Promise<void> {
  const config = getDiscordAppealConfig();
  if (!config) return;

  await sendDirectMessage(
    config.botToken,
    discordUserId,
    "Your appeal has been received. You will be notified via Discord DM once it has been reviewed.",
  );
}

export async function sendDiscordAppealResultDm(
  discordUserId: string,
  appealType: DiscordAppealNotification["appealType"],
  action: "approve" | "reject",
): Promise<void> {
  const config = getDiscordAppealConfig();
  if (!config) return;

  const label = APPEAL_TYPE_LABELS[appealType];
  let content: string;
  if (action === "approve") {
    content = `Your ${label} for the r/alevel Discord server has been approved.`;
    if (appealType === "ban") {
      content += ` You can rejoin the server using this invite link: ${DISCORD_APPEAL_INVITE_URL}`;
    }
  } else {
    content = `Your ${label} for the r/alevel Discord server has been rejected.`;
  }

  await sendDirectMessage(config.botToken, discordUserId, content);
}
