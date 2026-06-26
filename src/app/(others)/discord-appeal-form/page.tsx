import fs from "fs";
import path from "path";
import AppealClient from "./AppealClient";

function loadRulesContent(): string[] {
  const contentPath = path.join(
    process.cwd(),
    "src/app/(others)/discord-appeal-form/content.md",
  );
  const raw = fs.readFileSync(contentPath, "utf-8");
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim());
}

export default async function AppealPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const rulesContent = loadRulesContent();
  return <AppealClient rulesContent={rulesContent} authError={error} />;
}
