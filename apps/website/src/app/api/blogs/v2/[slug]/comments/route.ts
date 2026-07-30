import { assertPublishedBlogBySlug } from "@/lib/blogs-v2/public";
import {
  createComment,
  listTopLevelComments,
} from "@/lib/data/blogV2Comments";
import { enforceSameOrigin } from "@/lib/csrf";
import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const url = new URL(_req.url);
  const cursor = url.searchParams.get("cursor") ?? undefined;
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;

  await connectDB();

  const blog = await assertPublishedBlogBySlug(slug);
  if (!blog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const session = await getAuthSession();
  const userId = session?.userData.id;

  const result = await listTopLevelComments(slug, {
    cursor,
    limit,
    userId,
  });

  return NextResponse.json(result);
}

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

  const blog = await assertPublishedBlogBySlug(slug);
  if (!blog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { body?: string; parentId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.body?.trim()) {
    return NextResponse.json({ error: "Comment body is required" }, { status: 400 });
  }

  try {
    const comment = await createComment(
      slug,
      session.userData.id,
      session.user.name ?? session.user.email,
      body.body,
      body.parentId,
    );

    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create comment";
    const status = message === "Parent comment not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
