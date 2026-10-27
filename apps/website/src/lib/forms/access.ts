import { canAccessSection } from "@/lib/admin-access/server";
import {
  canManageFormType,
  canManageRedditForm,
  REDDIT_FORM_TYPE,
  type Role,
} from "@/lib/roles";

export { canManageFormType, canManageRedditForm, REDDIT_FORM_TYPE };

export function canManageFormByType(
  roles: Role[] | undefined,
  formType: string,
): boolean {
  return canManageFormType(roles, formType);
}

/**
 * Server check for form-management APIs: Forms page access plus the per-form
 * rule (admins manage every form, department heads only their own type).
 */
export async function canManageForm(
  roles: Role[] | undefined,
  formType: string,
): Promise<boolean> {
  return (
    canManageFormType(roles, formType) &&
    (await canAccessSection(roles, "forms"))
  );
}

export function canVoteOnFormType(
  roles: Role[] | undefined,
  formType: string,
): boolean {
  return canManageFormType(roles, formType);
}
