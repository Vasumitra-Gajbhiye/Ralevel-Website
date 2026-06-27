import { enforceSameOrigin } from "@/lib/csrf";
import { toggleBlogV2Like } from "@/lib/data/blogV2Likes";
import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import BlogV2 from "@/models/blogV2";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  const { slug } = await context.params;

  await connectDB();

  const blog = await BlogV2.findOne({ slug }).select("_id").lean();
  if (!blog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await toggleBlogV2Like(slug, session.userData.id);

  return NextResponse.json(result);
}
