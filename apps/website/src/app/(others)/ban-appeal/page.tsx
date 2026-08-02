import fs from "fs";
import path from "path";
import { getDiscordAppealSession } from "@/lib/discord-appeal/oauth";
import BanAppealPageClient from "./pageClient";

export const dynamic = "force-dynamic";

function loadRulesContent(): string[] {
  const contentPath = path.join(
    process.cwd(),
    "src/app/(others)/ban-appeal/content.md",
  );
  const raw = fs.readFileSync(contentPath, "utf-8");
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim());
}

export default async function BanAppealPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const discordSession = await getDiscordAppealSession();
  const rulesContent = loadRulesContent();

  return (
    <BanAppealPageClient
      rulesContent={rulesContent}
      initialDiscord={
        discordSession
          ? {
              discordUserId: discordSession.discordUserId,
              discordUsername: discordSession.discordUsername,
              discordAvatar: discordSession.discordAvatar,
            }
          : null
      }
      authError={error}
    />
  );
}
