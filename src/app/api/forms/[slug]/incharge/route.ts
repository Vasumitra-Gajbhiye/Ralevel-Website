import { enforceSameOrigin } from "@/lib/csrf";
import { normalizeInchargeNicknames } from "@/lib/forms/incharge";
import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import { canManageFormType, type Role } from "@/lib/roles";
import Form from "@/models/Form";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getAuthSession();
  const roles = session?.userData?.roles as Role[] | undefined;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  const { slug } = await params;

  let body: { nicknames?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let nicknames: string[];
  try {
    nicknames = await normalizeInchargeNicknames(body.nicknames);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Invalid incharge nicknames";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  await connectDB();

  const form = await Form.findOne({ slug });
  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  if (!canManageFormType(roles, form.formType)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  form.inchargeNicknames = nicknames;
  await form.save();

  return NextResponse.json({ success: true, nicknames });
}
