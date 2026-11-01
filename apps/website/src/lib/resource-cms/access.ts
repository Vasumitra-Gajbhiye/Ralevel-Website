import "server-only";

import { canAccessSection } from "@/lib/admin-access/server";
import type { Role } from "@/lib/roles";

/**
 * Whether these roles can change what's live on /resources without review.
 * Driven by the "Resource publishing" row on /admin/permissions.
 */
export async function canPublishResources(
  roles: readonly Role[] | undefined,
): Promise<boolean> {
  return canAccessSection(roles, "resource-publish");
}
