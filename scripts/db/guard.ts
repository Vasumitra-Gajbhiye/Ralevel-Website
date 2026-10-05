/**
 * Safety guard shared by every script that touches MongoDB.
 *
 * Scripts may only talk to the local Docker databases (see config.ts). The
 * production database is reachable from exactly one place: an explicit
 * `--prod` flag, which needs PROD_MONGODB_URI in .env.prod-access.local and a
 * typed confirmation.
 */
import fs from "node:fs";
import readline from "node:readline";
import dotenv from "dotenv";

import {
  LOCAL_DBS,
  PROD_ACCESS_ENV,
  PROD_DB,
  WEBSITE_ENV_LOCAL,
  type LocalTarget,
} from "./config";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

/**
 * Throws unless `uri` points at the local Docker database for `target`
 * (localhost / 127.0.0.1, the right port and the right database name).
 */
export function assertLocalMongoUri(
  uri: string | undefined,
  target: LocalTarget
): void {
  const expected = LOCAL_DBS[target];
  const fail = (reason: string): never => {
    throw new Error(
      `Refusing to use this MONGODB_URI: ${reason}.\n` +
        `Expected the local ${target} database: ` +
        `mongodb://127.0.0.1:${expected.port}/${expected.db}`
    );
  };

  if (!uri?.trim()) fail("it is not set");
  const trimmed = uri!.trim();

  if (!trimmed.startsWith("mongodb://")) {
    fail("only mongodb:// URIs to localhost are allowed (no mongodb+srv)");
  }

  // Reject multi-host (replica set) URIs before parsing.
  const authority = trimmed.slice("mongodb://".length).split(/[/?]/)[0];
  if (authority.includes(",")) fail("multiple hosts are not allowed");

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return fail("it could not be parsed");
  }

  if (!LOCAL_HOSTS.has(parsed.hostname)) {
    fail(`host "${parsed.hostname}" is not localhost`);
  }
  if (parsed.port !== String(expected.port)) {
    fail(`port ${parsed.port || "(default)"} is not ${expected.port}`);
  }
  const db = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (db !== expected.db) {
    fail(`database "${db || "(none)"}" is not ${expected.db}`);
  }
}

/** Reads one variable from an env file without touching process.env. */
export function readEnvFile(file: string, key: string): string | undefined {
  if (!fs.existsSync(file)) return undefined;
  return dotenv.parse(fs.readFileSync(file))[key]?.trim() || undefined;
}

/** Loads PROD_MONGODB_URI from .env.prod-access.local (owner only). */
export function readProdMongoUri(): string {
  const uri = readEnvFile(PROD_ACCESS_ENV, "PROD_MONGODB_URI");
  if (!uri) {
    throw new Error(
      `PROD_MONGODB_URI is not set in ${PROD_ACCESS_ENV}. ` +
        "Only the owner has this file."
    );
  }
  return uri;
}

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    })
  );
}

/** Asks the user to type the production database name to continue. */
export async function confirmProd(action: string): Promise<void> {
  console.warn(`\n⚠️  PRODUCTION: ${action}`);
  const answer = await ask(`Type "${PROD_DB}" to continue: `);
  if (answer !== PROD_DB) {
    throw new Error("Confirmation did not match. Nothing was done.");
  }
}

/**
 * Uses MONGODB_URI from the shell or apps/website/.env.local, refuses unless it
 * is the local dev database, and sets process.env.MONGODB_URI. Call before
 * importing anything that connects to Mongo.
 */
export function resolveLocalMongoUri(): string {
  const uri =
    process.env.MONGODB_URI?.trim() ||
    readEnvFile(WEBSITE_ENV_LOCAL, "MONGODB_URI");
  assertLocalMongoUri(uri, "dev");
  process.env.MONGODB_URI = uri;
  return uri!;
}

/**
 * For existing scripts in apps/website/scripts. Call before importing anything
 * that connects to Mongo; it sets process.env.MONGODB_URI.
 *
 * - default: the local dev database (see resolveLocalMongoUri).
 * - `--prod`: PROD_MONGODB_URI from .env.prod-access.local after a typed
 *   confirmation (owner only).
 */
export async function resolveScriptMongoUri(
  argv: string[] = process.argv
): Promise<string> {
  if (!argv.includes("--prod")) return resolveLocalMongoUri();

  const uri = readProdMongoUri();
  await confirmProd("this script will run against the production database.");
  process.env.MONGODB_URI = uri;
  return uri;
}
