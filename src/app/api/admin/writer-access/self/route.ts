import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import { invalidateUserCache } from "@/lib/redis-cache";
import {
  hasWriterTeamRole,
  isAdmin,
  mergeWriterTeamRole,
  type Role,
} from "@/lib/roles";
import {
  findClerkUserIdByEmail,
  syncClerkUserMetadata,
} from "@/lib/syncClerkUserMetadata";
import UserData from "@/models/userData";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin"],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  const actorRoles = auth.userData.roles;
  if (!isAdmin(actorRoles)) {
    return new Response("Forbidden", { status: 403 });
  }

  if (hasWriterTeamRole(actorRoles)) {
    return NextResponse.json(
      { error: "You already have writer access" },
      { status: 409 },
    );
  }

  const email = auth.user?.email;
  if (!email) {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectDB();

  const target = await UserData.findOne({ email });
  if (!target) {
    return new Response("User not found", { status: 404 });
  }

  const currentRoles = (target.roles ?? []) as Role[];
  target.roles = mergeWriterTeamRole(currentRoles, "writer");
  await target.save();

  const clerkUserId = await findClerkUserIdByEmail(email);
  if (clerkUserId) {
    await syncClerkUserMetadata(clerkUserId, {
      roles: target.roles as Role[],
      userDataId: target._id.toString(),
    });
  }

  await invalidateUserCache(email);

  return NextResponse.json({
    success: true,
    roles: target.roles,
  });
}
