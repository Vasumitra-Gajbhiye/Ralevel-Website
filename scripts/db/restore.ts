/**
 * pnpm db:restore <archive> [--test]
 *
 * Restores a seed archive into ralevel_dev (or ralevel_test with --test).
 * Without an archive argument, uses the newest file in seed/.
 */
import { resolveArchive, restoreArchive, targetFromArgs } from "./archive";

async function main() {
  const args = process.argv.slice(2);
  const file = resolveArchive(args.find((a) => !a.startsWith("--")));
  await restoreArchive(file, targetFromArgs(args));
}

main().catch((err) => {
  console.error(`❌ ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
