import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import { revalidateDataTags } from "@/lib/data-cache";
import {
  buildDraftFromLive,
  getResourceCMSDocSnapshot,
  isDraftEmpty,
  publishResourceCMSDraft,
  serializeDraft,
} from "@/lib/data/admin/resource-cms";
import connectDB from "@/lib/mongodb";
import type { ResourceDraft } from "@/types/resources2";
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

  await connectDB();

  const { slug } = await context.params;
  const doc = await getResourceCMSDocSnapshot(slug);

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const draft: ResourceDraft = isDraftEmpty(doc.draft)
    ? buildDraftFromLive(doc)
    : serializeDraft(doc.draft);

  const result = await publishResourceCMSDraft(slug, {
    ...draft,
    updatedBy: {
      userId: auth.userData.id,
      email: auth.user.email,
    },
  });

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  revalidateDataTags("resources", `resource:${slug}`);

  return NextResponse.json(result);
}
