import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { uploadImageToCloudinary } from "@/lib/cloudinaryUpload";
import { enforceSameOrigin } from "@/lib/csrf";
import type { ThumbnailSection } from "@/types/resources2";
import { RESOURCE_CMS_ROLES } from "@/lib/roles";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

const MAX_THUMBNAIL_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const THUMBNAIL_SECTIONS = new Set<ThumbnailSection>([
  "books",
  "youtubeChannel",
  "youtubePlaylist",
]);

export async function POST(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...RESOURCE_CMS_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const section = formData.get("section");
    const slug = formData.get("slug");

    if (!(file instanceof File) || typeof section !== "string" || !slug) {
      return NextResponse.json(
        { error: "Missing file, section, or slug" },
        { status: 400 }
      );
    }

    if (!THUMBNAIL_SECTIONS.has(section as ThumbnailSection)) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "File must be JPEG, PNG, or WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_THUMBNAIL_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `File is too large. Maximum size is ${Math.floor(
            MAX_THUMBNAIL_SIZE_BYTES / (1024 * 1024)
          )}MB.`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { path } = await uploadImageToCloudinary(buffer, {
      section: section as ThumbnailSection,
      slug: String(slug),
      mimeType: file.type,
      uniqueId: randomUUID().slice(0, 8),
    });

    return NextResponse.json({ path });
  } catch (error) {
    console.error("Thumbnail upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
