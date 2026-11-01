import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import { revalidateDataTags } from "@/lib/data-cache";
import {
  getResourceCMSDocSnapshot,
  publishResourceCMSDraft,
  resolveCMSDraft,
} from "@/lib/data/admin/resource-cms";
import {
  getOpenChangeRequest,
  logDirectPublish,
} from "@/lib/data/admin/resource-change-requests";
import connectDB from "@/lib/mongodb";
import { actorFromSession } from "@/lib/resource-cms/requests/route";
import type { ResourceDraft } from "@/types/resources2";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const auth = await authorizeAdminApi(req, {
    section: "resource-publish",
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

  // While a request is open the draft belongs to it: approve or reject it.
  const open = await getOpenChangeRequest(slug);
  if (open) {
    return NextResponse.json(
      {
        error: `Request #${open.number} is open for this subject. Approve or reject it instead.`,
        code: "open_request_exists",
        requestNumber: open.number,
      },
      { status: 409 },
    );
  }

  const draft: ResourceDraft = {
    ...resolveCMSDraft(doc),
    updatedBy: {
      userId: auth.userData.id,
      email: auth.user.email,
    },
  };

  const result = await publishResourceCMSDraft(
    slug,
    {
      ...draft,
      updatedBy: {
        userId: auth.userData.id,
        email: auth.user.email,
      },
    },
    {
      userId: auth.userData.id,
      email: auth.user.email,
    },
  );

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  revalidateDataTags("resources", `resource:${slug}`);

  await logDirectPublish({
    slug,
    actor: actorFromSession(auth),
    liveBefore: result.liveBefore,
    liveAfter: result.liveAfter,
  });

  return NextResponse.json({
    slug: result.slug,
    subject: result.subject,
    hasUnpublishedChanges: result.hasUnpublishedChanges,
    publishedAt: result.publishedAt,
    liveUrl: result.liveUrl,
  });
}
