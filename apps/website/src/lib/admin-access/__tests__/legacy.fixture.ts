// Snapshot of the hardcoded access rules as they were before page access moved
// into the section registry (2026-10-27). Role lists are literals on purpose:
// the tests compare the registry defaults against what the code enforced then,
// so later edits to lib/roles.ts constants can't silently move both sides.

import type { Role } from "@/lib/roles";
import type { AdminSectionKey } from "../sections";

const OWNER_ADMIN: Role[] = ["owner", "admin"];
const WRITER_CMS: Role[] = ["owner", "admin", "writer_dep_head", "senior_writer", "writer"];
const BLOG_REVIEW: Role[] = ["owner", "admin", "writer_dep_head"];
const WRITER_ACCESS_MANAGE: Role[] = ["owner", "admin", "writer_dep_head"];
const FORMS_ACCESS: Role[] = [
  "owner",
  "admin",
  "mod_dep_head",
  "helper_dep_head",
  "graphic_dep_head",
  "info_dep_head",
  "reddit_dep_head",
  "writer_dep_head",
  "resource_dep_head",
];
const RESOURCE_CMS: Role[] = ["owner", "admin", "resource_dep_head", "resource_staff"];
const RESOURCE_ACCESS_MANAGE: Role[] = ["owner", "admin", "resource_dep_head"];
const SCHOLARSHIP_CMS: Role[] = ["owner", "admin", "scholarship_dep_head", "scholarship_staff"];
const SCHOLARSHIP_ACCESS_MANAGE: Role[] = ["owner", "admin", "scholarship_dep_head"];
const SCHEDULING_READ: Role[] = ["owner", "admin", "informative_team", "info_dep_head"];
const SCHEDULING_WRITE: Role[] = ["owner", "admin", "informative_team"];
const QOTD: Role[] = ["owner", "admin", "mod_dep_head"];

/** lib/roles.ts ADMIN_PANEL_ROLES: the /admin layout entry gate. */
export const LEGACY_PANEL_ROLES: Role[] = [
  "owner",
  "admin",
  "writer_dep_head",
  "senior_writer",
  "writer",
  "mod_dep_head",
  "helper_dep_head",
  "graphic_dep_head",
  "info_dep_head",
  "reddit_dep_head",
  "informative_team",
  "resource_dep_head",
  "resource_staff",
  "scholarship_dep_head",
  "scholarship_staff",
];

/** lib/adminAccess.ts ADMIN_SECTION_RULES, in order (first startsWith match wins). */
export const LEGACY_SECTION_RULES: { prefix: string; roles: Role[] }[] = [
  { prefix: "/admin/access", roles: OWNER_ADMIN },
  { prefix: "/admin/all-blogs", roles: BLOG_REVIEW },
  { prefix: "/admin/blogs", roles: WRITER_CMS },
  { prefix: "/admin/certificates", roles: OWNER_ADMIN },
  { prefix: "/admin/team", roles: OWNER_ADMIN },
  { prefix: "/admin/legal", roles: OWNER_ADMIN },
  { prefix: "/admin/apply", roles: OWNER_ADMIN },
  { prefix: "/admin/forms", roles: FORMS_ACCESS },
  { prefix: "/admin/qotd", roles: QOTD },
  { prefix: "/admin/scheduling", roles: SCHEDULING_READ },
  { prefix: "/admin/resource-cms", roles: RESOURCE_CMS },
  { prefix: "/admin/resource", roles: RESOURCE_ACCESS_MANAGE },
  { prefix: "/admin/scholarships/team", roles: SCHOLARSHIP_ACCESS_MANAGE },
  { prefix: "/admin/scholarships", roles: SCHOLARSHIP_CMS },
  { prefix: "/admin/writers", roles: WRITER_ACCESS_MANAGE },
];

/** The old app/(admin)/admin/layout.tsx decision for a single path. */
export function legacyCanOpen(roles: Role[], pathname: string): boolean {
  if (!roles.some((role) => LEGACY_PANEL_ROLES.includes(role))) return false;
  const path =
    pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  if (path === "/admin") return true;
  const rule = LEGACY_SECTION_RULES.find((r) => path.startsWith(r.prefix));
  return !rule || rule.roles.some((role) => roles.includes(role));
}

/** AdminLayoutShell sidebar links (minus the static Tasks link), in order. */
export const LEGACY_SIDEBAR: { href: string; roles: Role[] }[] = [
  { href: "/admin/blogs/v2", roles: WRITER_CMS },
  { href: "/admin/all-blogs", roles: BLOG_REVIEW },
  { href: "/admin/writers", roles: WRITER_ACCESS_MANAGE },
  { href: "/admin/access", roles: OWNER_ADMIN },
  { href: "/admin/resource", roles: RESOURCE_ACCESS_MANAGE },
  { href: "/admin/forms", roles: FORMS_ACCESS },
  { href: "/admin/certificates", roles: OWNER_ADMIN },
  { href: "/admin/team", roles: OWNER_ADMIN },
  { href: "/admin/legal", roles: OWNER_ADMIN },
  { href: "/admin/apply", roles: OWNER_ADMIN },
  { href: "/admin/scheduling", roles: SCHEDULING_READ },
  { href: "/admin/qotd", roles: QOTD },
  { href: "/admin/scholarships", roles: SCHOLARSHIP_CMS },
  { href: "/admin/resource-cms", roles: RESOURCE_CMS },
  { href: "/admin/resource-cms/history", roles: RESOURCE_CMS },
];

export type LegacyApiRule = {
  /** Route file (under src/app) or server-action file. */
  route: string;
  methods: string[];
  roles: Role[];
  /** Section(s) whose access will replace the role list (any-of). */
  section: AdminSectionKey | AdminSectionKey[];
};

/**
 * Every server endpoint that checked a page's role list itself. Rule-based
 * checks (canManageFormType, canVoteOnForm, isAdmin-only branches) and the
 * blogs v2 writer routes (WRITER_TEAM_ROLES, an authoring identity) stay in
 * code and are not listed.
 */
export const LEGACY_API_RULES: LegacyApiRule[] = [
  { route: "api/admin/access", methods: ["GET", "POST", "PATCH", "DELETE"], roles: OWNER_ADMIN, section: "access" },
  { route: "api/admin/access/search", methods: ["GET"], roles: OWNER_ADMIN, section: "access" },
  { route: "api/admin/access/staff-identity", methods: ["PATCH"], roles: OWNER_ADMIN, section: "access" },
  { route: "api/admin/access/incharge-candidates", methods: ["GET"], roles: FORMS_ACCESS, section: "forms" },

  { route: "api/admin/apply", methods: ["GET", "PATCH"], roles: OWNER_ADMIN, section: "apply" },

  { route: "api/admin/blogs", methods: ["GET", "POST"], roles: WRITER_CMS, section: "blogs" },
  { route: "api/admin/blogs/[slug]", methods: ["GET", "PATCH"], roles: WRITER_CMS, section: "blogs" },
  { route: "api/blogs", methods: ["POST", "DELETE"], roles: WRITER_CMS, section: "blogs" },
  { route: "api/blogs/[id]", methods: ["PUT"], roles: WRITER_CMS, section: "blogs" },
  { route: "api/admin/writer-profile", methods: ["GET", "PATCH"], roles: WRITER_CMS, section: "blogs" },
  { route: "api/admin/writer-profile/[userId]", methods: ["GET", "PATCH"], roles: WRITER_CMS, section: ["blogs", "all-blogs"] },
  { route: "api/admin/writer-profile/upload-avatar", methods: ["POST"], roles: WRITER_CMS, section: ["blogs", "all-blogs"] },

  { route: "api/admin/blogs/v2/[blogId]/approve", methods: ["POST"], roles: BLOG_REVIEW, section: "all-blogs" },
  { route: "api/admin/blogs/v2/[blogId]/reject", methods: ["POST"], roles: BLOG_REVIEW, section: "all-blogs" },
  { route: "api/admin/blogs/v2/history", methods: ["GET"], roles: BLOG_REVIEW, section: "all-blogs" },
  { route: "api/admin/blogs/v2/pending", methods: ["GET"], roles: BLOG_REVIEW, section: "all-blogs" },

  { route: "api/admin/writer-access", methods: ["GET", "POST", "PATCH", "DELETE"], roles: WRITER_ACCESS_MANAGE, section: "writers" },
  { route: "api/admin/writer-access/search", methods: ["GET"], roles: WRITER_ACCESS_MANAGE, section: "writers" },

  { route: "api/admin/resource-access", methods: ["GET", "POST", "PATCH", "DELETE"], roles: RESOURCE_ACCESS_MANAGE, section: "resource-team" },
  { route: "api/admin/resource-access/search", methods: ["GET"], roles: RESOURCE_ACCESS_MANAGE, section: "resource-team" },
  { route: "api/admin/scholarship-access", methods: ["GET", "POST", "PATCH", "DELETE"], roles: SCHOLARSHIP_ACCESS_MANAGE, section: "scholarship-team" },
  { route: "api/admin/scholarship-access/search", methods: ["GET"], roles: SCHOLARSHIP_ACCESS_MANAGE, section: "scholarship-team" },

  { route: "api/admin/resource-submissions", methods: ["GET"], roles: OWNER_ADMIN, section: "resource-submissions" },
  { route: "api/admin/resource-submissions/[id]", methods: ["PATCH"], roles: OWNER_ADMIN, section: "resource-submissions" },

  { route: "api/admin/scholarships/** (authorizeScholarshipAdmin)", methods: ["*"], roles: SCHOLARSHIP_CMS, section: "scholarships" },

  { route: "api/admin/resource-cms", methods: ["GET"], roles: RESOURCE_CMS, section: "resource-cms" },
  { route: "api/admin/resource-cms/[slug]", methods: ["GET", "PUT", "PATCH"], roles: RESOURCE_CMS, section: "resource-cms" },
  { route: "api/admin/resource-cms/[slug]/publish", methods: ["POST"], roles: RESOURCE_CMS, section: "resource-cms" },
  { route: "api/admin/resource-cms/[slug]/restore", methods: ["POST"], roles: RESOURCE_CMS, section: "resource-cms" },
  { route: "api/admin/resource-cms/history", methods: ["GET"], roles: RESOURCE_CMS, section: "resource-cms" },
  { route: "api/admin/resource-cms/history/[id]", methods: ["GET"], roles: RESOURCE_CMS, section: "resource-cms" },
  { route: "api/admin/resource-cms/homepage", methods: ["GET", "PUT"], roles: RESOURCE_CMS, section: "resource-cms" },
  { route: "api/admin/resource-cms/upload-thumbnail", methods: ["POST"], roles: RESOURCE_CMS, section: "resource-cms" },

  { route: "app/(admin)/admin/certificates/actions.ts", methods: ["create", "update", "delete"], roles: OWNER_ADMIN, section: "certificates" },
  { route: "api/certificates", methods: ["POST", "DELETE"], roles: OWNER_ADMIN, section: "certificates" },
  { route: "api/upload-certificate", methods: ["POST"], roles: OWNER_ADMIN, section: "certificates" },

  { route: "api/admin/team", methods: ["GET", "POST", "PATCH", "DELETE"], roles: OWNER_ADMIN, section: "team" },
  { route: "api/admin/team/upload-photo", methods: ["POST"], roles: OWNER_ADMIN, section: "team" },
  { route: "api/team", methods: ["POST", "DELETE"], roles: OWNER_ADMIN, section: "team" },
  { route: "api/team/[id]", methods: ["PUT"], roles: OWNER_ADMIN, section: "team" },

  { route: "api/admin/legal", methods: ["GET"], roles: OWNER_ADMIN, section: "legal" },
  { route: "api/admin/legal/[...slug]", methods: ["GET", "POST", "PATCH"], roles: OWNER_ADMIN, section: "legal" },

  { route: "api/admin/scheduling", methods: ["GET"], roles: SCHEDULING_READ, section: "scheduling" },
  { route: "api/admin/scheduling", methods: ["POST", "PATCH", "DELETE"], roles: SCHEDULING_WRITE, section: "scheduling" },

  { route: "app/(admin)/admin/qotd/actions.ts", methods: ["getModOrder", "saveModOrder"], roles: QOTD, section: "qotd" },
];
