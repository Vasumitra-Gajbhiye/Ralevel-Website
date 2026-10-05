/**
 * pnpm db:reset [archive] [--test]
 *
 * Drops ralevel_dev (or ralevel_test with --test) and restores the seed
 * archive again. Without an archive argument, uses the newest file in seed/.
 * Fake personal data is gone afterwards; run `pnpm db:seed-fake` to add it back.
 */
import {
  dropLocalDatabase,
  resolveArchive,
  restoreArchive,
  targetFromArgs,
} from "./archive";

async function main() {
  const args = process.argv.slice(2);
  const target = targetFromArgs(args);
  // Resolve first so a missing archive doesn't leave an empty database.
  const file = resolveArchive(args.find((a) => !a.startsWith("--")));
  await dropLocalDatabase(target);
  await restoreArchive(file, target);
}

main().catch((err) => {
  console.error(`❌ ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
