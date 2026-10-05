/**
 * pnpm db:export-seed   (owner only)
 *
 * Builds the seed archive shared with developers:
 *   1. copies the allowlisted content collections (seed-collections.ts) from
 *      production into a staging database (ralevel_seed) in the local
 *      mongo-dev container. Production is only read, never written.
 *   2. redacts every `email` field and reports anything else that looks like
 *      an email address (scrub.mongosh.js)
 *   3. dumps the staging database to seed/ralevel-seed-YYYY-MM-DD.archive.gz
 *      and drops it
 *
 * The production URI comes from PROD_MONGODB_URI in
 * apps/website/.env.prod-access.local (override the file with
 * --env-file=<path>). It is passed to the container as an environment
 * variable, never as a command-line argument.
 */
import fs from "node:fs";
import path from "node:path";
import { finished } from "node:stream/promises";

import { assertRunning, compose } from "./compose";
import { LOCAL_DBS, PROD_ACCESS_ENV, PROD_DB, SEED_ARCHIVE_DB, SEED_DIR } from "./config";
import { confirmProd, readEnvFile } from "./guard";
import { SEED_COLLECTIONS } from "./seed-collections";

const SERVICE = LOCAL_DBS.dev.service;

async function mongosh(evalJs: string, db = SEED_ARCHIVE_DB) {
  await compose(["exec", "-T", SERVICE, "mongosh", "--quiet", db, "--eval", evalJs]);
}

async function main() {
  const envFileArg = process.argv.find((a) => a.startsWith("--env-file="));
  const envFile = envFileArg ? path.resolve(envFileArg.split("=")[1]) : PROD_ACCESS_ENV;
  const prodUri = readEnvFile(envFile, "PROD_MONGODB_URI");
  if (!prodUri) {
    throw new Error(`PROD_MONGODB_URI is not set in ${envFile}. Only the owner can export the seed.`);
  }

  // mongodump reads the database name from the URI path.
  let uriDb: string;
  try {
    uriDb = decodeURIComponent(new URL(prodUri).pathname.replace(/^\//, ""));
  } catch {
    throw new Error("PROD_MONGODB_URI could not be parsed.");
  }
  if (uriDb !== PROD_DB) {
    throw new Error(`PROD_MONGODB_URI must end in /${PROD_DB}, not /${uriDb || "(none)"}.`);
  }

  for (const name of SEED_COLLECTIONS) {
    if (!/^[a-z0-9_]+$/i.test(name)) throw new Error(`Invalid collection name: ${name}`);
  }

  assertRunning(SERVICE);
  await confirmProd(
    `read ${SEED_COLLECTIONS.length} content collections from "${PROD_DB}" (read-only).`
  );

  const date = new Date().toISOString().slice(0, 10);
  const outFile = path.join(SEED_DIR, `ralevel-seed-${date}.archive.gz`);
  fs.mkdirSync(SEED_DIR, { recursive: true });

  // 1. production -> staging, one collection at a time (mongodump has no
  //    allowlist flag). Everything runs inside the container; collections
  //    missing from production are skipped.
  await mongosh("void db.dropDatabase()");
  console.log(`\n1/3 Copying from production into ${SEED_ARCHIVE_DB}...`);
  const copyAll = [
    "set -euo pipefail",
    `existing=" $(mongosh "$PROD_MONGODB_URI" --quiet --eval 'db.getCollectionNames().join(" ")') "`,
    `for c in ${SEED_COLLECTIONS.join(" ")}; do`,
    `  case "$existing" in *" $c "*) ;; *) echo "  skipping $c (not in ${PROD_DB})"; continue ;; esac`,
    `  mongodump --uri="$PROD_MONGODB_URI" --readPreference=secondaryPreferred --collection="$c" --archive --quiet` +
      ` | mongorestore --archive --quiet --nsFrom='${PROD_DB}.*' --nsTo='${SEED_ARCHIVE_DB}.*'`,
    "done",
  ].join("\n");
  await compose(["exec", "-T", "-e", "PROD_MONGODB_URI", SERVICE, "bash", "-c", copyAll], {
    env: { PROD_MONGODB_URI: prodUri },
  });

  // 2. scrub personal data
  console.log("\n2/3 Redacting email fields...");
  await mongosh(fs.readFileSync(path.join(__dirname, "scrub.mongosh.js"), "utf8"));

  // 3. staging -> archive
  console.log(`\n3/3 Writing ${path.relative(process.cwd(), outFile)}...`);
  const out = fs.createWriteStream(outFile);
  const written = finished(out);
  try {
    await compose(
      ["exec", "-T", SERVICE, "mongodump", `--db=${SEED_ARCHIVE_DB}`, "--archive", "--gzip"],
      { stdout: out }
    );
    await written;
  } catch (err) {
    written.catch(() => {});
    out.destroy();
    fs.rmSync(outFile, { force: true });
    throw err;
  }
  await mongosh("void db.dropDatabase()");

  const mb = (fs.statSync(outFile).size / 1024 / 1024).toFixed(1);
  console.log(`\n✅ Wrote ${outFile} (${mb} MB).`);
  console.log("Check any ⚠️ lines above before sharing it. Never commit it.");
}

main().catch((err) => {
  console.error(`❌ ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
