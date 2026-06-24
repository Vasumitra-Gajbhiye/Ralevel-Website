import { CACHE_HEADERS } from "@/lib/cache";
import { revalidateDataTags } from "@/lib/data-cache";
import { getPaginatedBlogList } from "@/lib/data/blogs";
import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import { parsePaginationParams } from "@/lib/pagination";
import { enforceRateLimit } from "@/lib/rateLimit";
import { requireRoles } from "@/lib/requireRoles";
import BlogsData from "@/models/blogsData";
import { NextRequest, NextResponse } from "next/server";

// GET ALL blogs
export async function GET(req: NextRequest) {
  try {
    const rlError = await enforceRateLimit(req, "public-blogs-list", {
      limit: 100,
      windowSec: 60,
    });
    if (rlError) return rlError;

    const { page, limit } = parsePaginationParams(req.nextUrl.searchParams);
    const result = await getPaginatedBlogList({ page, limit });

    return NextResponse.json(
      {
        message: "Successfully fetched blogs",
        ...result,
      },
      { status: 200, headers: CACHE_HEADERS },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Failed to fetch all blogs", error },
      { status: 500 },
    );
  }
}

// CREATE A SUBJECT
export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  try {
    requireRoles(session, ["owner", "admin", "writer"]);
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { mainTitle, description, date, timeToRead, tag, author, slug } =
      await req.json();

    const newBlogsData = {
      mainTitle: mainTitle,
      description: description,
      date: date,
      timeToRead: timeToRead,
      tag: tag,
      author: author,
      slug: slug,
    };

    await connectDB();

    await BlogsData.create(newBlogsData);
    const tags = ["blogs"];
    if (slug) tags.push(`blog:${slug}`);
    revalidateDataTags(...tags);

    return NextResponse.json(
      {
        message: "Successfully created a new blog",
        data: newBlogsData,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return NextResponse.json({
      message: "Cannot create a new blog",
      error: error,
    });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAuthSession();
  try {
    requireRoles(session, ["owner", "admin", "writer"]);
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const id = req.nextUrl.searchParams.get("id");

    await connectDB();

    const deleted = (await BlogsData.findByIdAndDelete(id)) as {
      slug?: string;
    } | null;
    const tags = ["blogs"];
    if (deleted?.slug) {
      tags.push(`blog:${deleted.slug}`);
    }
    revalidateDataTags(...tags);

    return NextResponse.json(
      {
        message: "Blog deleted successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to delete subjects",
        error: error,
      },
      {
        status: 500,
      },
    );
  }
}
