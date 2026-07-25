import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { applyStaffIdentity } from "@/lib/admin/staffIdentity";
import { enforceSameOrigin } from "@/lib/csrf";
import { getAdminAccessList } from "@/lib/data/admin/access";
import connectDB from "@/lib/mongodb";
import { parsePaginationParams } from "@/lib/pagination";
import { invalidateUserCache } from "@/lib/redis-cache";
import {
  Role,
  hasDisallowedRoleGrant,
  highestAuthorityRole,
  mergePreservedStaffRoles,
  sanitizeAccessPageRoles,
} from "@/lib/roles";
import { applySuperAdminRoles, isSuperAdminEmail } from "@/lib/superAdmin";
import {
  findClerkUserIdByEmail,
  syncClerkUserMetadata,
} from "@/lib/syncClerkUserMetadata";
import UserData from "@/models/userData";
import { NextResponse } from "next/server";

/* ================= GET ================= */
export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin"],
    rateLimit: { routeKey: "admin-access-list" },
  });
  if (auth instanceof Response) return auth;

  const { page, limit, skip } = parsePaginationParams(
    new URL(req.url).searchParams,
  );

  const result = await getAdminAccessList({ page, limit, skip });

  return NextResponse.json(result);
}

/* ================= POST / PATCH ================= */
export async function POST(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin"],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const actorEmail = auth.user?.email;
  const actorIsSuperAdmin = isSuperAdminEmail(actorEmail);
  const actorRoles = applySuperAdminRoles(
    actorEmail ?? "",
    auth.userData.roles as Role[],
  );
  const actorHighest = highestAuthorityRole(actorRoles);

  const { email, roles, nickname, discordUserId } = (await req.json()) as {
    email?: string;
    roles?: Role[];
    nickname?: unknown;
    discordUserId?: unknown;
  };

  const sanitizedRoles = sanitizeAccessPageRoles(roles ?? []);

  if (!email || sanitizedRoles.length === 0) {
    return new Response("Invalid payload", { status: 400 });
  }

  if (isSuperAdminEmail(email)) {
    return new Response("Super admin cannot be modified", { status: 403 });
  }

  if (!actorIsSuperAdmin && email === actorEmail) {
    return new Response("You cannot modify your own roles", { status: 403 });
  }

  const target = await UserData.findOne({ email });
  if (!target) return new Response("User not found", { status: 404 });

  if (!actorIsSuperAdmin && target.roles?.includes("owner")) {
    return new Response("Owner cannot be modified", { status: 403 });
  }

  const currentRoles = (target.roles ?? []) as Role[];

  if (
    !actorIsSuperAdmin &&
    hasDisallowedRoleGrant(actorHighest, currentRoles, sanitizedRoles)
  ) {
    return new Response(
      "You cannot assign a role equal to or higher than your own",
      { status: 403 },
    );
  }

  target.roles = mergePreservedStaffRoles(currentRoles, sanitizedRoles);

  try {
    await applyStaffIdentity(target, { nickname, discordUserId }, email);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Invalid staff identity";
    return new Response(message, { status: 400 });
  }

  await target.save();

  const clerkUserId = await findClerkUserIdByEmail(email);
  if (clerkUserId) {
    await syncClerkUserMetadata(clerkUserId, {
      roles: target.roles as Role[],
      userDataId: target._id.toString(),
    });
  }

  await invalidateUserCache(email);

  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  return POST(req);
}

/* ================= DELETE ================= */
export async function DELETE(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin"],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const actorEmail = auth.user?.email;
  const actorIsSuperAdmin = isSuperAdminEmail(actorEmail);

  const { email } = (await req.json()) as { email?: string };

  if (!email) {
    return new Response("Invalid payload", { status: 400 });
  }

  if (isSuperAdminEmail(email)) {
    return new Response("Super admin cannot be removed", { status: 403 });
  }

  if (!actorIsSuperAdmin && email === actorEmail) {
    return new Response("You cannot remove your own access", { status: 403 });
  }

  const target = await UserData.findOne({ email });
  if (!target) return new Response("User not found", { status: 404 });

  if (!actorIsSuperAdmin && target.roles?.includes("owner")) {
    return new Response("Owner cannot be removed", { status: 403 });
  }

  const currentRoles = (target.roles ?? []) as Role[];
  const isFormerStaffOnly =
    currentRoles.length === 1 && currentRoles[0] === "former_staff";

  target.roles = isFormerStaffOnly ? [] : (["former_staff"] as Role[]);
  await target.save();

  const clerkUserId = await findClerkUserIdByEmail(email);
  if (clerkUserId) {
    await syncClerkUserMetadata(clerkUserId, {
      roles: target.roles as Role[],
      userDataId: target._id.toString(),
    });
  }

  await invalidateUserCache(email);

  return NextResponse.json({ success: true });
}
