import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { uploadTeamPhotoToCloudinary } from "@/lib/cloudinaryUpload";
import { enforceSameOrigin } from "@/lib/csrf";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

const TEAM_ADMIN_ROLES = ["owner", "admin"] as const;
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...TEAM_ADMIN_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const memberKeyRaw = formData.get("memberKey");
    const memberKey =
      typeof memberKeyRaw === "string" && memberKeyRaw.trim()
        ? memberKeyRaw.trim()
        : "new";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "File must be JPEG, PNG, or WebP" },
        { status: 400 },
      );
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `File is too large. Maximum size is ${Math.floor(
            MAX_PHOTO_SIZE_BYTES / (1024 * 1024),
          )}MB.`,
        },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { path } = await uploadTeamPhotoToCloudinary(buffer, {
      memberKey,
      mimeType: file.type,
      uniqueId: randomUUID().slice(0, 8),
    });

    return NextResponse.json({ path });
  } catch (error) {
    console.error("Team photo upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
