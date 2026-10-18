/** Auth and response helpers for /api/tasks routes. Server-only. */
import { enforceSameOrigin } from "@/lib/csrf";
import { enforceRateLimit } from "@/lib/rateLimit";
import { firstIssue } from "@/lib/validation/tasks";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { getTasksContext, type TasksContext } from "./actor";

export type MutationResult<T = Record<string, unknown>> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

export const ok = <T,>(data: T): MutationResult<T> => ({ ok: true, data });
export const fail = (error: string, status = 400): { ok: false; status: number; error: string } => ({
  ok: false,
  status,
  error,
});

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function respond<T>(result: MutationResult<T>, successStatus = 200) {
  if (!result.ok) return jsonError(result.error, result.status);
  return NextResponse.json({ data: result.data }, { status: successStatus });
}

/**
 * Staff-only access for /api/tasks. Writes also get a same-origin (CSRF)
 * check. Everything is rate limited per user.
 */
export async function authorizeTasksApi(
  req: Request,
  { write = false, routeKey }: { write?: boolean; routeKey: string },
): Promise<TasksContext | Response> {
  if (write) {
    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;
  }

  const ctx = await getTasksContext();
  if (!ctx) return jsonError("Forbidden", 403);

  const rlError = await enforceRateLimit(
    req,
    `tasks-${routeKey}`,
    { limit: write ? 120 : 240, windowSec: 60 },
    ctx.session.userId,
  );
  if (rlError) return rlError;

  return ctx;
}

/** Parses a JSON body with a zod schema. */
export async function readBody<S extends z.ZodType>(
  req: Request,
  schema: S,
): Promise<{ ok: true; data: z.infer<S> } | { ok: false; response: Response }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { ok: false, response: jsonError("Invalid JSON body") };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, response: jsonError(firstIssue(parsed.error)) };
  return { ok: true, data: parsed.data };
}

/** Wraps a handler body so unexpected errors become a 500 without leaking details. */
export async function guarded(label: string, run: () => Promise<Response>): Promise<Response> {
  try {
    return await run();
  } catch (error) {
    console.error(`[tasks] ${label}`, error);
    return jsonError("Something went wrong", 500);
  }
}
