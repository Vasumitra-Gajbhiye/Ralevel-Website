import connectDB from "@/lib/mongodb";
import { hasAnyRole, type Role } from "@/lib/roles";
import { sanitizeCommentBody } from "@/lib/sanitizeCommentBody";
import BlogV2 from "@/models/blogV2";
import BlogV2Comment from "@/models/blogV2Comment";
import BlogV2CommentLike from "@/models/blogV2CommentLike";
import mongoose from "mongoose";

export type BlogV2CommentPublic = {
  id: string;
  authorName: string;
  body: string;
  depth: number;
  replyCount: number;
  likeCount: number;
  likedByCurrentUser: boolean;
  createdAt: string;
  parentId: string | null;
  rootId: string | null;
  userId: string;
};

type CommentDoc = {
  _id: mongoose.Types.ObjectId;
  blogSlug: string;
  userId: mongoose.Types.ObjectId;
  authorName: string;
  body: string;
  parentId?: mongoose.Types.ObjectId | null;
  rootId?: mongoose.Types.ObjectId | null;
  depth: number;
  replyCount: number;
  likeCount: number;
  createdAt: Date;
};

function toPublicComment(
  doc: CommentDoc,
  likedByCurrentUser = false,
): BlogV2CommentPublic {
  return {
    id: doc._id.toString(),
    authorName: doc.authorName,
    body: doc.body,
    depth: doc.depth,
    replyCount: doc.replyCount,
    likeCount: doc.likeCount,
    likedByCurrentUser,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : String(doc.createdAt),
    parentId: doc.parentId ? doc.parentId.toString() : null,
    rootId: doc.rootId ? doc.rootId.toString() : null,
    userId: doc.userId.toString(),
  };
}

export async function getBlogV2CommentCount(slug: string): Promise<number> {
  await connectDB();

  const blog = await BlogV2.findOne({ slug })
    .select("commentCount")
    .lean<{ commentCount?: number }>();

  return blog?.commentCount ?? 0;
}

export async function listTopLevelComments(
  slug: string,
  options: { cursor?: string; limit?: number; userId?: string },
): Promise<{
  comments: BlogV2CommentPublic[];
  nextCursor: string | null;
  totalCount: number;
}> {
  await connectDB();

  const limit = Math.min(Math.max(options.limit ?? 10, 1), 50);
  const totalCount = await getBlogV2CommentCount(slug);

  const filter: Record<string, unknown> = {
    blogSlug: slug,
    parentId: null,
  };

  if (options.cursor) {
    const cursorDate = new Date(options.cursor);
    if (!Number.isNaN(cursorDate.getTime())) {
      filter.createdAt = { $lt: cursorDate };
    }
  }

  const docs = await BlogV2Comment.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .lean<CommentDoc[]>();

  const hasMore = docs.length > limit;
  const page = hasMore ? docs.slice(0, limit) : docs;

  let likedSet = new Set<string>();
  if (options.userId && page.length > 0) {
    const userObjectId = new mongoose.Types.ObjectId(options.userId);
    const likes = await BlogV2CommentLike.find({
      commentId: { $in: page.map((d) => d._id) },
      userId: userObjectId,
    }).lean<{ commentId: mongoose.Types.ObjectId }[]>();

    likedSet = new Set(likes.map((l) => l.commentId.toString()));
  }

  const comments = page.map((doc) =>
    toPublicComment(doc, likedSet.has(doc._id.toString())),
  );

  const nextCursor =
    hasMore && page.length > 0
      ? page[page.length - 1].createdAt.toISOString()
      : null;

  return { comments, nextCursor, totalCount };
}

export async function listCommentReplies(
  rootId: string,
  userId?: string,
): Promise<BlogV2CommentPublic[]> {
  await connectDB();

  const rootObjectId = new mongoose.Types.ObjectId(rootId);

  const root = await BlogV2Comment.findById(rootObjectId).lean<CommentDoc>();
  if (!root) return [];

  const docs = await BlogV2Comment.find({
    blogSlug: root.blogSlug,
    rootId: rootObjectId,
  })
    .sort({ createdAt: 1 })
    .lean<CommentDoc[]>();

  let likedSet = new Set<string>();
  if (userId && docs.length > 0) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const likes = await BlogV2CommentLike.find({
      commentId: { $in: docs.map((d) => d._id) },
      userId: userObjectId,
    }).lean<{ commentId: mongoose.Types.ObjectId }[]>();

    likedSet = new Set(likes.map((l) => l.commentId.toString()));
  }

  return docs.map((doc) =>
    toPublicComment(doc, likedSet.has(doc._id.toString())),
  );
}

export async function createComment(
  slug: string,
  userId: string,
  authorName: string,
  body: string,
  parentId?: string,
): Promise<BlogV2CommentPublic> {
  await connectDB();

  const sanitized = sanitizeCommentBody(body);
  if (!sanitized) {
    throw new Error("Comment body is empty");
  }

  const blog = await BlogV2.findOne({ slug }).select("_id").lean();
  if (!blog) {
    throw new Error("Blog not found");
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  let parentDoc: CommentDoc | null = null;

  if (parentId) {
    parentDoc = await BlogV2Comment.findOne({
      _id: new mongoose.Types.ObjectId(parentId),
      blogSlug: slug,
    }).lean<CommentDoc>();

    if (!parentDoc) {
      throw new Error("Parent comment not found");
    }
  }

  const rootId = parentDoc
    ? parentDoc.rootId ?? parentDoc._id
    : null;
  const depth = parentDoc ? parentDoc.depth + 1 : 0;

  const comment = await BlogV2Comment.create({
    blogSlug: slug,
    userId: userObjectId,
    authorName: authorName.trim() || "Reader",
    body: sanitized,
    parentId: parentDoc ? parentDoc._id : null,
    rootId,
    depth,
  });

  await BlogV2.updateOne({ slug }, { $inc: { commentCount: 1 } });

  if (parentDoc) {
    await BlogV2Comment.updateOne(
      { _id: parentDoc._id },
      { $inc: { replyCount: 1 } },
    );
  }

  return toPublicComment(comment.toObject() as CommentDoc, false);
}

export async function toggleCommentLike(
  commentId: string,
  userId: string,
): Promise<{ liked: boolean; likeCount: number }> {
  await connectDB();

  const commentObjectId = new mongoose.Types.ObjectId(commentId);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const existing = await BlogV2CommentLike.findOne({
    commentId: commentObjectId,
    userId: userObjectId,
  });

  if (existing) {
    await existing.deleteOne();
    const comment = await BlogV2Comment.findByIdAndUpdate(
      commentObjectId,
      [{ $set: { likeCount: { $max: [0, { $subtract: ["$likeCount", 1] }] } } }],
      { new: true },
    ).lean<{ likeCount?: number }>();

    return { liked: false, likeCount: comment?.likeCount ?? 0 };
  }

  try {
    await BlogV2CommentLike.create({
      commentId: commentObjectId,
      userId: userObjectId,
    });
  } catch (err) {
    if (
      err instanceof mongoose.mongo.MongoServerError &&
      err.code === 11000
    ) {
      const comment = await BlogV2Comment.findById(commentObjectId).lean<{
        likeCount?: number;
      }>();
      return { liked: true, likeCount: comment?.likeCount ?? 0 };
    }
    throw err;
  }

  const comment = await BlogV2Comment.findByIdAndUpdate(
    commentObjectId,
    { $inc: { likeCount: 1 } },
    { new: true },
  ).lean<{ likeCount?: number }>();

  return { liked: true, likeCount: comment?.likeCount ?? 0 };
}

const ADMIN_DELETE_ROLES = ["owner", "admin"] as const satisfies readonly Role[];

export async function deleteComment(
  commentId: string,
  userId: string,
  roles: Role[],
): Promise<void> {
  await connectDB();

  const comment = await BlogV2Comment.findById(commentId).lean<CommentDoc>();
  if (!comment) {
    throw new Error("Comment not found");
  }

  const isAuthor = comment.userId.toString() === userId;
  const isAdmin = hasAnyRole(roles, ADMIN_DELETE_ROLES);

  if (!isAuthor && !isAdmin) {
    throw new Error("Forbidden");
  }

  if (comment.replyCount > 0) {
    const err = new Error("Delete replies first");
    (err as Error & { statusCode: number }).statusCode = 409;
    throw err;
  }

  await BlogV2CommentLike.deleteMany({
    commentId: comment._id,
  });

  await BlogV2Comment.deleteOne({ _id: comment._id });

  await BlogV2.updateOne(
    { slug: comment.blogSlug },
    [{ $set: { commentCount: { $max: [0, { $subtract: ["$commentCount", 1] }] } } }],
  );

  if (comment.parentId) {
    await BlogV2Comment.updateOne(
      { _id: comment.parentId },
      [{ $set: { replyCount: { $max: [0, { $subtract: ["$replyCount", 1] }] } } }],
    );
  }
}
