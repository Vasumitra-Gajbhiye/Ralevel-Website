import { enforceSameOrigin } from "@/lib/csrf";
import { normalizeDiscordPingUserIds } from "@/lib/discord/validatePingUserIds";
import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import Form from "@/models/Form";
import { NextResponse } from "next/server";

const FORMS_ADMIN_ROLES = [
  "owner",
  "admin",
  "mod_dep_head",
  "helper_dep_head",
  "graphic_dep_head",
  "info_dep_head",
] as const;

function canManageForms(roles: string[] | undefined): boolean {
  if (!roles) return false;
  return roles.some((role) =>
    (FORMS_ADMIN_ROLES as readonly string[]).includes(role),
  );
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getAuthSession();
  const roles = session?.userData?.roles as string[] | undefined;

  if (!canManageForms(roles)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  const { slug } = await params;

  let body: { userIds?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let userIds: string[];
  try {
    userIds = normalizeDiscordPingUserIds(body.userIds);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Invalid Discord user IDs";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  await connectDB();

  const form = await Form.findOne({ slug });
  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  form.discordPingUserIds = userIds;
  await form.save();

  return NextResponse.json({ success: true, userIds });
}
