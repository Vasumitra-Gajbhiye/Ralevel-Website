import { diffAccessMaps } from "@/lib/admin-access/diff";
import { applyChanges, toOverrides } from "@/lib/admin-access/resolve";
import { PAGE_ACCESS_ROLES, getAdminSection } from "@/lib/admin-access/sections";
import {
  invalidateAdminAccessCache,
  readAdminAccessStateFresh,
} from "@/lib/admin-access/server";
import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import { getPermissionsPageData } from "@/lib/data/admin/permissions";
import connectDB from "@/lib/mongodb";
import { permissionsUpdateSchema } from "@/lib/validation/permissions";
import { firstIssue } from "@/lib/validation/scholarships";
import AdminPageAccess from "@/models/adminPageAccess";
import AdminPageAccessChange from "@/models/adminPageAccessChange";
import { NextResponse } from "next/server";

/* ================= GET ================= */
export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    section: "permissions",
    rateLimit: { routeKey: "admin-permissions-read" },
  });
  if (auth instanceof Response) return auth;

  return NextResponse.json(await getPermissionsPageData());
}

function isDuplicateKeyError(error: unknown) {
  return (error as { code?: number } | null)?.code === 11000;
}

async function conflict() {
  return NextResponse.json(
    {
      error: "Someone else saved page access first.",
      latest: await getPermissionsPageData(),
    },
    { status: 409 },
  );
}

/* ================= PUT ================= */
export async function PUT(req: Request) {
  const auth = await authorizeAdminApi(req, {
    section: "permissions",
    rateLimit: { routeKey: "admin-permissions-save", limit: 30 },
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  const parsed = permissionsUpdateSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  const { baseVersion, changes, note } = parsed.data;

  for (const change of changes) {
    const section = getAdminSection(change.section);
    if (section.lock) {
      return NextResponse.json(
        { error: `${section.label} can't be changed.` },
        { status: 400 },
      );
    }
    if (change.role === "owner" || !PAGE_ACCESS_ROLES.includes(change.role)) {
      return NextResponse.json(
        { error: "That role's page access can't be changed." },
        { status: 400 },
      );
    }
  }

  await connectDB();
  // The version check below relies on the unique index on `key`.
  await AdminPageAccess.init();

  const current = await readAdminAccessStateFresh();
  if (current.version !== baseVersion) return conflict();

  const next = applyChanges(current.map, changes);
  const applied = diffAccessMaps(current.map, next);
  if (applied.length === 0) {
    return NextResponse.json({ data: await getPermissionsPageData(), applied });
  }

  const actor = {
    userId: auth.userId,
    email: auth.user.email,
    name: auth.user.name ?? undefined,
  };

  try {
    // A stale version misses the filter, so the upsert collides with the
    // existing document's unique key instead of overwriting it.
    await AdminPageAccess.updateOne(
      { key: "default", version: current.version },
      { $set: { sections: toOverrides(next), updatedBy: actor }, $inc: { version: 1 } },
      { upsert: true },
    );
  } catch (error) {
    if (isDuplicateKeyError(error)) return conflict();
    throw error;
  } finally {
    invalidateAdminAccessCache();
  }

  try {
    await AdminPageAccessChange.create({
      actor,
      changes: applied,
      note: note || undefined,
      fromVersion: current.version,
      toVersion: current.version + 1,
    });
  } catch (error) {
    // History is best-effort; the access change itself is already saved.
    console.error("[admin-access] Failed to record page access history", error);
  }

  return NextResponse.json({ data: await getPermissionsPageData(), applied });
}
