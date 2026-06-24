import { getAuthSession } from "@/lib/getAuthSession";
import { enforceRateLimit } from "@/lib/rateLimit";
import { requireRoles } from "@/lib/requireRoles";
import type { Role } from "@/lib/roles";
import type { AuthSession } from "@/types/auth";

type AuthorizeAdminApiOptions = {
  roles: Role[];
  rateLimit?: {
    routeKey: string;
    limit?: number;
    windowSec?: number;
  };
};

export async function authorizeAdminApi(
  req: Request,
  { roles, rateLimit }: AuthorizeAdminApiOptions,
): Promise<AuthSession | Response> {
  const session = await getAuthSession();

  try {
    requireRoles(session, roles);
  } catch {
    return new Response("Forbidden", { status: 403 });
  }

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
