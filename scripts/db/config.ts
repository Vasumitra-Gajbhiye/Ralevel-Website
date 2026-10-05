/**
 * Single source of truth for the local databases started by
 * docker-compose.dev.yml. Keep the ports in sync with that file.
 */
import path from "node:path";

export const REPO_ROOT = path.resolve(__dirname, "../..");
export const COMPOSE_FILE = path.join(REPO_ROOT, "docker-compose.dev.yml");
export const WEBSITE_DIR = path.join(REPO_ROOT, "apps/website");
export const SEED_DIR = path.join(REPO_ROOT, "seed");

/** Website env file for local development (must point at ralevel_dev). */
export const WEBSITE_ENV_LOCAL = path.join(WEBSITE_DIR, ".env.local");
/** Owner-only file holding PROD_MONGODB_URI. Never loaded by Next.js. */
export const PROD_ACCESS_ENV = path.join(WEBSITE_DIR, ".env.prod-access.local");

/** Name of the production database. */
export const PROD_DB = "r_alevel";

/**
 * Database name used inside seed archives. export-seed stages the prod copy
 * under this name in mongo-dev (to scrub it), and restore maps it to the
 * target database.
 */
export const SEED_ARCHIVE_DB = "ralevel_seed";

export const LOCAL_DBS = {
  dev: { service: "mongo-dev", port: 27027, db: "ralevel_dev" },
  test: { service: "mongo-test", port: 27028, db: "ralevel_test" },
} as const;

export type LocalTarget = keyof typeof LOCAL_DBS;

export function localMongoUri(target: LocalTarget): string {
  const { port, db } = LOCAL_DBS[target];
  return `mongodb://127.0.0.1:${port}/${db}`;
}
