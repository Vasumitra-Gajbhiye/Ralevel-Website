import { ROLES, STAFF_ROLES, type Role } from "@/lib/roles";

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  senior_mod: "Senior Moderator",
  junior_mod: "Junior Moderator",
  trial_mod: "Trial Moderator",
  graphic_designer: "Graphic Designer",
  writer_dep_head: "Writer Dep. Head",
  senior_writer: "Senior Writer",
  writer: "Writer",
  bot_dev: "Bot Developer",
  former_staff: "Former Staff",
  informative_team: "Community Team",
  helper: "Helper",
  mod_dep_head: "MOD Dep. Head",
  helper_dep_head: "HLP Dep. Head",
  graphic_dep_head: "GFX Dep. Head",
  info_dep_head: "COMM Dep. Head",
  reddit_dep_head: "RD Dep. Head",
  resource_dep_head: "Resource Dep. Head",
  resource_staff: "Resource Staff",
  scholarship_dep_head: "Scholarship Dep. Head",
  scholarship_staff: "Scholarship Staff",
};

const LEADERSHIP_ROLES: readonly Role[] = ["owner", "admin"];
const isDepHead = (role: Role) => role.endsWith("_dep_head");

/** Staff roles grouped for pickers, each group in authority order. */
export const ROLE_UI_GROUPS: readonly { label: string; roles: Role[] }[] = [
  {
    label: "Leadership",
    roles: ROLES.filter((role) => LEADERSHIP_ROLES.includes(role)),
  },
  { label: "Department heads", roles: STAFF_ROLES.filter(isDepHead) },
  {
    label: "Teams & staff",
    roles: STAFF_ROLES.filter(
      (role) => !LEADERSHIP_ROLES.includes(role) && !isDepHead(role),
    ),
  },
];
