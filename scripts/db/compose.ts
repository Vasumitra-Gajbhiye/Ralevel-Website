/**
 * Runs `docker compose -f docker-compose.dev.yml ...` without a shell, so
 * arguments are passed through unchanged on Windows, macOS and Linux.
 */
import { spawn, spawnSync } from "node:child_process";
import type { Readable, Writable } from "node:stream";

import { COMPOSE_FILE } from "./config";

type ComposeOptions = {
  /** Piped into the command's stdin (e.g. an archive for mongorestore). */
  stdin?: Readable;
  /** Receives the command's stdout (e.g. an archive from mongodump). */
  stdout?: Writable;
  /** Extra environment variables for `docker compose exec -e NAME`. */
  env?: NodeJS.ProcessEnv;
};

export function compose(args: string[], opts: ComposeOptions = {}) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn("docker", ["compose", "-f", COMPOSE_FILE, ...args], {
      stdio: [opts.stdin ? "pipe" : "inherit", opts.stdout ? "pipe" : "inherit", "inherit"],
      env: { ...process.env, ...opts.env },
    });

    if (opts.stdin) opts.stdin.pipe(child.stdin!);
    if (opts.stdout) child.stdout!.pipe(opts.stdout);

    child.on("error", (err) =>
      reject(new Error(`Could not run docker. Is Docker running? (${err.message})`))
    );
    child.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`docker compose ${args[0]} exited with code ${code}`))
    );
  });
}

/** Throws a friendly error unless the compose service is running. */
export function assertRunning(service: string): void {
  const result = spawnSync(
    "docker",
    ["compose", "-f", COMPOSE_FILE, "ps", "--status", "running", "--services"],
    { encoding: "utf8" }
  );
  if (result.error) {
    throw new Error(`Could not run docker. Is Docker running? (${result.error.message})`);
  }
  const running = (result.stdout ?? "").split(/\r?\n/).map((s) => s.trim());
  if (!running.includes(service)) {
    throw new Error(`The ${service} container is not running. Run \`pnpm db:up\` first.`);
  }
}
