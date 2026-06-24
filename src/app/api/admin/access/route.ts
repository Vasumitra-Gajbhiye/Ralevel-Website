import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { applyStaffIdentity } from "@/lib/admin/staffIdentity";
import { enforceSameOrigin } from "@/lib/csrf";
import { getAdminAccessList } from "@/lib/data/admin/access";
import connectDB from "@/lib/mongodb";
import { parsePaginationParams } from "@/lib/pagination";
import { invalidateUserCache } from "@/lib/redis-cache";
import { Role, highestAuthorityRole, roleRank } from "@/lib/roles";
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

  const actorRoles = auth.userData.roles;
  const actorHighest = highestAuthorityRole(actorRoles);

  const { email, roles, nickname, discordUserId } = (await req.json()) as {
    email?: string;
    roles?: Role[];
    nickname?: unknown;
    discordUserId?: unknown;
  };

  if (!email || !Array.isArray(roles) || roles.length === 0) {
    return new Response("Invalid payload", { status: 400 });
  }

  if (highestAuthorityRole(roles) === "owner") {
    return new Response("Owner role cannot be assigned", { status: 403 });
  }

  if (email === auth.user?.email) {
    return new Response("You cannot modify your own roles", { status: 403 });
  }

  const target = await UserData.findOne({ email });
  if (!target) return new Response("User not found", { status: 404 });

  if (target.roles?.includes("owner")) {
    return new Response("Owner cannot be modified", { status: 403 });
  }

  const highestIncoming = highestAuthorityRole(roles);
  if (roleRank(highestIncoming) <= roleRank(actorHighest)) {
    return new Response(
      "You cannot assign a role equal to or higher than your own",
      { status: 403 },
    );
  }

  target.roles = roles;

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
      roles,
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

  target.roles = [];
  await target.save();

  const clerkUserId = await findClerkUserIdByEmail(email);
  if (clerkUserId) {
    await syncClerkUserMetadata(clerkUserId, {
      roles: [],
      userDataId: target._id.toString(),
    });
  }

  await invalidateUserCache(email);

  return NextResponse.json({ success: true });
}
