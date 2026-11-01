import {
  getOpenChangeRequest,
  listChangeRequests,
  submitChangeRequest,
} from "@/lib/data/admin/resource-change-requests";
import { parsePaginationParams } from "@/lib/pagination";
import { changeRequestErrorResponse } from "@/lib/resource-cms/requests/errors";
import {
  authorizeChangeRequestRoute,
  forbidden,
  parseJsonBody,
} from "@/lib/resource-cms/requests/route";
import { canSubmit } from "@/lib/resource-cms/requests/rules";
import {
  listChangeRequestsSchema,
  firstIssue,
  submitChangeRequestSchema,
} from "@/lib/validation/resource-change-requests";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const ctx = await authorizeChangeRequestRoute(req, {
    rateLimit: { routeKey: "admin-resource-change-requests-list" },
  });
  if (ctx instanceof Response) return ctx;

  const url = new URL(req.url);
  const parsed = listChangeRequestsSchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  const { page, limit, skip } = parsePaginationParams(url.searchParams);
  const result = await listChangeRequests({
    page,
    limit,
    skip,
    filters: {
      tab: parsed.data.tab,
      slug: parsed.data.slug || undefined,
      authorUserId: parsed.data.mine ? ctx.actor.userId : undefined,
    },
  });
  return NextResponse.json(result);
}

/** Submit the subject's saved draft for review. */
export async function POST(req: Request) {
  const ctx = await authorizeChangeRequestRoute(req, {
    write: true,
    rateLimit: { routeKey: "admin-resource-change-requests-submit", limit: 10, windowSec: 60 },
  });
  if (ctx instanceof Response) return ctx;

  const body = await parseJsonBody(req, submitChangeRequestSchema);
  if ("error" in body) return body.error;

  try {
    const open = await getOpenChangeRequest(body.data.slug);
    const openState = open ? { status: open.status, authorUserId: open.authorUserId } : null;
    if (!canSubmit(openState, ctx.viewer)) {
      return open
        ? NextResponse.json(
            { error: `Request #${open.number} is already open for this subject.`, code: "open_request_exists", requestNumber: open.number },
            { status: 409 },
          )
        : forbidden("You can publish directly, so there's nothing to submit for review.");
    }

    const created = await submitChangeRequest({
      slug: body.data.slug,
      title: body.data.title,
      description: body.data.description,
      actor: ctx.actor,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return changeRequestErrorResponse(error);
  }
}
