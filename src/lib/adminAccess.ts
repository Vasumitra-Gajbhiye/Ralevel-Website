import {
  RESOURCE_ACCESS_MANAGE_ROLES,
  RESOURCE_CMS_ROLES,
  WRITER_ACCESS_MANAGE_ROLES,
  WRITER_CMS_ROLES,
  type Role,
} from "./roles";

type AdminSectionRule = {
  prefix: string;
  roles: readonly Role[];
  message: string;
};

const ADMIN_SECTION_RULES: AdminSectionRule[] = [
  {
    prefix: "/admin/access",
    roles: ["owner", "admin"],
    message: "You don't have permission to access Control records.",
  },
  {
    prefix: "/admin/all-blogs",
    roles: ["owner", "admin"],
    message: "You don't have permission to view all blogs.",
  },
  {
    prefix: "/admin/blogs",
    roles: WRITER_CMS_ROLES,
    message: "You don't have permission to access Blog records.",
  },
  {
    prefix: "/admin/certificates",
    roles: ["owner", "admin"],
    message: "You don't have permission to access Graphic records.",
  },
  {
    prefix: "/admin/forms",
    roles: [
      "owner",
      "admin",
      "mod_dep_head",
      "helper_dep_head",
      "graphic_dep_head",
      "info_dep_head",
    ],
    message: "You don't have permission to access Graphic records.",
  },
  {
    prefix: "/admin/graphic",
    roles: ["owner", "admin", "graphic_dep_head"],
    message: "You don't have permission to access Graphic records.",
  },
  {
    prefix: "/admin/helper",
    roles: ["owner", "admin", "helper_dep_head"],
    message: "You don't have permission to access Helper records.",
  },
  {
    prefix: "/admin/info",
    roles: ["owner", "admin", "info_dep_head"],
    message: "You don't have permission to access Informative Team records.",
  },
  {
    prefix: "/admin/qotd",
    roles: ["owner", "admin", "mod_dep_head"],
    message: "You don't have permission to access Informative Team records.",
  },
  {
    prefix: "/admin/scheduling",
    roles: ["owner", "admin", "informative_team", "info_dep_head"],
    message: "You don't have permission to access Scheduling records.",
  },
  {
    prefix: "/admin/team",
    roles: ["owner", "admin", "mod_dep_head"],
    message: "You don't have permission to access Staff records.",
  },
  {
    prefix: "/admin/resource-cms",
    roles: RESOURCE_CMS_ROLES,
    message: "You don't have permission to access Resource CMS.",
  },
  {
    prefix: "/admin/resource",
    roles: RESOURCE_ACCESS_MANAGE_ROLES,
    message: "You don't have permission to manage Resource access.",
  },
  {
    prefix: "/admin/writers",
    roles: WRITER_ACCESS_MANAGE_ROLES,
    message: "You don't have permission to manage Writer access.",
  },
];

export function getAdminSectionRule(
  pathname: string
): AdminSectionRule | null {
  const normalized =
    pathname.endsWith("/") && pathname.length > 1
      ? pathname.slice(0, -1)
      : pathname;

  if (normalized === "/admin") {
    return null;
  }

  return (
    ADMIN_SECTION_RULES.find((rule) => normalized.startsWith(rule.prefix)) ??
    null
  );
}

export function getAdminSectionRoles(pathname: string): readonly Role[] | null {
  return getAdminSectionRule(pathname)?.roles ?? null;
}

export function getAdminSectionMessage(pathname: string): string | null {
  return getAdminSectionRule(pathname)?.message ?? null;
}
