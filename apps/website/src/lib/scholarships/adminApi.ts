import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import { revalidateDataTags } from "@/lib/data-cache";
import { SCHOLARSHIPS_TAG, UNIVERSITIES_TAG } from "@/lib/data/scholarships";
import { SCHOLARSHIP_CMS_ROLES } from "@/lib/roles";
import { slugify } from "@/lib/slugify";
import type { AuthSession } from "@/types/auth";
import type { Model } from "mongoose";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { RESERVED_SCHOLARSHIP_SLUGS } from "./constants";

/** Auth for scholarship CMS routes; state-changing calls also get a CSRF check. */
export async function authorizeScholarshipAdmin(
  req: Request,
  { write = false, routeKey }: { write?: boolean; routeKey?: string } = {},
): Promise<AuthSession | Response> {
  const auth = await authorizeAdminApi(req, {
    roles: [...SCHOLARSHIP_CMS_ROLES],
    ...(routeKey ? { rateLimit: { routeKey } } : {}),
  });
  if (auth instanceof Response) return auth;

  if (write) {
    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;
  }

  return auth;
}

export function actorOf(session: AuthSession) {
  return { userId: session.userId, email: session.user.email };
}

export function revalidateScholarshipSurfaces() {
  revalidateDataTags(SCHOLARSHIPS_TAG, UNIVERSITIES_TAG);
  revalidatePath("/scholarships", "layout");
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Returns `preferred` (or a slug made from `fallbackText`) with a numeric
 * suffix if another document already uses it.
 */
export async function uniqueSlug(
  model: Model<unknown>,
  preferred: string,
  fallbackText: string,
  excludeId?: string,
): Promise<string> {
  const base =
    (preferred || slugify(fallbackText))
      .replace(/_/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70) || "untitled";

  for (let i = 1; i < 100; i++) {
    const candidate = i === 1 ? base : `${base}-${i}`;
    if ((RESERVED_SCHOLARSHIP_SLUGS as readonly string[]).includes(candidate)) continue;
    const clash = await model.exists({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
    if (!clash) return candidate;
  }
  return `${base}-${Date.now()}`;
}
