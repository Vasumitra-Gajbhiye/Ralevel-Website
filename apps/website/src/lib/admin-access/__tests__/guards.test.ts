import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { matchAdminSection } from "../sections";
import { ADMIN_APP_DIR, adminPageFiles } from "./adminPages";

const GUARD = /guardSection\(\s*"([^"]+)"\s*\)/;

/** Source without `//` comment lines, so commented-out code doesn't count. */
function readCode(file: string) {
  return readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("//"))
    .join("\n");
}

function isClientComponent(source: string) {
  return /^\s*["']use client["']/.test(source);
}

/** The guardSection key a page (or, for client pages, its nearest guarding layout) uses. */
function guardKeyFor(file: string): { key: string | null; where: string } {
  const source = readCode(file);
  if (!isClientComponent(source)) {
    return { key: source.match(GUARD)?.[1] ?? null, where: file };
  }
  for (let dir = dirname(file); dir.startsWith(ADMIN_APP_DIR); dir = dirname(dir)) {
    const layout = join(dir, "layout.tsx");
    if (dir === ADMIN_APP_DIR) break;
    if (!existsSync(layout)) continue;
    const key = readCode(layout).match(GUARD)?.[1];
    if (key) return { key, where: layout };
  }
  return { key: null, where: file };
}

describe("admin page guards", () => {
  it("guards every page with its own section", () => {
    const problems: string[] = [];
    for (const page of adminPageFiles()) {
      if (page.path === "/admin") continue;
      const expected = matchAdminSection(page.path)?.key;
      const { key, where } = guardKeyFor(page.file);
      if (key !== expected) {
        problems.push(
          `${relative(ADMIN_APP_DIR, where)}: expected guardSection("${expected}"), found ${key ? `"${key}"` : "none"}`,
        );
      }
    }
    expect(problems).toEqual([]);
  });

  it("puts the guard before anything else in server pages", () => {
    const late: string[] = [];
    for (const page of adminPageFiles()) {
      const source = readCode(page.file);
      if (page.path === "/admin" || isClientComponent(source)) continue;
      const body = source.slice(source.indexOf("export default"));
      const firstAwait = body.indexOf("await ");
      if (firstAwait !== body.indexOf("await guardSection(")) {
        late.push(relative(ADMIN_APP_DIR, page.file));
      }
    }
    expect(late).toEqual([]);
  });
});
