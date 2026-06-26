import {
  parseAppealButtonCustomId,
  reviewDiscordAppealSubmission,
} from "@/lib/discord-appeal/review";
import {
  getDiscordAppealConfig,
  getDiscordPublicKey,
} from "@/lib/discord-appeal/config";
import { verifyKey } from "discord-interactions";

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

function verifyDiscordSignature(
  body: string,
  signature: string,
  timestamp: string,
  publicKey: string,
): Promise<boolean> {
  try {
    // Strip any accidental quotes/whitespace from .env copy-paste
    const normalizedKey = publicKey.replace(/[^0-9a-fA-F]/g, "");
    if (normalizedKey.length !== 64) {
      console.error(
        "[discord-interactions] DISCORD_PUBLIC_KEY must be 64 hex characters",
      );
      return Promise.resolve(false);
    }

    return verifyKey(body, signature, timestamp, normalizedKey);
  } catch (err) {
    console.error("[discord-interactions] Signature verification error:", err);
    return Promise.resolve(false);
  }
}

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
  const user = interaction.member?.user ?? interaction.user;
  if (!user) return null;
  return user;
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

  return jsonResponse(
    ephemeralMessage(result.ok ? result.message : result.message),
  );
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

  if (!result.ok) {
    return jsonResponse(ephemeralMessage(result.message));
  }

  return jsonResponse(ephemeralMessage(result.message));
}

export async function handleDiscordInteraction(req: Request): Promise<Response> {
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
    console.error("[discord-interactions] Invalid signature — check DISCORD_PUBLIC_KEY matches Developer Portal > General Information > Public Key");
    return jsonResponse({ error: "Invalid signature" }, 401);
  }

  const interaction = JSON.parse(body) as DiscordInteraction;

  // Discord portal verification — only needs PUBLIC_KEY + valid signature
  if (interaction.type === INTERACTION_PING) {
    return jsonResponse({ type: INTERACTION_PING });
  }

  const config = getDiscordAppealConfig();
  if (!config) {
    return jsonResponse({ error: "Discord appeal is not fully configured" }, 503);
  }

  if (interaction.type === INTERACTION_APPLICATION_COMMAND) {
    return handleSlashCommand(interaction);
  }

  if (interaction.type === INTERACTION_MESSAGE_COMPONENT) {
    return handleButtonClick(interaction);
  }

  return jsonResponse({ error: "Unhandled interaction type" }, 400);
}
