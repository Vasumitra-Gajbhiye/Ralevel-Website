/**
 * Client for the ralevel applications Discord bot (separate Coolify service).
 * Discord I/O happens in apps/bot — the website only fires-and-forgets HTTP calls.
 */

type ApplicationSubmittedPayload = {
  formTitle: string;
  formType: string;
  formSlug: string;
  cycleId: number;
  submitterName?: string;
  submitterEmail?: string;
  submissionId: string;
  hasFiles: boolean;
  pingUserIds: string[];
};

type AppealSubmittedPayload = {
  submissionId: string;
  discordUserId?: string;
  discordUsername?: string;
  appealType: "ban" | "warning" | "timeout";
  responses: { q1: string; q2: string; q3: string };
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  banId?: string;
  submitterEmail?: string;
  submitterName?: string;
  sendAckDm?: boolean;
};

function getBotConfig(): { baseUrl: string; secret: string } | null {
  const baseUrl = process.env.BOT_INTERNAL_URL?.trim().replace(/\/$/, "");
  const secret = process.env.INTERNAL_BOT_SECRET?.trim();
  if (!baseUrl || !secret) {
    return null;
  }
  return { baseUrl, secret };
}

async function postInternal<T>(
  path: string,
  body: unknown,
): Promise<T | null> {
  const config = getBotConfig();
  if (!config) {
    console.warn(
      `[bot-client] BOT_INTERNAL_URL or INTERNAL_BOT_SECRET missing — skipped ${path}`,
    );
    return null;
  }

  const response = await fetch(`${config.baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-bot-secret": config.secret,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Bot ${path} returned ${response.status}: ${text.slice(0, 200)}`,
    );
  }

  return (await response.json()) as T;
}

export async function notifyBotApplicationSubmitted(
  data: ApplicationSubmittedPayload,
): Promise<void> {
  await postInternal("/internal/application-submitted", data);
}

export async function notifyBotAppealSubmitted(
  data: AppealSubmittedPayload,
): Promise<{ messageId: string | null } | null> {
  const result = await postInternal<{
    ok: boolean;
    messageId: string | null;
  }>("/internal/appeal-submitted", data);

  if (!result) return null;
  return { messageId: result.messageId ?? null };
}
