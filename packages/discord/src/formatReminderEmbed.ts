import type { FormReminderNotification, DiscordEmbed } from "./types";

const REMINDER_COLOR = 0xfaa61a; // Discord yellow/orange

function displayName(data: FormReminderNotification): string {
  return data.submitterName?.trim() || "Unknown";
}

export function formatReminderEmbed(data: FormReminderNotification): DiscordEmbed {
  const title = data.formTitle.replace(/\s+Intake\s+\d+$/i, "").trim();
  const adminUrl = data.adminUrl.trim();

  const embed: DiscordEmbed = {
    title: `Reminder: pending review (day ${data.tier})`,
    color: REMINDER_COLOR,
    fields: [
      { name: "Form", value: data.formType, inline: true },
      { name: "Intake", value: `Cycle ${data.cycleId}`, inline: true },
      { name: "Days pending", value: String(data.daysPending), inline: true },
      { name: "Applicant", value: displayName(data), inline: true },
      {
        name: "Review",
        value: `[Open in admin](${adminUrl})`,
        inline: false,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: `Submission ${data.submissionId}` },
  };

  if (/^https?:\/\//i.test(adminUrl)) {
    embed.url = adminUrl;
  }

  return embed;
}
