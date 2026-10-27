import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { SRC_DIR } from "./adminPages";
import { LEGACY_API_RULES } from "./legacy.fixture";

/** Source without `//` comment lines, so commented-out code doesn't count. */
function readCode(file: string) {
  return readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("//"))
    .join("\n");
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "__tests__" ? [] : sourceFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

const rel = (file: string) => relative(SRC_DIR, file);
const serverFiles = [...sourceFiles(join(SRC_DIR, "app")), ...sourceFiles(join(SRC_DIR, "lib"))];

// Role lists that are deliberately not page access.
const ROLE_CHECK_ALLOWLIST = new Set([
  // Writing a blog needs a writer-team identity (WRITER_TEAM_ROLES).
  "app/api/admin/blogs/v2/route.ts",
  "app/api/admin/blogs/v2/[blogId]/route.ts",
  "app/api/admin/blogs/v2/[blogId]/upload-hero/route.ts",
  "app/api/admin/blogs/v2/[blogId]/submit-review/route.ts",
  "app/api/admin/blogs/v2/[blogId]/versions/[versionId]/restore/route.ts",
  "app/api/admin/blogs/v2/[blogId]/history/route.ts",
  // Only owners and admins delete legacy v1 blogs.
  "app/api/admin/blogs/[slug]/route.ts",
  // Owners and admins give themselves the writer role.
  "app/api/admin/writer-access/self/route.ts",
  // Legacy resources API with no admin page; owner/admin only.
  "app/api/resources/route.tsx",
  "app/api/resources/[id]/route.tsx",
]);

/** Every section literal a file checks: section options and section helpers. */
function sectionLiterals(source: string): string[] {
  const patterns = [
    /section:\s*("[^"]+"|\[[^\]]+\])/g,
    /requireSection\(\s*\w+\s*,\s*("[^"]+"|\[[^\]]+\])\s*\)/g,
    /requireSectionAction\(\s*("[^"]+"|\[[^\]]+\])\s*\)/g,
    /canAccessSection\([^,()]+(?:\([^)]*\))?[^,()]*,\s*("[^"]+"|\[[^\]]+\])\s*,?\s*\)/g,
  ];
  return patterns.flatMap((pattern) =>
    [...source.matchAll(pattern)].map((m) => m[1].replace(/\s+/g, " ")),
  );
}

const literal = (section: string | string[]) =>
  typeof section === "string" ? `"${section}"` : `[${section.map((s) => `"${s}"`).join(", ")}]`;

function fileForRule(route: string): string {
  if (route.startsWith("app/")) return join(SRC_DIR, route);
  if (route.startsWith("api/admin/scholarships/")) {
    return join(SRC_DIR, "lib/scholarships/adminApi.ts");
  }
  if (/^api\/admin\/(resource|scholarship)-access/.test(route)) {
    return join(SRC_DIR, "lib/admin/teamAccessConfigs.ts");
  }
  const base = join(SRC_DIR, "app", route);
  return existsSync(`${base}/route.ts`) ? `${base}/route.ts` : `${base}/route.tsx`;
}

describe("admin API guards", () => {
  it("checks page access instead of role lists outside the allowlist", () => {
    const offenders = serverFiles
      .filter((file) => {
        const code = readCode(file);
        return (
          /authorizeAdminApi\(\s*\w+\s*,\s*\{\s*roles:/.test(code) ||
          /\brequireRoles\(/.test(code.replace(/export function requireRoles\(/, ""))
        );
      })
      .map(rel)
      .filter((file) => !ROLE_CHECK_ALLOWLIST.has(file) && file !== "lib/requireRoles.ts");
    expect(offenders).toEqual([]);
  });

  it("uses the expected section for every endpoint that used to list roles", () => {
    const problems: string[] = [];
    for (const rule of LEGACY_API_RULES) {
      const file = fileForRule(rule.route);
      const found = sectionLiterals(readCode(file));
      if (!found.includes(literal(rule.section))) {
        problems.push(`${rule.route}: expected ${literal(rule.section)}, found ${found.join(" | ") || "none"}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it("doesn't mix sections inside a migrated route file", () => {
    const problems: string[] = [];
    for (const rule of LEGACY_API_RULES) {
      const file = fileForRule(rule.route);
      if (file.endsWith("teamAccessConfigs.ts")) continue;
      const found = new Set(sectionLiterals(readCode(file)));
      const expected = LEGACY_API_RULES.filter((r) => fileForRule(r.route) === file).map((r) =>
        literal(r.section),
      );
      for (const value of found) {
        if (!expected.includes(value)) problems.push(`${rel(file)}: unexpected ${value}`);
      }
    }
    expect(problems).toEqual([]);
  });
});
