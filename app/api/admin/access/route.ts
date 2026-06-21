import { getAuthSession } from "@/lib/getAuthSession";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import { requireRoles } from "@/lib/requireRoles";
import { Role, highestAuthorityRole, roleRank } from "@/lib/roles";
import UserData from "@/models/userData";
import { NextResponse } from "next/server";

/* ================= GET ================= */
export async function GET() {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireRoles(session, ["owner", "admin"]);

    const users = await UserData.find({
      roles: { $exists: true, $not: { $size: 0 } },
    })
      .select("name email roles")
      .lean();

    users.sort((a, b) => {
      const aHighest = highestAuthorityRole(a.roles);
      const bHighest = highestAuthorityRole(b.roles);

      const diff = roleRank(aHighest) - roleRank(bHighest);
      return diff !== 0 ? diff : a.email.localeCompare(b.email);
    });

    return NextResponse.json(users);
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

    return NextResponse.json({ success: true });
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}
