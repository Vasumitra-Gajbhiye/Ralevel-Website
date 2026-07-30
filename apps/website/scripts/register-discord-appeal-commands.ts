/**
 * Register Discord slash commands for ban appeal review.
 *
 * Usage:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/register-discord-appeal-commands.ts
 */
import "dotenv/config";

const DISCORD_API_BASE = "https://discord.com/api/v10";

const COMMANDS = [
  {
    name: "approve-ban-appeal",
    description: "Approve a pending ban appeal submission",
    options: [
      {
        name: "submission_id",
        description: "MongoDB submission ID from the appeal embed footer",
        type: 3,
        required: true,
      },
    ],
  },
  {
    name: "reject-ban-appeal",
    description: "Reject a pending ban appeal submission",
    options: [
      {
        name: "submission_id",
        description: "MongoDB submission ID from the appeal embed footer",
        type: 3,
        required: true,
      },
    ],
  },
];

async function main() {
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  const clientId = process.env.DISCORD_CLIENT_ID?.trim();
  const guildId = process.env.DISCORD_GUILD_ID?.trim();

  if (!token || !clientId || !guildId) {
    throw new Error(
      "DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, and DISCORD_GUILD_ID are required",
    );
  }

  const response = await fetch(
    `${DISCORD_API_BASE}/applications/${clientId}/guilds/${guildId}/commands`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(COMMANDS),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to register commands (${response.status}): ${body}`);
  }

  const registered = await response.json();
  console.log(`Registered ${registered.length} slash commands:`);
  for (const cmd of registered) {
    console.log(`- /${cmd.name}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
