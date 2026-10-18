/** People who can be assigned tasks in a list. Server-only. */
import connectDB from "@/lib/mongodb";
import { isAdmin, sanitizeRoles, STAFF_ROLES } from "@/lib/roles";
import { isMemberRoleSet, membersQuery } from "@/lib/tasks/departments";
import { canManageList, type ListScope, type TasksActor } from "@/lib/tasks/permissions";
import { resolveWriterAvatar } from "@/lib/resolveWriterAvatar";
import type { MemberOption } from "@/lib/tasks/types";
import UserData from "@/models/userData";
import type { Types } from "mongoose";

type MemberDoc = {
  _id: Types.ObjectId;
  name?: string;
  email: string;
  nickname?: string;
  roles?: string[];
  writerProfile?: { avatar?: string };
};

const MAX_MEMBERS = 500;

function avatar(raw?: string): string | null {
  if (!raw?.trim()) return null;
  try {
    return resolveWriterAvatar(raw);
  } catch {
    return null;
  }
}

/**
 * Department members first; admins also get every other staff member, since
 * they can assign anyone. Empty for inbox lists and for non-managers.
 */
export async function getAssignableMembers(actor: TasksActor, scope: ListScope): Promise<MemberOption[]> {
  if (scope.kind !== "department" || !scope.departmentKey) return [];
  if (!canManageList(actor, scope)) return [];
  await connectDB();

  const query = isAdmin(actor.roles) ? { roles: { $in: [...STAFF_ROLES] } } : membersQuery(scope.departmentKey);
  const users = await UserData.find(query)
    .select("name email nickname roles writerProfile.avatar")
    .limit(MAX_MEMBERS)
    .lean<MemberDoc[]>();

  return users
    .map((u) => ({
      id: String(u._id),
      name: u.name?.trim() || u.nickname || u.email.split("@")[0],
      nickname: u.nickname ?? null,
      avatar: avatar(u.writerProfile?.avatar),
      inDepartment: isMemberRoleSet(sanitizeRoles(u.roles), scope.departmentKey!),
    }))
    .sort((a, b) => Number(b.inDepartment) - Number(a.inDepartment) || a.name.localeCompare(b.name));
}
