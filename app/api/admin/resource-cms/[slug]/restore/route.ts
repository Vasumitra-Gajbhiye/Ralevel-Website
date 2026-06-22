import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import { restoreResourceCMSRevision } from "@/lib/data/admin/resource-cms-revisions";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin"],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  const { slug } = await context.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const revisionId =
    typeof body === "object" &&
    body !== null &&
    "revisionId" in body &&
    typeof (body as { revisionId: unknown }).revisionId === "string"
      ? (body as { revisionId: string }).revisionId
      : null;

  if (!revisionId) {
    return NextResponse.json(
      { error: "revisionId is required" },
      { status: 400 }
    );
  }

  const message =
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof (body as { message: unknown }).message === "string"
      ? (body as { message: string }).message.trim()
      : undefined;

  const result = await restoreResourceCMSRevision({
    slug,
    revisionId,
    actor: {
      userId: auth.userData.id,
      email: auth.user.email,
    },
    message,
  });

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
