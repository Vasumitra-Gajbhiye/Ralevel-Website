import "server-only";

import type { RoleCombo } from "@/lib/admin-access/diff";
import type { AccessChange, AccessOverrides } from "@/lib/admin-access/resolve";
import type { AdminSectionKey } from "@/lib/admin-access/sections";
import { readAdminAccessStateFresh } from "@/lib/admin-access/server";
import connectDB from "@/lib/mongodb";
import { roleRank, sanitizeRoles, type Role } from "@/lib/roles";
import { SUPER_ADMIN_EMAIL, applySuperAdminRoles } from "@/lib/superAdmin";
import AdminPageAccessChange from "@/models/adminPageAccessChange";
import UserData from "@/models/userData";
import mongoose from "mongoose";

export type ChangeActor = { name: string | null; email: string | null };
export type ChangeStamp = { at: string; by: ChangeActor };

export type PermissionsPageData = {
  overrides: AccessOverrides;
  version: number;
  updatedAt: string | null;
  updatedBy: ChangeActor | null;
  /** Distinct sets of roles people hold, with how many people hold each. */
  roleCombos: RoleCombo[];
  /** When each role and each page last appeared in a saved change. */
  lastChange: {
    byRole: Partial<Record<Role, ChangeStamp>>;
    bySection: Partial<Record<AdminSectionKey, ChangeStamp>>;
  };
};

export type PermissionHistoryEntry = {
  id: string;
  at: string;
  actor: ChangeActor;
  changes: AccessChange[];
  note: string | null;
};

type ActorDoc = { name?: string; email?: string } | null | undefined;

const toActor = (actor: ActorDoc): ChangeActor => ({
  name: actor?.name || null,
  email: actor?.email || null,
});

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function getRoleCombos(): Promise<RoleCombo[]> {
  const users = await UserData.find(
    {
      $or: [
        { "roles.0": { $exists: true } },
        { email: new RegExp(`^${escapeRegex(SUPER_ADMIN_EMAIL)}$`, "i") },
      ],
    },
    { roles: 1, email: 1 },
  ).lean<{ roles?: unknown; email?: string }[]>();

  const counts = new Map<string, RoleCombo>();
  for (const user of users) {
    const roles = applySuperAdminRoles(user.email ?? "", sanitizeRoles(user.roles))
      .filter((role, index, all) => all.indexOf(role) === index)
      .sort((a, b) => roleRank(a) - roleRank(b));
    if (roles.length === 0) continue;
    const key = roles.join(",");
    const combo = counts.get(key);
    if (combo) combo.count += 1;
    else counts.set(key, { roles, count: 1 });
  }
  return [...counts.values()];
}

type LastChangeRow = { _id: string; at: Date; actor: ActorDoc };

async function getLastChanges(): Promise<PermissionsPageData["lastChange"]> {
  const groupBy = (field: string) => [
    { $group: { _id: `$changes.${field}`, at: { $first: "$createdAt" }, actor: { $first: "$actor" } } },
  ];
  const [result] = await AdminPageAccessChange.aggregate<{
    byRole: LastChangeRow[];
    bySection: LastChangeRow[];
  }>([
    { $sort: { createdAt: -1 } },
    { $limit: 1000 },
    { $unwind: "$changes" },
    { $facet: { byRole: groupBy("role"), bySection: groupBy("section") } },
  ]);

  const toMap = (rows: LastChangeRow[] = []) =>
    Object.fromEntries(
      rows.map((row) => [row._id, { at: new Date(row.at).toISOString(), by: toActor(row.actor) }]),
    );

  return { byRole: toMap(result?.byRole), bySection: toMap(result?.bySection) };
}

/** Everything the Page access editor needs, read fresh (no cache). */
export async function getPermissionsPageData(): Promise<PermissionsPageData> {
  await connectDB();
  const [state, roleCombos, lastChange] = await Promise.all([
    readAdminAccessStateFresh(),
    getRoleCombos(),
    getLastChanges(),
  ]);

  return {
    overrides: state.overrides,
    version: state.version,
    updatedAt: state.updatedAt,
    updatedBy: state.updatedBy ? toActor(state.updatedBy) : null,
    roleCombos,
    lastChange,
  };
}

export async function getPermissionHistory(query: {
  before?: string;
  limit: number;
  role?: Role;
  section?: AdminSectionKey;
}): Promise<{ entries: PermissionHistoryEntry[]; nextCursor: string | null }> {
  await connectDB();

  const filter: Record<string, unknown> = {};
  if (query.before) filter._id = { $lt: new mongoose.Types.ObjectId(query.before) };
  if (query.role || query.section) {
    filter.changes = {
      $elemMatch: {
        ...(query.role ? { role: query.role } : {}),
        ...(query.section ? { section: query.section } : {}),
      },
    };
  }

  const rows = await AdminPageAccessChange.find(filter)
    .sort({ _id: -1 })
    .limit(query.limit + 1)
    .lean<
      {
        _id: mongoose.Types.ObjectId;
        createdAt: Date;
        actor?: ActorDoc;
        changes?: AccessChange[];
        note?: string;
      }[]
    >();

  const page = rows.slice(0, query.limit);
  return {
    entries: page.map((row) => ({
      id: row._id.toString(),
      at: new Date(row.createdAt).toISOString(),
      actor: toActor(row.actor),
      changes: (row.changes ?? []).map(({ section, role, granted }) => ({ section, role, granted })),
      note: row.note || null,
    })),
    nextCursor: rows.length > query.limit ? page[page.length - 1]._id.toString() : null,
  };
}
