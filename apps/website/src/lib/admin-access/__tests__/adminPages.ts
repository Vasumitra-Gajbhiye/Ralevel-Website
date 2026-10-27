import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ADMIN_APP_DIR = fileURLToPath(
  new URL("../../../app/(admin)/admin", import.meta.url),
);

/** Every admin page as a URL, with dynamic segments filled in. */
export function adminPagePaths(): string[] {
  const paths: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === "page.tsx") {
        const rel = relative(ADMIN_APP_DIR, dir).split(sep).filter(Boolean);
        const segments = rel
          .filter((s) => !/^\(.*\)$/.test(s))
          .map((s) => (/^\[.*\]$/.test(s) ? "sample-id" : s));
        paths.push(["/admin", ...segments].join("/"));
      }
    }
  };
  walk(ADMIN_APP_DIR);
  return paths.sort();
}
