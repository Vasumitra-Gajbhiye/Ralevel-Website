import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import { getResourceAccessList } from "@/lib/data/admin/resource-access";
import connectDB from "@/lib/mongodb";
import { parsePaginationParams } from "@/lib/pagination";
import { invalidateUserCache } from "@/lib/redis-cache";
import {
  isAdmin,
  mergeResourceTeamRole,
  RESOURCE_ACCESS_MANAGE_ROLES,
  RESOURCE_TEAM_ROLES,
  stripResourceTeamRoles,
  type ResourceTeamRole,
  type Role,
} from "@/lib/roles";
import {
  findClerkUserIdByEmail,
  syncClerkUserMetadata,
} from "@/lib/syncClerkUserMetadata";
import UserData from "@/models/userData";
import { NextResponse } from "next/server";

function isResourceTeamRole(role: string): role is ResourceTeamRole {
  return RESOURCE_TEAM_ROLES.includes(role as ResourceTeamRole);
}

/* ================= GET ================= */
export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...RESOURCE_ACCESS_MANAGE_ROLES],
    rateLimit: { routeKey: "admin-resource-access-list" },
  });
  if (auth instanceof Response) return auth;

  const { page, limit, skip } = parsePaginationParams(
    new URL(req.url).searchParams,
  );

  const result = await getResourceAccessList({ page, limit, skip });

  return NextResponse.json(result);
}

/* ================= POST / PATCH ================= */
export async function POST(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...RESOURCE_ACCESS_MANAGE_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const actorRoles = auth.userData.roles;
  const actorIsAdmin = isAdmin(actorRoles);

  const { email, role } = (await req.json()) as {
    email?: string;
    role?: string;
  };

  if (!email || !role || !isResourceTeamRole(role)) {
    return new Response("Invalid payload", { status: 400 });
  }

  if (!actorIsAdmin && role === "resource_dep_head") {
    return new Response("Only owner or admin can assign Resource Dep. Head", {
      status: 403,
    });
  }

  if (email === auth.user?.email) {
    return new Response("You cannot modify your own roles", { status: 403 });
  }

  const target = await UserData.findOne({ email });
  if (!target) return new Response("User not found", { status: 404 });

  if (target.roles?.includes("owner")) {
    return new Response("Owner cannot be modified", { status: 403 });
  }

  const currentRoles = (target.roles ?? []) as Role[];
  target.roles = mergeResourceTeamRole(currentRoles, role);
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
    roles: [...RESOURCE_ACCESS_MANAGE_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const actorRoles = auth.userData.roles;
  const actorIsAdmin = isAdmin(actorRoles);

  const { email } = (await req.json()) as { email?: string };

  if (!email) {
    return new Response("Invalid payload", { status: 400 });
  }

  if (email === auth.user?.email) {
    return new Response("You cannot remove your own access", { status: 403 });
  }

  const target = await UserData.findOne({ email });
  if (!target) return new Response("User not found", { status: 404 });

  if (target.roles?.includes("owner")) {
    return new Response("Owner cannot be removed", { status: 403 });
  }

  const currentRoles = (target.roles ?? []) as Role[];

  if (!actorIsAdmin && currentRoles.includes("resource_dep_head")) {
    return new Response(
      "Only owner or admin can revoke Resource Dep. Head access",
      { status: 403 },
    );
  }

  target.roles = stripResourceTeamRoles(currentRoles);
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
