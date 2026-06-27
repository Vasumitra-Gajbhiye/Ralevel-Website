import type { Role } from "@/lib/roles";
import { BLOG_REVIEW_ROLES } from "@/lib/roles";
import BlogV2 from "@/models/blogV2";
import mongoose from "mongoose";

export function isAdminLike(roles: Role[]): boolean {
  return roles.some((r) => r === "admin" || r === "owner");
}

export function canReviewBlogs(roles: Role[]): boolean {
  return roles.some((r) =>
    (BLOG_REVIEW_ROLES as readonly Role[]).includes(r),
  );
}

export function buildBlogAccessQuery(
  blogId: string,
  userId: string,
  roles: Role[],
): { _id: mongoose.Types.ObjectId } | null {
  if (!mongoose.Types.ObjectId.isValid(blogId)) return null;

  const id = new mongoose.Types.ObjectId(blogId);

  if (isAdminLike(roles) || canReviewBlogs(roles)) {
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
  const query = buildBlogAccessQuery(blogId, userId, roles);
  if (!query) return null;
  return BlogV2.findOne(query);
}
