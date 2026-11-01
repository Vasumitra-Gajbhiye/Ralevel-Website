import "server-only";

import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import { canPublishResources } from "@/lib/resource-cms/access";
import { isAdmin } from "@/lib/roles";
import type { AuthSession } from "@/types/auth";
import type { ResourceChangePerson } from "@/types/resourceChangeRequests";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { firstIssue } from "@/lib/validation/resource-change-requests";
import { getChangeRequestState } from "@/lib/data/admin/resource-change-requests";
import { changeRequestErrorResponse } from "./errors";
import type { ChangeRequestViewer } from "./rules";

export type ChangeRequestRouteContext = {
  auth: AuthSession;
  actor: ResourceChangePerson;
  viewer: ChangeRequestViewer;
};

export function actorFromSession(auth: AuthSession): ResourceChangePerson {
  return { userId: auth.userData.id, email: auth.user.email, name: auth.user.name };
}

export async function viewerFromSession(auth: AuthSession): Promise<ChangeRequestViewer> {
  return {
    userId: auth.userData.id,
    canPublish: await canPublishResources(auth.userData.roles),
    isAdmin: isAdmin(auth.userData.roles),
  };
}

/**
 * Everyone with Resource CMS access can use the request endpoints; what they
 * may do inside (approve, withdraw, …) is decided by ./rules.
 */
export async function authorizeChangeRequestRoute(
  req: Request,
  options: { write?: boolean; rateLimit?: { routeKey: string; limit?: number; windowSec?: number } } = {},
): Promise<ChangeRequestRouteContext | Response> {
  const auth = await authorizeAdminApi(req, {
    section: "resource-cms",
    rateLimit: options.rateLimit,
  });
  if (auth instanceof Response) return auth;

  if (options.write) {
    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;
  }

  return { auth, actor: actorFromSession(auth), viewer: await viewerFromSession(auth) };
}

export function parseRequestNumber(raw: string): number | null {
  if (!/^\d{1,9}$/.test(raw)) return null;
  const n = Number(raw);
  return n > 0 ? n : null;
}

export async function parseJsonBody<T extends z.ZodType>(
  req: Request,
  schema: T,
): Promise<{ data: z.infer<T> } | { error: Response }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { error: NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 }) };
  }
  return { data: parsed.data };
}

export const forbidden = (message = "You can't do that on this request.") =>
  NextResponse.json({ error: message, code: "forbidden" }, { status: 403 });

export const notFound = () => NextResponse.json({ error: "Request not found" }, { status: 404 });

type RequestState = NonNullable<Awaited<ReturnType<typeof getChangeRequestState>>>;

/**
 * Shared shape of the POST /requests/[number]/<action> routes: authorize,
 * parse the body, check the rule for this person, then run the action.
 */
export async function runRequestAction<T extends z.ZodType, R>(
  req: Request,
  params: Promise<{ number: string }>,
  options: {
    schema: T;
    allowed: (state: RequestState, viewer: ChangeRequestViewer) => boolean | Promise<boolean>;
    deniedMessage: string;
    run: (input: { number: number; data: z.infer<T>; ctx: ChangeRequestRouteContext }) => Promise<R>;
    rateLimit?: { routeKey: string; limit?: number; windowSec?: number };
  },
): Promise<Response> {
  const ctx = await authorizeChangeRequestRoute(req, { write: true, rateLimit: options.rateLimit });
  if (ctx instanceof Response) return ctx;

  const number = parseRequestNumber((await params).number);
  if (!number) return notFound();

  const body = await parseJsonBody(req, options.schema);
  if ("error" in body) return body.error;

  try {
    const state = await getChangeRequestState(number);
    if (!state) return notFound();
    if (!(await options.allowed(state, ctx.viewer))) return forbidden(options.deniedMessage);

    const result = await options.run({ number, data: body.data, ctx });
    return NextResponse.json(result ?? { ok: true });
  } catch (error) {
    return changeRequestErrorResponse(error);
  }
}
