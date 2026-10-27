import { canAccessSection } from "@/lib/admin-access/server";
import type { Role } from "@/lib/roles";
import BlogV2 from "@/models/blogV2";
import mongoose from "mongoose";

export function isAdminLike(roles: Role[]): boolean {
  return roles.some((r) => r === "admin" || r === "owner");
}

/** Owners, admins and anyone who can open All Blogs can read every post. */
export async function canReviewBlogs(roles: Role[]): Promise<boolean> {
  return isAdminLike(roles) || (await canAccessSection(roles, "all-blogs"));
}

export function buildBlogAccessQuery(
  blogId: string,
  userId: string,
  canReadAll: boolean,
): { _id: mongoose.Types.ObjectId } | null {
  if (!mongoose.Types.ObjectId.isValid(blogId)) return null;

  const id = new mongoose.Types.ObjectId(blogId);

  if (canReadAll) {
    return { _id: id };
  }

  return {
    _id: id,
    ownerId: new mongoose.Types.ObjectId(userId),
  } as { _id: mongoose.Types.ObjectId; ownerId: mongoose.Types.ObjectId };
}

export async function findBlogForAccess(
  blogId: string,
  userId: string,
  roles: Role[],
) {
  const query = buildBlogAccessQuery(
    blogId,
    userId,
    await canReviewBlogs(roles),
  );
  if (!query) return null;
  return BlogV2.findOne(query);
}
