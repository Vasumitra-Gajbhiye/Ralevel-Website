import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import { revalidateDataTags } from "@/lib/data-cache";
import {
  getResourceCMSDocSnapshot,
  publishResourceCMSDraft,
  resolveCMSDraft,
} from "@/lib/data/admin/resource-cms";
import connectDB from "@/lib/mongodb";
import type { ResourceDraft } from "@/types/resources2";
import { RESOURCE_CMS_ROLES } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const auth = await authorizeAdminApi(req, {
    roles: [...RESOURCE_CMS_ROLES],
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

  const draft: ResourceDraft = {
    ...resolveCMSDraft(doc),
    updatedBy: {
      userId: auth.userData.id,
      email: auth.user.email,
    },
  };

  const result = await publishResourceCMSDraft(slug, {
    ...draft,
    updatedBy: {
      userId: auth.userData.id,
      email: auth.user.email,
    },
  }, {
    userId: auth.userData.id,
    email: auth.user.email,
  });

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  revalidateDataTags("resources", `resource:${slug}`);

  return NextResponse.json(result);
}
