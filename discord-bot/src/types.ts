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
  pingUserIds?: string[];
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
  content?: string;
  embeds: DiscordEmbed[];
  allowed_mentions?: {
    parse: [];
    users: string[];
  };
};
