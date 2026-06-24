const DISCORD_SNOWFLAKE_RE = /^\d{17,20}$/;

export type PingTargets = {
  userIds?: string[];
  roleIds?: string[];
};

export function buildPingPayload(targets?: PingTargets): {
  content?: string;
  allowed_mentions?: { parse: []; users: string[]; roles: string[] };
} {
  const userIds = [
    ...new Set((targets?.userIds ?? []).map((id) => id.trim()).filter(Boolean)),
  ].filter((id) => DISCORD_SNOWFLAKE_RE.test(id));

  const roleIds = [
    ...new Set((targets?.roleIds ?? []).map((id) => id.trim()).filter(Boolean)),
  ].filter((id) => DISCORD_SNOWFLAKE_RE.test(id));

  if (userIds.length === 0 && roleIds.length === 0) {
    return {};
  }

  const parts = [
    ...userIds.map((id) => `<@${id}>`),
    ...roleIds.map((id) => `<@&${id}>`),
  ];

  return {
    content: parts.join(" "),
    allowed_mentions: {
      parse: [],
      users: userIds,
      roles: roleIds,
    },
  };
}

// Backward-compatible helper for submission notifications
export function buildUserPingPayload(userIds: string[] | undefined) {
  return buildPingPayload({ userIds });
}
