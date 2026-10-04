import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import { getTeamAccessList } from "@/lib/data/admin/team-access";
import connectDB from "@/lib/mongodb";
import { parsePaginationParams } from "@/lib/pagination";
import { invalidateUserCache } from "@/lib/redis-cache";
import { isAdmin, type Role } from "@/lib/roles";
import {
  findClerkUserIdByEmail,
  syncClerkUserMetadata,
} from "@/lib/syncClerkUserMetadata";
import UserData from "@/models/userData";
import { NextResponse } from "next/server";

export type TeamAccessConfig<R extends Role> = {
  /** e.g. "resource" — used for rate-limit keys. */
  key: string;
  teamRoles: readonly R[];
  depHeadRole: R;
  manageRoles: readonly Role[];
  depHeadLabel: string;
  mergeRole: (roles: Role[], role: R) => Role[];
  stripRoles: (roles: Role[]) => Role[];
};

async function syncRoles(email: string, target: { _id: { toString(): string }; roles: Role[] }) {
  const clerkUserId = await findClerkUserIdByEmail(email);
  if (clerkUserId) {
    await syncClerkUserMetadata(clerkUserId, {
      roles: target.roles,
      userDataId: target._id.toString(),
    });
  }
  await invalidateUserCache(email);
}

/**
 * Route handlers for a department's "grant/revoke team role" page.
 * Only owner/admin may grant or revoke the department-head role.
 */
export function createTeamAccessHandlers<R extends Role>(config: TeamAccessConfig<R>) {
  const isTeamRole = (role: string): role is R =>
    (config.teamRoles as readonly string[]).includes(role);

  async function GET(req: Request) {
    const auth = await authorizeAdminApi(req, {
      roles: [...config.manageRoles],
      rateLimit: { routeKey: `admin-${config.key}-access-list` },
    });
    if (auth instanceof Response) return auth;

    const pagination = parsePaginationParams(new URL(req.url).searchParams);
    return NextResponse.json(await getTeamAccessList(config.teamRoles, pagination));
  }

  async function POST(req: Request) {
    const auth = await authorizeAdminApi(req, { roles: [...config.manageRoles] });
    if (auth instanceof Response) return auth;

    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;

    await connectDB();
    const actorIsAdmin = isAdmin(auth.userData.roles);
    const { email, role } = (await req.json()) as { email?: string; role?: string };

    if (!email || !role || !isTeamRole(role)) {
      return new Response("Invalid payload", { status: 400 });
    }
    if (!actorIsAdmin && role === config.depHeadRole) {
      return new Response(`Only owner or admin can assign ${config.depHeadLabel}`, {
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

    target.roles = config.mergeRole((target.roles ?? []) as Role[], role);
    await target.save();
    await syncRoles(email, target);

    return NextResponse.json({ success: true });
  }

  async function DELETE(req: Request) {
    const auth = await authorizeAdminApi(req, { roles: [...config.manageRoles] });
    if (auth instanceof Response) return auth;

    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;

    await connectDB();
    const actorIsAdmin = isAdmin(auth.userData.roles);
    const { email } = (await req.json()) as { email?: string };

    if (!email) return new Response("Invalid payload", { status: 400 });
    if (email === auth.user?.email) {
      return new Response("You cannot remove your own access", { status: 403 });
    }

    const target = await UserData.findOne({ email });
    if (!target) return new Response("User not found", { status: 404 });
    if (target.roles?.includes("owner")) {
      return new Response("Owner cannot be removed", { status: 403 });
    }

    const currentRoles = (target.roles ?? []) as Role[];
    if (!actorIsAdmin && currentRoles.includes(config.depHeadRole)) {
      return new Response(`Only owner or admin can revoke ${config.depHeadLabel} access`, {
        status: 403,
      });
    }

    target.roles = config.stripRoles(currentRoles);
    await target.save();
    await syncRoles(email, target);

    return NextResponse.json({ success: true });
  }

  async function SEARCH(req: Request) {
    const auth = await authorizeAdminApi(req, {
      roles: [...config.manageRoles],
      rateLimit: { routeKey: `admin-${config.key}-access-search` },
    });
    if (auth instanceof Response) return auth;

    await connectDB();
    const q = new URL(req.url).searchParams.get("q")?.trim();
    if (!q || q.length < 2) return NextResponse.json([]);

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const users = await UserData.find({ email: { $regex: `^${escaped}`, $options: "i" } })
      .limit(5)
      .select("email name")
      .lean();

    return NextResponse.json(users);
  }

  return { GET, POST, PATCH: POST, DELETE, SEARCH };
}
