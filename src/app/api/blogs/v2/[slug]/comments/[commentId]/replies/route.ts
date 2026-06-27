import { listCommentReplies } from "@/lib/data/blogV2Comments";
import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import BlogV2 from "@/models/blogV2";
import BlogV2Comment from "@/models/blogV2Comment";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string; commentId: string }> },
) {
  const { slug, commentId } = await context.params;

  await connectDB();

  const blog = await BlogV2.findOne({ slug }).select("_id").lean();
  if (!blog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const root = await BlogV2Comment.findOne({
    _id: commentId,
    blogSlug: slug,
    parentId: null,
  })
    .select("_id")
    .lean();

  if (!root) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const session = await getAuthSession();
  const replies = await listCommentReplies(commentId, session?.userData.id);

  return NextResponse.json({ replies });
}
