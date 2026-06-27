import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { uploadBlogHeroToCloudinary } from "@/lib/cloudinaryUpload";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import BlogV2 from "@/models/blogV2";
import { randomUUID } from "crypto";
import mongoose from "mongoose";
import { WRITER_TEAM_ROLES } from "@/lib/roles";
import { NextResponse } from "next/server";

const MAX_HERO_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const auth = await authorizeAdminApi(req, {
    roles: [...WRITER_TEAM_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const { slug } = await context.params;

  const isAdminLike = auth.userData.roles.some(
    (r) => r === "admin" || r === "owner",
  );
  const query = isAdminLike
    ? { slug }
    : {
        slug,
        ownerId: new mongoose.Types.ObjectId(auth.userData.id),
      };

  const blog = await BlogV2.findOne(query);
  if (!blog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "File must be JPEG, PNG, or WebP" },
        { status: 400 },
      );
    }

    if (file.size > MAX_HERO_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `File is too large. Maximum size is ${Math.floor(
            MAX_HERO_SIZE_BYTES / (1024 * 1024),
          )}MB.`,
        },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { path } = await uploadBlogHeroToCloudinary(buffer, {
      slug,
      mimeType: file.type,
      uniqueId: randomUUID().slice(0, 8),
    });

    return NextResponse.json({ path });
  } catch (error) {
    console.error("Blog hero upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
