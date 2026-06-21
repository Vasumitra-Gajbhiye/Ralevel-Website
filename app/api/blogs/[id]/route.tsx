import { getAuthSession } from "@/lib/getAuthSession";
import { CACHE_HEADERS, invalidateTags } from "@/lib/cache";
import { getCachedBlogBySlug } from "@/lib/data/blogs";
import connectDB from "@/lib/mongodb";
import { enforceRateLimit } from "@/lib/rateLimit";
import { requireRoles } from "@/lib/requireRoles";
import BlogsData from "@/models/blogsData";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rlError = await enforceRateLimit(req, "public-blogs-detail", {
    limit: 100,
    windowSec: 60,
  });
  if (rlError) return rlError;
  const { id } = await params;

  try {
    const blog = await getCachedBlogBySlug(id);

    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Successfully fetched blog metadata", data: blog },
      { status: 200, headers: CACHE_HEADERS }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch blog", error },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  try {
    requireRoles(session, ["owner", "admin", "writer"]);
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const pramasID = id;

  try {
    const {
      newMainTitle: mainTitle,
      newDate: date,
      newAuthor: author,
      newIntroSection: introSection,
      newSections: sections,
      newId: id,
    } = await req.json();

    const newBlogsData = {
      mainTitle: mainTitle,
      date: date,
      author: author,
      introSection: introSection,
      sections: sections,
      id: id,
    };

    await connectDB();

    const existing = (await BlogsData.findById(pramasID).lean()) as {
      slug?: string;
    } | null;
    await BlogsData.findByIdAndUpdate(pramasID, newBlogsData);

    const tags = ["blogs"];
    if (existing?.slug) tags.push(`blog:${existing.slug}`);
    await invalidateTags(...tags);

    return NextResponse.json(
      {
        message: "Successfully updated a new subject",
        data: newBlogsData,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return NextResponse.json({
      message: "Cannot update a subject",
      error: error,
    });
  }
}
