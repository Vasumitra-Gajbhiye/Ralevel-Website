export type FormSubmissionNotification = {
  formTitle: string;
  formType: string;
  formSlug: string;
  cycleId: number;
  submitterName?: string;
  submitterEmail?: string;
  submissionId: string;
  hasFiles: boolean;
  adminUrl: string;
};

export type DiscordEmbed = {
  title: string;
  url?: string;
  color: number;
  fields: { name: string; value: string; inline?: boolean }[];
  timestamp: string;
  footer?: { text: string };
};

export type DiscordMessagePayload = {
  embeds: DiscordEmbed[];
};
