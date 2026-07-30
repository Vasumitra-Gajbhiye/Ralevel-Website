import { verifyKey } from "discord-interactions";
import { getDiscordAppealBotConfig, getDiscordPublicKey } from "../config.js";
import {
  parseAppealButtonCustomId,
  reviewDiscordAppealSubmission,
} from "./appeals.js";

const INTERACTION_PING = 1;
const INTERACTION_APPLICATION_COMMAND = 2;
const INTERACTION_MESSAGE_COMPONENT = 3;
const INTERACTION_CHANNEL_MESSAGE = 4;
const EPHEMERAL_FLAG = 1 << 6;

type DiscordInteraction = {
  type: number;
  data?: {
    custom_id?: string;
    name?: string;
    options?: { name: string; value: string }[];
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

function ephemeralMessage(content: string) {
  return {
    type: INTERACTION_CHANNEL_MESSAGE,
    data: { content, flags: EPHEMERAL_FLAG },
  };
}

function getInteractionUser(interaction: DiscordInteraction) {
  return interaction.member?.user ?? interaction.user ?? null;
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

async function handleSlashCommand(interaction: DiscordInteraction) {
  const commandName = interaction.data?.name;
  const submissionId = interaction.data?.options?.find(
    (opt) => opt.name === "submission_id",
  )?.value;

  const user = getInteractionUser(interaction);
  if (!user) {
    return jsonResponse(ephemeralMessage("Could not identify user."));
  }

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
