import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import {
  getWriterProfile,
  updateWriterProfile,
} from "@/lib/data/admin/writerProfile";
import { isAdmin, WRITER_CMS_ROLES } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const auth = await authorizeAdminApi(req, {
    roles: [...WRITER_CMS_ROLES],
    rateLimit: { routeKey: "admin-writer-profile-get-by-id" },
  });
  if (auth instanceof Response) return auth;

  const { userId } = await context.params;

  const profile = await getWriterProfile(userId);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const auth = await authorizeAdminApi(req, {
    roles: [...WRITER_CMS_ROLES],
  });
  if (auth instanceof Response) return auth;

  if (!isAdmin(auth.userData.roles)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  const { userId } = await context.params;
  const body = await req.json();
  const { name, bio, avatar } = body as {
    name?: string;
    bio?: string;
    avatar?: string;
  };

  const profile = await updateWriterProfile(userId, { name, bio, avatar });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}
