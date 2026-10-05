/** Shared helpers for restoring seed archives into the local databases. */
import fs from "node:fs";
import path from "node:path";

import { assertRunning, compose } from "./compose";
import {
  LOCAL_DBS,
  SEED_ARCHIVE_DB,
  SEED_DIR,
  localMongoUri,
  type LocalTarget,
} from "./config";
import { assertLocalMongoUri } from "./guard";

/** `--test` targets mongo-test / ralevel_test, otherwise mongo-dev / ralevel_dev. */
export function targetFromArgs(args: string[]): LocalTarget {
  return args.includes("--test") ? "test" : "dev";
}

/** Newest *.archive.gz in seed/, or undefined. */
export function latestArchive(): string | undefined {
  if (!fs.existsSync(SEED_DIR)) return undefined;
  const newest = fs
    .readdirSync(SEED_DIR)
    .filter((f) => f.endsWith(".archive.gz"))
    .map((f) => path.join(SEED_DIR, f))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
  return newest;
}

/** Resolves the archive argument, falling back to the newest one in seed/. */
export function resolveArchive(arg: string | undefined): string {
  const file = arg ? path.resolve(arg) : latestArchive();
  if (!file) {
    throw new Error(
      "No seed archive given and none found in seed/.\n" +
        "Usage: pnpm db:restore <path/to/ralevel-seed.archive.gz>"
    );
  }
  if (!fs.existsSync(file)) throw new Error(`Archive not found: ${file}`);
  return file;
}

/** Drops the whole local database for `target`. */
export async function dropLocalDatabase(target: LocalTarget): Promise<void> {
  const { service, db } = LOCAL_DBS[target];
  assertLocalMongoUri(localMongoUri(target), target);
  assertRunning(service);
  await compose([
    "exec", "-T", service,
    "mongosh", "--quiet", db, "--eval", "void db.dropDatabase()",
  ]);
  console.log(`Dropped ${db}.`);
}

/**
 * Restores a seed archive into the local database for `target`. Collections in
 * the archive replace existing ones (`--drop`); others are left alone.
 */
export async function restoreArchive(file: string, target: LocalTarget): Promise<void> {
  const { service, db } = LOCAL_DBS[target];
  assertLocalMongoUri(localMongoUri(target), target);
  assertRunning(service);

  console.log(`Restoring ${path.basename(file)} into ${db} (${service})...`);
  await compose(
    [
      "exec", "-T", service,
      "mongorestore", "--archive", "--gzip", "--drop",
      `--nsInclude=${SEED_ARCHIVE_DB}.*`,
      `--nsFrom=${SEED_ARCHIVE_DB}.*`,
      `--nsTo=${db}.*`,
    ],
    { stdin: fs.createReadStream(file) }
  );
  console.log(`✅ Restored into ${db}.`);
}
