import { handleDiscordInteraction } from "@/lib/discord-appeal/interactions";

export async function POST(req: Request) {
  return handleDiscordInteraction(req);
}
