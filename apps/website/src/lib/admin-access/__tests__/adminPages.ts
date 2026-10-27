import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const SRC_DIR = fileURLToPath(new URL("../../../", import.meta.url));

export const ADMIN_APP_DIR = fileURLToPath(
  new URL("../../../app/(admin)/admin", import.meta.url),
);

export type AdminPageFile = {
  /** The page as a URL, with dynamic segments filled in. */
  path: string;
  /** Absolute path of the page.tsx file. */
  file: string;
};

/** Every admin page.tsx with its URL. */
export function adminPageFiles(): AdminPageFile[] {
  const pages: AdminPageFile[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === "page.tsx") {
        const rel = relative(ADMIN_APP_DIR, dir).split(sep).filter(Boolean);
        const segments = rel
          .filter((s) => !/^\(.*\)$/.test(s))
          .map((s) => (/^\[.*\]$/.test(s) ? "sample-id" : s));
        pages.push({ path: ["/admin", ...segments].join("/"), file: full });
      }
    }
  };
  walk(ADMIN_APP_DIR);
  return pages.sort((a, b) => a.path.localeCompare(b.path));
}

/** Every admin page as a URL, with dynamic segments filled in. */
export function adminPagePaths(): string[] {
  return adminPageFiles().map((page) => page.path);
}
