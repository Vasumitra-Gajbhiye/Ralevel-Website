import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { uploadWriterAvatarToCloudinary } from "@/lib/cloudinaryUpload";
import { enforceSameOrigin } from "@/lib/csrf";
import { isAdmin, WRITER_CMS_ROLES } from "@/lib/roles";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...WRITER_CMS_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const targetUserId = formData.get("userId");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    let userId = auth.userData.id;
    if (typeof targetUserId === "string" && targetUserId.trim()) {
      const requestedId = targetUserId.trim();
      if (
        requestedId !== auth.userData.id &&
        !isAdmin(auth.userData.roles)
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      userId = requestedId;
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "File must be JPEG, PNG, or WebP" },
        { status: 400 },
      );
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `File is too large. Maximum size is ${Math.floor(
            MAX_AVATAR_SIZE_BYTES / (1024 * 1024),
          )}MB.`,
        },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { path } = await uploadWriterAvatarToCloudinary(buffer, {
      userId,
      mimeType: file.type,
      uniqueId: randomUUID().slice(0, 8),
    });

    return NextResponse.json({ path });
  } catch (error) {
    console.error("Writer avatar upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
