import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import {
  getWriterProfile,
  updateWriterProfile,
} from "@/lib/data/admin/writerProfile";
import { WRITER_CMS_ROLES } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...WRITER_CMS_ROLES],
    rateLimit: { routeKey: "admin-writer-profile-get" },
  });
  if (auth instanceof Response) return auth;

  const profile = await getWriterProfile(auth.userData.id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function PATCH(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...WRITER_CMS_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  const body = await req.json();
  const { name, bio, avatar } = body as {
    name?: string;
    bio?: string;
    avatar?: string;
  };

  const profile = await updateWriterProfile(auth.userData.id, {
    name,
    bio,
    avatar,
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}
