import "server-only";

import NoAccess from "@/components/NoAccess";
import { getAuthSession } from "@/lib/getAuthSession";
import { getAdminSection, type AdminSectionKey } from "./sections";
import { canAccessSection } from "./server";

/**
 * Call first in every admin page: `const denied = await guardSection("team");
 * if (denied) return denied;`. The admin layout's own check doesn't re-run on
 * client-side navigation, and pages load their data in parallel with it.
 */
export async function guardSection(key: AdminSectionKey) {
  const session = await getAuthSession();
  if (session && (await canAccessSection(session.userData?.roles, key))) {
    return null;
  }
  return (
    <NoAccess message={`You don't have access to ${getAdminSection(key).label}.`} />
  );
}
