import {
  canManageFormType,
  canManageRedditForm,
  isAdmin,
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

export function canVoteOnFormType(
  roles: Role[] | undefined,
  formType: string,
): boolean {
  if (isAdmin(roles)) return true;
  if (formType === REDDIT_FORM_TYPE && canManageRedditForm(roles)) return true;
  return false;
}
