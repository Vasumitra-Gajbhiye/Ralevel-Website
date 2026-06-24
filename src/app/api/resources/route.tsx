import { enforceSameOrigin } from "@/lib/csrf";
import { revalidateDataTags } from "@/lib/data-cache";
import { getCachedLegacyResourceList } from "@/lib/data/resources";
import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import {
  buildPaginatedResponse,
  parsePaginationParams,
} from "@/lib/pagination";
import { enforceRateLimit } from "@/lib/rateLimit";
import { requireRoles } from "@/lib/requireRoles";
import ResourcesData from "@/models/resourcesData";
import { NextRequest, NextResponse } from "next/server";

// GET ALL SUBJECTS
export async function GET(req: NextRequest) {
  try {
    const rlError = await enforceRateLimit(req, "public-resources-list", {
      limit: 50,
      windowSec: 60,
    });
    if (rlError) return rlError;

    const { page, limit } = parsePaginationParams(req.nextUrl.searchParams);
    const result = await getCachedLegacyResourceList({ page, limit });

    return NextResponse.json(
      {
        message: "Successfully fetched subjects",
        ...buildPaginatedResponse(result.data, result.total, page, limit),
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch all subjects",
        error: error,
      },
      {
        status: 500,
      },
    );
  }
}

// CREATE A SUBJECT
export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  try {
    requireRoles(session, ["owner", "admin"]);
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  try {
    const { title, emoji, links, id } = await req.json();

    const newResourcesData = {
      title: title,
      emoji: emoji,
      links: links,
      id: id,
    };

    await connectDB();

    await ResourcesData.create(newResourcesData);
    revalidateDataTags("resources-legacy");

    return NextResponse.json(
      {
        message: "Successfully created a new subject",
        data: newResourcesData,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return NextResponse.json({
      message: "Cannot create a new subject",
      error: error,
    });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAuthSession();
  try {
    requireRoles(session, ["owner", "admin"]);
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  try {
    const id = req.nextUrl.searchParams.get("id");

    await connectDB();

    await ResourcesData.findByIdAndDelete(id);
    revalidateDataTags("resources-legacy");

    return NextResponse.json(
      {
        message: "Subject deleted successfully",
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
