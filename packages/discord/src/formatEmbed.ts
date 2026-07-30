import type { DiscordEmbed, FormSubmissionNotification } from "./types";

const EMBED_COLOR = 0x57f287; // Discord green

function displayName(data: FormSubmissionNotification): string {
  return data.submitterName?.trim() || "Unknown";
}

function displayEmail(data: FormSubmissionNotification): string {
  return data.submitterEmail?.trim() || "Not provided";
}

export function formatSubmissionEmbed(
  data: FormSubmissionNotification,
): DiscordEmbed {
  const title = data.formTitle.replace(/\s+Intake\s+\d+$/i, "").trim();
  const adminUrl = data.adminUrl.trim();

  const embed: DiscordEmbed = {
    title: `New application: ${title}`,
    color: EMBED_COLOR,
    fields: [
      { name: "Form", value: data.formType, inline: true },
      { name: "Intake", value: `Cycle ${data.cycleId}`, inline: true },
      { name: "Attachments", value: data.hasFiles ? "Yes" : "No", inline: true },
      { name: "Name", value: displayName(data), inline: true },
      { name: "Email", value: displayEmail(data), inline: true },
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
