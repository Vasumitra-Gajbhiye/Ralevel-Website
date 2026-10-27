import { canAccessSection } from "@/lib/admin-access/server";
import type { AdminSectionKey } from "@/lib/admin-access/sections";
import { getAuthSession } from "@/lib/getAuthSession";
import { enforceRateLimit } from "@/lib/rateLimit";
import { hasRole } from "@/lib/requireRoles";
import type { Role } from "@/lib/roles";
import type { AuthSession } from "@/types/auth";

type RateLimitOptions = {
  routeKey: string;
  limit?: number;
  windowSec?: number;
};

type AuthorizeAdminApiOptions =
  | {
      /** Allow whoever can open these admin pages (any of them). */
      section: AdminSectionKey | readonly AdminSectionKey[];
      roles?: never;
      rateLimit?: RateLimitOptions;
    }
  | {
      /** A fixed role list, for checks that aren't page access. */
      roles: Role[];
      section?: never;
      rateLimit?: RateLimitOptions;
    };

export async function authorizeAdminApi(
  req: Request,
  options: AuthorizeAdminApiOptions,
): Promise<AuthSession | Response> {
  const session = await getAuthSession();

  const allowed = options.section
    ? !!session &&
      (await canAccessSection(session.userData?.roles, options.section))
    : hasRole(session, options.roles ?? []);

  if (!allowed) {
    return new Response("Forbidden", { status: 403 });
  }

  const { rateLimit } = options;
  if (rateLimit) {
    const rlError = await enforceRateLimit(
      req,
      rateLimit.routeKey,
      {
        limit: rateLimit.limit ?? 100,
        windowSec: rateLimit.windowSec ?? 60,
      },
      session!.userId,
    );
    if (rlError) return rlError;
  }

  return session!;
}
