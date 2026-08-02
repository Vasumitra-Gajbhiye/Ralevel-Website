import fs from "fs";
import path from "path";
import { getAuthSession } from "@/lib/getAuthSession";
import BanAppealClient from "./BanAppealClient";
import BanAppealLoginCard from "./BanAppealLoginCard";

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

export default async function BanAppealPage() {
  const session = await getAuthSession();
  if (!session) {
    return <BanAppealLoginCard />;
  }

  const rulesContent = loadRulesContent();
  return (
    <BanAppealClient
      rulesContent={rulesContent}
      userEmail={session.user.email}
      userName={session.user.name}
    />
  );
}
