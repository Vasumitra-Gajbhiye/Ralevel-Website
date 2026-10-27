import "server-only";

import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import type { Role } from "@/lib/roles";
import AdminPageAccess from "@/models/adminPageAccess";
import type { AuthSession } from "@/types/auth";
import { cache } from "react";
import {
  canEnterAdmin,
  hasSectionAccess,
  resolveAccessMap,
  sectionsForRoles,
  toOverrides,
  type AccessMap,
  type AccessOverrides,
} from "./resolve";
import { ADMIN_SECTIONS, type AdminSectionKey } from "./sections";

export type AdminAccessState = {
  map: AccessMap;
  overrides: AccessOverrides;
  version: number;
  updatedAt: string | null;
  updatedBy: { userId?: string; email?: string; name?: string } | null;
};

type StoredDoc = {
  sections?: unknown;
  version?: number;
  updatedAt?: Date;
  updatedBy?: AdminAccessState["updatedBy"];
};

// Every instance re-reads the document at most this often. A save on this
// instance invalidates immediately; other instances catch up within the TTL.
const MEMO_TTL_MS = 10_000;
// After a failed read, keep serving the last good copy for a moment.
const FAILURE_RETRY_MS = 2_000;

type Memo = {
  good?: { state: AdminAccessState; expiresAt: number };
  retryAt?: number;
  inflight?: Promise<AdminAccessState>;
};

const globalForAccess = globalThis as typeof globalThis & {
  __adminPageAccessMemo?: Memo;
};
const memo: Memo = (globalForAccess.__adminPageAccessMemo ??= {});

function toState(doc: StoredDoc | null): AdminAccessState {
  const map = resolveAccessMap(doc?.sections);
  return {
    map,
    overrides: toOverrides(map),
    version: doc?.version ?? 0,
    updatedAt: doc?.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
    updatedBy: doc?.updatedBy ?? null,
  };
}

/**
 * Used when the document can't be read and there's no earlier copy: editable
 * pages fall back to owners and admins only; locked pages keep their defaults.
 */
function failClosedState(): AdminAccessState {
  const ownersOnly: Record<string, Role[]> = {};
  for (const section of ADMIN_SECTIONS) {
    if (!section.lock) ownersOnly[section.key] = ["owner", "admin"];
  }
  const map = resolveAccessMap(ownersOnly);
  return {
    map,
    overrides: toOverrides(map),
    version: -1,
    updatedAt: null,
    updatedBy: null,
  };
}

/** Reads the document, bypassing the memo (for saves and conflict checks). */
export async function readAdminAccessStateFresh(): Promise<AdminAccessState> {
  await connectDB();
  const doc = await AdminPageAccess.findOne({ key: "default" }).lean<StoredDoc>();
  const state = toState(doc);
  memo.good = { state, expiresAt: Date.now() + MEMO_TTL_MS };
  memo.retryAt = undefined;
  return state;
}

async function loadAdminAccessState(): Promise<AdminAccessState> {
  const now = Date.now();
  if (memo.good && memo.good.expiresAt > now) return memo.good.state;
  if (memo.retryAt && memo.retryAt > now) {
    return memo.good?.state ?? failClosedState();
  }

  memo.inflight ??= readAdminAccessStateFresh().finally(() => {
    memo.inflight = undefined;
  });

  try {
    return await memo.inflight;
  } catch (error) {
    console.error("[admin-access] Failed to load page access", error);
    memo.retryAt = Date.now() + FAILURE_RETRY_MS;
    return memo.good?.state ?? failClosedState();
  }
}

/** Page-access state for this request (memoized per request and per instance). */
export const getAdminAccessState = cache(loadAdminAccessState);

export async function getAdminAccessMap(): Promise<AccessMap> {
  return (await getAdminAccessState()).map;
}

/** Call after saving so this instance serves the new access right away. */
export function invalidateAdminAccessCache() {
  memo.good = undefined;
  memo.retryAt = undefined;
}

export async function canAccessSection(
  roles: readonly Role[] | undefined,
  keys: AdminSectionKey | readonly AdminSectionKey[],
): Promise<boolean> {
  return hasSectionAccess(await getAdminAccessMap(), roles, keys);
}

export async function getAccessibleSections(
  roles: readonly Role[] | undefined,
): Promise<AdminSectionKey[]> {
  return sectionsForRoles(await getAdminAccessMap(), roles);
}

/** True when the roles can open at least one admin page. */
export async function canEnterAdminPanel(
  roles: readonly Role[] | undefined,
): Promise<boolean> {
  return canEnterAdmin(await getAdminAccessMap(), roles);
}

/**
 * For server actions, which are public POST endpoints: returns the session or
 * throws "FORBIDDEN" (the same error requireRoles throws).
 */
export async function requireSectionAction(
  keys: AdminSectionKey | readonly AdminSectionKey[],
): Promise<AuthSession> {
  const session = await getAuthSession();
  if (!session || !(await canAccessSection(session.userData?.roles, keys))) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
