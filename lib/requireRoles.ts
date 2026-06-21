import type { Role } from "@/lib/roles";
import type { AuthSession } from "@/types/auth";

export function hasRole(session: AuthSession | null, allowed: Role[]) {
  const roles = session?.userData?.roles;
  if (!roles) return false;

  const allowedSet = new Set(allowed);
  return roles.some((r) => allowedSet.has(r));
}

export function requireRoles(session: AuthSession | null, allowed: Role[]): Role[] {
  if (!hasRole(session, allowed)) {
    throw new Error("FORBIDDEN");
  }

  return session!.userData!.roles;
}
