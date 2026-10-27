// Registry of admin sections: which pages exist, how they appear in the
// sidebar, and which roles open them by default. Client-safe (no DB imports).
// Page access stored in Mongo overrides `defaultRoles`; see ./resolve.ts.

import {
  BLOG_REVIEW_ROLES,
  FORMS_ACCESS_ROLES,
  RESOURCE_ACCESS_MANAGE_ROLES,
  RESOURCE_CMS_ROLES,
  SCHOLARSHIP_ACCESS_MANAGE_ROLES,
  SCHOLARSHIP_CMS_ROLES,
  STAFF_ROLES,
  WRITER_ACCESS_MANAGE_ROLES,
  WRITER_CMS_ROLES,
  type Role,
} from "@/lib/roles";

export const ADMIN_AREAS = [
  { key: "content", label: "Content" },
  { key: "people", label: "People" },
  { key: "operations", label: "Operations" },
  { key: "site", label: "Site" },
  { key: "system", label: "System" },
] as const;

export type AdminArea = (typeof ADMIN_AREAS)[number]["key"];

export type AdminNavLink = { label: string; href: string };

export type AdminSectionLock =
  | { kind: "fixed"; note: string }
  | { kind: "team"; note: string; href: string; linkLabel: string };

type AdminSectionInput = {
  key: string;
  label: string;
  /** One plain-language line shown next to the toggle. */
  description: string;
  area: AdminArea;
  /** Path prefixes owned by this section, matched on segment boundaries. */
  prefixes: readonly string[];
  /** Sidebar links, in order. Empty when the page is reached another way. */
  nav: readonly AdminNavLink[];
  defaultRoles: readonly Role[];
  /** Locked sections always use their defaults and can't be edited. */
  lock?: AdminSectionLock;
  /** Only effective for roles that can also open this parent section. */
  requires?: string;
  /** Shown as a warning when granted to a role other than owner or admin. */
  risk?: string;
  /** Rules that still apply inside the page, enforced in code. */
  inPageRules?: readonly string[];
};

// Order is the sidebar order. A `requires` parent must come before its child.
const SECTION_LIST = [
  {
    key: "blogs",
    label: "Blogs",
    description: "Write and edit your own blog posts.",
    area: "content",
    prefixes: ["/admin/blogs"],
    nav: [{ label: "Blogs", href: "/admin/blogs/v2" }],
    defaultRoles: WRITER_CMS_ROLES,
    lock: {
      kind: "team",
      note: "Based on writer team membership. Owners and admins can always open it.",
      href: "/admin/writers",
      linkLabel: "Manage on Writers",
    },
  },
  {
    key: "all-blogs",
    label: "All Blogs",
    description: "Review, approve and reject every writer's posts.",
    area: "content",
    prefixes: ["/admin/all-blogs"],
    nav: [{ label: "All Blogs", href: "/admin/all-blogs" }],
    defaultRoles: BLOG_REVIEW_ROLES,
    risk: "can approve and publish any writer's post",
  },
  {
    key: "writers",
    label: "Writers",
    description: "Add and remove people on the writer team.",
    area: "people",
    prefixes: ["/admin/writers"],
    nav: [{ label: "Writers", href: "/admin/writers" }],
    defaultRoles: WRITER_ACCESS_MANAGE_ROLES,
    risk: "can add people to the writer team",
    inPageRules: ["Only owners and admins can make someone Writer Dep. Head."],
  },
  {
    key: "access",
    label: "Access",
    description: "Give staff roles to people.",
    area: "people",
    prefixes: ["/admin/access"],
    nav: [{ label: "Access", href: "/admin/access" }],
    defaultRoles: ["owner", "admin"],
    risk: "can change other people's staff roles",
    inPageRules: [
      "Nobody can give a role at or above their own rank.",
      "Apart from owners and admins, people can only edit staff ranked below them.",
    ],
  },
  {
    key: "resource-team",
    label: "Resource Dept.",
    description: "Add and remove people on the resource team.",
    area: "people",
    prefixes: ["/admin/resource"],
    nav: [{ label: "Resource Dept.", href: "/admin/resource" }],
    defaultRoles: RESOURCE_ACCESS_MANAGE_ROLES,
    risk: "can add people to the resource team",
    inPageRules: ["Only owners and admins can make someone Resource Dep. Head."],
  },
  {
    key: "forms",
    label: "Form submission",
    description: "Application forms and the responses to them.",
    area: "operations",
    prefixes: ["/admin/forms"],
    nav: [{ label: "Form submission", href: "/admin/forms" }],
    defaultRoles: FORMS_ACCESS_ROLES,
    inPageRules: [
      "Department heads can only create and manage their own department's forms.",
      "Owners and admins can manage every form.",
      "Form in-charges can vote on responses for their form.",
    ],
  },
  {
    key: "resource-submissions",
    label: "Resource submissions",
    description: "Review resources sent in through the website.",
    area: "operations",
    prefixes: ["/admin/forms/resource"],
    nav: [],
    defaultRoles: ["owner", "admin"],
  },
  {
    key: "certificates",
    label: "Certificates",
    description: "Issue and manage staff certificates.",
    area: "operations",
    prefixes: ["/admin/certificates"],
    nav: [{ label: "Certificates", href: "/admin/certificates" }],
    defaultRoles: ["owner", "admin"],
  },
  {
    key: "team",
    label: "Team",
    description: "Edit the public Team page.",
    area: "site",
    prefixes: ["/admin/team"],
    nav: [{ label: "Team", href: "/admin/team" }],
    defaultRoles: ["owner", "admin"],
  },
  {
    key: "legal",
    label: "Legal pages",
    description: "Edit the privacy policy, terms and other legal pages.",
    area: "site",
    prefixes: ["/admin/legal"],
    nav: [{ label: "Legal pages", href: "/admin/legal" }],
    defaultRoles: ["owner", "admin"],
  },
  {
    key: "apply",
    label: "Apply cards",
    description: "Edit the cards on the public Apply page.",
    area: "site",
    prefixes: ["/admin/apply"],
    nav: [{ label: "Apply cards", href: "/admin/apply" }],
    defaultRoles: ["owner", "admin"],
  },
  {
    key: "scheduling",
    label: "Scheduling",
    description: "Plan community events and announcements.",
    area: "operations",
    prefixes: ["/admin/scheduling"],
    nav: [{ label: "Scheduling", href: "/admin/scheduling" }],
    defaultRoles: ["owner", "admin", "informative_team", "info_dep_head"],
  },
  {
    key: "qotd",
    label: "Discord QOTD",
    description: "Set the moderator rotation for Question of the Day.",
    area: "operations",
    prefixes: ["/admin/qotd"],
    nav: [{ label: "Discord QOTD", href: "/admin/qotd" }],
    defaultRoles: ["owner", "admin", "mod_dep_head"],
  },
  {
    key: "scholarships",
    label: "Scholarships",
    description: "Manage scholarships, universities and submissions.",
    area: "content",
    prefixes: ["/admin/scholarships"],
    nav: [{ label: "Scholarships", href: "/admin/scholarships" }],
    defaultRoles: SCHOLARSHIP_CMS_ROLES,
  },
  {
    key: "scholarship-team",
    label: "Scholarship team",
    description: "Add and remove people on the scholarship team.",
    area: "people",
    prefixes: ["/admin/scholarships/team"],
    nav: [],
    defaultRoles: SCHOLARSHIP_ACCESS_MANAGE_ROLES,
    requires: "scholarships",
    risk: "can add people to the scholarship team",
    inPageRules: ["Only owners and admins can make someone Scholarship Dep. Head."],
  },
  {
    key: "resource-cms",
    label: "Resource CMS",
    description: "Edit resource pages and the resources homepage, and restore old versions.",
    area: "content",
    prefixes: ["/admin/resource-cms"],
    nav: [
      { label: "Resource CMS", href: "/admin/resource-cms" },
      { label: "CMS History", href: "/admin/resource-cms/history" },
    ],
    defaultRoles: RESOURCE_CMS_ROLES,
  },
  {
    key: "permissions",
    label: "Page access",
    description: "Choose which roles can open each admin page.",
    area: "system",
    prefixes: ["/admin/permissions"],
    nav: [{ label: "Page access", href: "/admin/permissions" }],
    defaultRoles: ["owner", "admin"],
    lock: { kind: "fixed", note: "Only owners and admins can change page access." },
  },
] as const satisfies readonly AdminSectionInput[];

export type AdminSectionKey = (typeof SECTION_LIST)[number]["key"];

export type AdminSectionDef = Omit<AdminSectionInput, "key" | "requires"> & {
  key: AdminSectionKey;
  requires?: AdminSectionKey;
};

export const ADMIN_SECTIONS: readonly AdminSectionDef[] = SECTION_LIST;

export const ADMIN_SECTION_KEYS: readonly AdminSectionKey[] = ADMIN_SECTIONS.map(
  (section) => section.key,
);

const SECTION_BY_KEY = new Map<string, AdminSectionDef>(
  ADMIN_SECTIONS.map((section) => [section.key, section]),
);

export function getAdminSection(key: AdminSectionKey): AdminSectionDef {
  return SECTION_BY_KEY.get(key)!;
}

export function isAdminSectionKey(value: unknown): value is AdminSectionKey {
  return typeof value === "string" && SECTION_BY_KEY.has(value);
}

/** Roles that can be given admin pages. Former staff never can. */
export const PAGE_ACCESS_ROLES: readonly Role[] = STAFF_ROLES;

/**
 * The section owning `pathname`: the longest matching prefix, on segment
 * boundaries (so /admin/resource doesn't match /admin/resource-cms).
 * Returns null for /admin itself and for unregistered paths.
 */
export function matchAdminSection(pathname: string): AdminSectionDef | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  let best: AdminSectionDef | null = null;
  let bestLength = 0;

  for (const section of ADMIN_SECTIONS) {
    for (const prefix of section.prefixes) {
      const matches = path === prefix || path.startsWith(`${prefix}/`);
      if (matches && prefix.length > bestLength) {
        best = section;
        bestLength = prefix.length;
      }
    }
  }

  return best;
}
