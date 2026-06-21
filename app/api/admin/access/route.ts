import { getAuthSession } from "@/lib/getAuthSession";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import {
  buildPaginatedResponse,
  parsePaginationParams,
} from "@/lib/pagination";
import { requireRoles } from "@/lib/requireRoles";
import { Role, ROLES, highestAuthorityRole, roleRank } from "@/lib/roles";
import {
  findClerkUserIdByEmail,
  syncClerkUserMetadata,
} from "@/lib/syncClerkUserMetadata";
import UserData from "@/models/userData";
import { NextResponse } from "next/server";

function buildRoleRankSwitch() {
  return {
    $switch: {
      branches: ROLES.map((role, index) => ({
        case: { $in: [role, "$roles"] },
        then: index,
      })),
      default: ROLES.length,
    },
  };
}

/* ================= GET ================= */
export async function GET(req: Request) {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireRoles(session, ["owner", "admin"]);

    const { page, limit, skip } = parsePaginationParams(new URL(req.url).searchParams);

    const [result] = await UserData.aggregate([
      {
        $match: {
          roles: { $exists: true, $not: { $size: 0 } },
        },
      },
      {
        $addFields: {
          roleRank: buildRoleRankSwitch(),
        },
      },
      {
        $sort: {
          roleRank: 1,
          email: 1,
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                name: 1,
                email: 1,
                roles: 1,
              },
            },
          ],
        },
      },
    ]);

    const total = result.metadata[0]?.total ?? 0;
    const users = result.data;

    return NextResponse.json(buildPaginatedResponse(users, total, page, limit));
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}

/* ================= POST / PATCH ================= */
export async function POST(req: Request) {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireRoles(session, ["owner", "admin"]);

    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;

    const actorRoles = session!.userData!.roles;
    const actorHighest = highestAuthorityRole(actorRoles);

    const { email, roles } = (await req.json()) as {
      email?: string;
      roles?: Role[];
    };

    if (!email || !Array.isArray(roles) || roles.length === 0) {
      return new Response("Invalid payload", { status: 400 });
    }

    if (highestAuthorityRole(roles) === "owner") {
      return new Response("Owner role cannot be assigned", { status: 403 });
    }

    if (email === session?.user?.email) {
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
        { status: 403 }
      );
    }

    target.roles = roles;
    await target.save();

    const clerkUserId = await findClerkUserIdByEmail(email);
    if (clerkUserId) {
      await syncClerkUserMetadata(clerkUserId, {
        roles,
        userDataId: target._id.toString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}

export async function PATCH(req: Request) {
  return POST(req);
}

/* ================= DELETE ================= */
export async function DELETE(req: Request) {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireRoles(session, ["owner", "admin"]);

    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;

    const { email } = (await req.json()) as { email?: string };

    if (!email) {
      return new Response("Invalid payload", { status: 400 });
    }

    if (email === session?.user?.email) {
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

    return NextResponse.json({ success: true });
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}
