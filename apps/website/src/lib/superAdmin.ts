import type { Role } from "@/lib/roles";

export const SUPER_ADMIN_EMAIL = "vasumitragajbhiye20@gmail.com";

export function isSuperAdminEmail(email?: string | null): boolean {
  return email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

export function applySuperAdminRoles(email: string, roles: Role[]): Role[] {
  if (!isSuperAdminEmail(email)) return roles;
  return roles.includes("owner") ? roles : ["owner", ...roles];
}
