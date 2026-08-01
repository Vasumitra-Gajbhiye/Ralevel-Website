import {
  buildAppealActionRow,
  formatAppealEmbed,
  formatPendingAppealsListEmbed,
  type DiscordAppealNotification,
} from "@ralevel/discord";
import { verifyKey } from "discord-interactions";
import { getDiscordAppealBotConfig, getDiscordPublicKey } from "../config.js";
import {
  getAppealById,
  isDiscordAppealReviewer,
  listPendingAppeals,
  parseAppealButtonCustomId,
  PENDING_APPEALS_PAGE_SIZE,
  reviewDiscordAppealSubmission,
} from "./appeals.js";

const INTERACTION_PING = 1;
const INTERACTION_APPLICATION_COMMAND = 2;
const INTERACTION_MESSAGE_COMPONENT = 3;
const INTERACTION_CHANNEL_MESSAGE = 4;
const EPHEMERAL_FLAG = 1 << 6;

type DiscordInteractionOption = {
  name: string;
  value: string | number;
};

type DiscordInteraction = {
  type: number;
  data?: {
    custom_id?: string;
    name?: string;
    options?: DiscordInteractionOption[];
  };
  member?: {
    user: { id: string; username: string };
  };
  user?: { id: string; username: string };
  message?: { id: string };
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function channelMessage(content: string) {
  return {
    type: INTERACTION_CHANNEL_MESSAGE,
    data: { content },
  };
}

function ephemeralMessage(content: string) {
  return {
    type: INTERACTION_CHANNEL_MESSAGE,
    data: { content, flags: EPHEMERAL_FLAG },
  };
}

function ephemeralEmbedMessage(input: {
  content?: string;
  embeds: unknown[];
  components?: unknown[];
}) {
  return {
    type: INTERACTION_CHANNEL_MESSAGE,
    data: {
      content: input.content,
      embeds: input.embeds,
      components: input.components,
      flags: EPHEMERAL_FLAG,
    },
  };
}

function getInteractionUser(interaction: DiscordInteraction) {
  return interaction.member?.user ?? interaction.user ?? null;
}

function getOptionValue(
  interaction: DiscordInteraction,
  name: string,
): string | number | undefined {
  return interaction.data?.options?.find((opt) => opt.name === name)?.value;
}

async function verifyDiscordSignature(
  body: string,
  signature: string,
  timestamp: string,
  publicKey: string,
): Promise<boolean> {
  try {
    const normalizedKey = publicKey.replace(/[^0-9a-fA-F]/g, "");
    if (normalizedKey.length !== 64) {
      console.error(
        "[discord-interactions] DISCORD_PUBLIC_KEY must be 64 hex characters",
      );
      return false;
    }
    return verifyKey(body, signature, timestamp, normalizedKey);
  } catch (err) {
    console.error("[discord-interactions] Signature verification error:", err);
    return false;
  }
}

async function requireReviewer(userId: string): Promise<Response | null> {
  const isReviewer = await isDiscordAppealReviewer(userId);
  if (!isReviewer) {
    return jsonResponse(
      ephemeralMessage("You do not have permission to review appeals."),
    );
  }
  return null;
}

async function handleAppealsCommand(
  interaction: DiscordInteraction,
  userId: string,
): Promise<Response> {
  const denied = await requireReviewer(userId);
  if (denied) return denied;

  const pageRaw = getOptionValue(interaction, "page");
  const page =
    typeof pageRaw === "number"
      ? pageRaw
      : typeof pageRaw === "string"
        ? Number.parseInt(pageRaw, 10)
        : 1;

  const result = await listPendingAppeals({
    page: Number.isFinite(page) && page >= 1 ? page : 1,
    pageSize: PENDING_APPEALS_PAGE_SIZE,
  });

  const embed = formatPendingAppealsListEmbed({
    items: result.items.map((item) => ({
      submissionId: item.submissionId,
      discordUsername: item.discordUsername,
      appealType: item.appealType,
      submittedAt: item.submittedAt,
    })),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  });

  return jsonResponse(ephemeralEmbedMessage({ embeds: [embed] }));
}

async function handleAppealCommand(
  interaction: DiscordInteraction,
  userId: string,
): Promise<Response> {
  const denied = await requireReviewer(userId);
  if (denied) return denied;

  const submissionIdRaw = getOptionValue(interaction, "submission_id");
  const submissionId =
    typeof submissionIdRaw === "string" ? submissionIdRaw.trim() : "";

  if (!submissionId) {
    return jsonResponse(
      ephemeralMessage("Please provide a valid submission_id."),
    );
  }

  const appeal = await getAppealById(submissionId);
  if (!appeal) {
    return jsonResponse(ephemeralMessage("Submission not found."));
  }

  const notification: DiscordAppealNotification = {
    submissionId: appeal.submissionId,
    discordUserId: appeal.discordUserId,
    discordUsername: appeal.discordUsername,
    appealType: appeal.appealType,
    responses: appeal.responses,
    status: appeal.status,
    reviewedBy: appeal.reviewedBy,
  };

  const embed = formatAppealEmbed(notification);
  const components = [
    buildAppealActionRow(appeal.submissionId, appeal.status !== "pending"),
  ];

  return jsonResponse(
    ephemeralEmbedMessage({ embeds: [embed], components }),
  );
}

async function handleReviewCommand(
  interaction: DiscordInteraction,
  commandName: string,
  user: { id: string; username: string },
): Promise<Response> {
  const submissionIdRaw = getOptionValue(interaction, "submission_id");
  const submissionId =
    typeof submissionIdRaw === "string" ? submissionIdRaw.trim() : "";

  if (!submissionId) {
    return jsonResponse(
      ephemeralMessage("Please provide a valid submission_id."),
    );
  }

  let action: "approve" | "reject" | null = null;
  if (commandName === "approve-ban-appeal") action = "approve";
  if (commandName === "reject-ban-appeal") action = "reject";

  if (!action) {
    return jsonResponse(ephemeralMessage("Unknown command."));
  }

  const result = await reviewDiscordAppealSubmission({
    submissionId,
    action,
    reviewerDiscordUserId: user.id,
    reviewerUsername: user.username,
  });

  return jsonResponse(ephemeralMessage(result.message));
}

async function handleSlashCommand(interaction: DiscordInteraction) {
  const commandName = interaction.data?.name;

  if (commandName === "ping") {
    return jsonResponse(channelMessage("Pong!"));
  }

  const user = getInteractionUser(interaction);
  if (!user) {
    return jsonResponse(ephemeralMessage("Could not identify user."));
  }

  if (commandName === "appeals") {
    return handleAppealsCommand(interaction, user.id);
  }

  if (commandName === "appeal") {
    return handleAppealCommand(interaction, user.id);
  }

  if (
    commandName === "approve-ban-appeal" ||
    commandName === "reject-ban-appeal"
  ) {
    return handleReviewCommand(interaction, commandName, user);
  }

  return jsonResponse(ephemeralMessage("Unknown command."));
}

async function handleButtonClick(interaction: DiscordInteraction) {
  const customId = interaction.data?.custom_id;
  if (!customId) {
    return jsonResponse(ephemeralMessage("Invalid button."));
  }

  const parsed = parseAppealButtonCustomId(customId);
  if (!parsed) {
    return jsonResponse(ephemeralMessage("Unknown button action."));
  }

  const user = getInteractionUser(interaction);
  if (!user) {
    return jsonResponse(ephemeralMessage("Could not identify user."));
  }

  const result = await reviewDiscordAppealSubmission({
    submissionId: parsed.submissionId,
    action: parsed.action,
    reviewerDiscordUserId: user.id,
    reviewerUsername: user.username,
  });

  return jsonResponse(ephemeralMessage(result.message));
}

export async function handleDiscordInteraction(
  req: Request,
): Promise<Response> {
  const publicKey = getDiscordPublicKey();
  if (!publicKey) {
    console.error(
      "[discord-interactions] DISCORD_PUBLIC_KEY is not configured — returning 503",
    );
    return jsonResponse({ error: "DISCORD_PUBLIC_KEY is not configured" }, 503);
  }

  const signature = req.headers.get("X-Signature-Ed25519");
  const timestamp = req.headers.get("X-Signature-Timestamp");
  const body = await req.text();

  if (!signature || !timestamp) {
    console.error("[discord-interactions] Missing signature headers");
    return jsonResponse({ error: "Missing signature" }, 401);
  }

  if (!(await verifyDiscordSignature(body, signature, timestamp, publicKey))) {
    console.error(
      "[discord-interactions] Invalid signature — check DISCORD_PUBLIC_KEY",
    );
    return jsonResponse({ error: "Invalid signature" }, 401);
  }

  const interaction = JSON.parse(body) as DiscordInteraction;

  if (interaction.type === INTERACTION_PING) {
    return jsonResponse({ type: INTERACTION_PING });
  }

  // /ping works without full appeal config — confirms interactions + signature verify
  if (
    interaction.type === INTERACTION_APPLICATION_COMMAND &&
    interaction.data?.name === "ping"
  ) {
    return handleSlashCommand(interaction);
  }

  const config = getDiscordAppealBotConfig();
  if (!config) {
    return jsonResponse(
      { error: "Discord appeal is not fully configured" },
      503,
    );
  }

  if (interaction.type === INTERACTION_APPLICATION_COMMAND) {
    return handleSlashCommand(interaction);
  }

  if (interaction.type === INTERACTION_MESSAGE_COMPONENT) {
    return handleButtonClick(interaction);
  }

  return jsonResponse({ error: "Unhandled interaction type" }, 400);
}
