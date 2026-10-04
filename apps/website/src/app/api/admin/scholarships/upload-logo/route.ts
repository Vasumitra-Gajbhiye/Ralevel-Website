import { uploadScholarshipLogoToCloudinary } from "@/lib/cloudinaryUpload";
import { authorizeScholarshipAdmin, jsonError } from "@/lib/scholarships/adminApi";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: Request) {
  const auth = await authorizeScholarshipAdmin(req, { write: true });
  if (auth instanceof Response) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const keyRaw = formData.get("key");
    const key = typeof keyRaw === "string" && keyRaw.trim() ? keyRaw.trim() : "logo";

    if (!(file instanceof File)) return jsonError("Missing file");
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return jsonError("File must be JPEG, PNG, or WebP");
    }
    if (file.size > MAX_LOGO_SIZE_BYTES) {
      return jsonError("File is too large. Maximum size is 2MB.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { path } = await uploadScholarshipLogoToCloudinary(buffer, {
      key,
      mimeType: file.type,
      uniqueId: randomUUID().slice(0, 8),
    });

    return NextResponse.json({ path });
  } catch (error) {
    console.error("Scholarship logo upload error:", error);
    return jsonError("Upload failed", 500);
  }
}
