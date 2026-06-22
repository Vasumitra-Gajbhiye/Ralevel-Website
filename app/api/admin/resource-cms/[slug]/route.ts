import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import {
  buildDraftFromLive,
  getAdminResourceEditorData,
  getResourceCMSDocSnapshot,
  isDraftEmpty,
  saveResourceCMSDraft,
  serializeDraft,
} from "@/lib/data/admin/resource-cms";
import connectDB from "@/lib/mongodb";
import {
  validateFullResourceCMSDraft,
  validateResourceCMSDraftPayload,
} from "@/lib/validation/resource-cms";
import type { ResourceDraft } from "@/types/resources2";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin"],
  });
  if (auth instanceof Response) return auth;

  const { slug } = await context.params;
  const data = await getAdminResourceEditorData(slug);

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin"],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const { slug } = await context.params;
  const doc = await getResourceCMSDocSnapshot(slug);

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let validated;
  try {
    validated = validateResourceCMSDraftPayload(body);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid payload" },
      { status: 400 }
    );
  }

  const existingDraft = isDraftEmpty(doc.draft)
    ? buildDraftFromLive(doc)
    : serializeDraft(doc.draft);

  const nextDraft: ResourceDraft = {
    syllabus: validated.syllabus ?? existingDraft.syllabus,
    notes: validated.notes ?? existingDraft.notes,
    worksheets: validated.worksheets ?? existingDraft.worksheets,
    tools: validated.tools ?? existingDraft.tools,
    updatedBy: {
      userId: auth.userData.id,
      email: auth.user.email,
    },
  };

  const result = await saveResourceCMSDraft(slug, nextDraft);
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin"],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const { slug } = await context.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let validated;
  try {
    validated = validateFullResourceCMSDraft(body);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid payload" },
      { status: 400 }
    );
  }

  const nextDraft: ResourceDraft = {
    ...validated,
    updatedBy: {
      userId: auth.userData.id,
      email: auth.user.email,
    },
  };

  const exists = await getResourceCMSDocSnapshot(slug);
  if (!exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await saveResourceCMSDraft(slug, nextDraft);
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
