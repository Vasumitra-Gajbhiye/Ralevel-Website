const DISCORD_SNOWFLAKE_RE = /^\d{17,20}$/;

export function buildPingPayload(userIds: string[] | undefined): {
  content?: string;
  allowed_mentions?: { parse: []; users: string[] };
} {
  if (!userIds?.length) {
    return {};
  }

  const uniqueIds = [...new Set(userIds.map((id) => id.trim()).filter(Boolean))];
  const validIds = uniqueIds.filter((id) => DISCORD_SNOWFLAKE_RE.test(id));

  if (validIds.length === 0) {
    return {};
  }

  return {
    content: validIds.map((id) => `<@${id}>`).join(" "),
    allowed_mentions: {
      parse: [],
      users: validIds,
    },
  };
}
