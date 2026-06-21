import { getAuthSession } from "@/lib/getAuthSession";
import { enforceSameOrigin } from "@/lib/csrf";
import { CACHE_HEADERS } from "@/lib/cache";
import { revalidateDataTags } from "@/lib/data-cache";
import { getCachedLegacyResourceById } from "@/lib/data/resources";
import mongoDBConnect from "@/lib/mongodb";
import { enforceRateLimit } from "@/lib/rateLimit";
import { requireRoles } from "@/lib/requireRoles";
import ResourcesData from "@/models/resourcesData";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rlError = await enforceRateLimit(req, "public-resources-detail", {
    limit: 100,
    windowSec: 60,
  });
  if (rlError) return rlError;
  const { id } = await params;

  try {
    const subject = await getCachedLegacyResourceById(id);

    return NextResponse.json(
      {
        message: "Successfully fetched single subjects",
        data: subject,
      },
      {
        status: 200,
        headers: CACHE_HEADERS,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch single subjects",
        error: error,
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  try {
    requireRoles(session, ["owner", "admin"]);
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  const { id } = await params;
  const pramasID = id;

  try {
    const {
      newTitle: title,
      newEmoji: emoji,
      newLinks: links,
      newId: id,
    } = await req.json();

    const newResourcesData = {
      title: title,
      emoji: emoji,
      links: links,
      id: id,
    };

    await mongoDBConnect();

    await ResourcesData.findByIdAndUpdate(pramasID, newResourcesData);
    revalidateDataTags("resources-legacy");

    return NextResponse.json(
      {
        message: "Successfully updated a new subject",
        data: newResourcesData,
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
