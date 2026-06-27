import { toggleCommentLike } from "@/lib/data/blogV2Comments";
import { enforceSameOrigin } from "@/lib/csrf";
import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import BlogV2Comment from "@/models/blogV2Comment";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ commentId: string }> },
) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  const { commentId } = await context.params;

  await connectDB();

  const comment = await BlogV2Comment.findById(commentId).select("_id").lean();
  if (!comment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await toggleCommentLike(commentId, session.userData.id);

  return NextResponse.json(result);
}
