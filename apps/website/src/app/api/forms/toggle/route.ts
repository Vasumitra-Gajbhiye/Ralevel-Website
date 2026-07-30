import { enforceSameOrigin } from "@/lib/csrf";
import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import { canManageFormType, type Role } from "@/lib/roles";
import Form from "@/models/Form";
import FormIndex from "@/models/FormIndex";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await getAuthSession();
  const roles = session?.userData?.roles as Role[] | undefined;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.id || typeof body.id !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid form id" },
      { status: 400 },
    );
  }

  const form = await Form.findById(body.id);

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  if (!canManageFormType(roles, form.formType)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (form.status === "permanently-closed") {
    return NextResponse.json(
      { success: true, formStatus: form.status },
      { status: 201 },
    );
  }

  const formIndex = await FormIndex.findOne({ slug: form.formType });
  if (!formIndex) {
    return NextResponse.json(
      { error: "Form index not found" },
      { status: 404 },
    );
  }

  const newStatus = form.status === "open" ? "closed" : "open";
  form.status = newStatus;
  await form.save();

  // Listing CTA follows the active cycle only
  if (form.cycleId === formIndex.activeCycleId) {
    formIndex.status = newStatus === "open" ? "open" : "soon";
    await formIndex.save();
  }

  revalidatePath("/apply");
  revalidatePath(`/apply/${form.slug}`);
  if (form.formType === "resource") {
    revalidatePath("/apply/resource");
  }

  return NextResponse.json(
    { success: true, formStatus: form.status },
    { status: 201 },
  );
}
