import connectDB from "@/lib/mongodb";
import { getPostHogClient } from "@/lib/posthog-server";
import { uploadFileToR2 } from "@/lib/r2Upload";
import { enforceRateLimit } from "@/lib/rateLimit";
import Contributor from "@/models/Contributor";
import ResourceSubmission from "@/models/ResourceSubmission";
import crypto from "crypto";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const MAX_FILES_PER_RESOURCE = 10;
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_FILE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
]);

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const rlError = await enforceRateLimit(req, "resources-submit", {
      limit: 3, // 3 submissions per 10 minutes per IP
      windowSec: 10 * 60,
    });
    if (rlError) return rlError;

    await connectDB();
    const formData = await req.formData();
    // =============================
    // 1️⃣ Contributor info
    // =============================
    const fullName = formData.get("fullName")?.toString();
    const email = formData.get("email")?.toString();
    const discordOrRedditId = formData.get("discordOrRedditId")?.toString();

    if (!fullName || !email || !discordOrRedditId) {
      return NextResponse.json(
        { error: "Missing contributor info" },
        { status: 400 }
      );
    }

    console.log(formData);

    // =============================
    // 2️⃣ Parse resources dynamically
    // =============================
    const resources: {
      title: string;
      description: string;
      resourceType: string;
      links: string[];
      files: File[];
      levels: string[];
      boards: string[];
      madeByMe: boolean;
    }[] = [];

    let index = 0;

    while (formData.get(`resources[${index}][title]`)) {
      const title = formData.get(`resources[${index}][title]`)!.toString();

      const description =
        formData.get(`resources[${index}][description]`)?.toString() || "";

      const resourceType = formData
        .get(`resources[${index}][resourceType]`)
        ?.toString();

      const links = formData
        .getAll(`resources[${index}][links][]`)
        .map((l) => l.toString());

      const levels = formData
        .getAll(`resources[${index}][levels][]`)
        .map((l) => l.toString());

      const boards = formData
        .getAll(`resources[${index}][boards][]`)
        .map((b) => b.toString());

      const madeByMe = formData.get(`resources[${index}][madeByMe]`) === "true";

      const files = formData
        .getAll(`resources[${index}][files][]`)
        .filter((f): f is File => f instanceof File);

      if (!resourceType) {
        return NextResponse.json(
          {
            error: `Missing resourceType for resource ${index + 1}`,
          },
          { status: 400 }
        );
      }

      resources.push({
        title,
        description,
        resourceType,
        links,
        files,
        levels,
        boards,
        madeByMe,
      });

      index++;
    }

    if (!resources.length) {
      return NextResponse.json(
        { error: "No resources submitted" },
        { status: 400 }
      );
    }

    // =============================
    // 3️⃣ Generate submission ID
    // =============================
    const submissionId = new mongoose.Types.ObjectId();

    // =============================
    // 4️⃣ Find or Create Contributor
    // =============================
    let contributor = await Contributor.findOne({ email });

    if (!contributor) {
      contributor = await Contributor.create({
        fullName,
        email,
        discordOrRedditId,
        totalSubmissions: 0,
      });
    } else {
      contributor.fullName = fullName;
      contributor.discordOrRedditId = discordOrRedditId;
      await contributor.save();
    }

    // =============================
    // 5️⃣ Create submission
    // =============================
    const submission = await ResourceSubmission.create({
      _id: submissionId,
      contributorId: contributor._id,
      resources: [],
      status: "pending",
      metadata: {
        ip: req.headers.get("x-forwarded-for"),
        userAgent: req.headers.get("user-agent"),
      },
    });

    contributor.totalSubmissions += 1;
    await contributor.save();

    // =============================
    // 6️⃣ Upload files per resource (bounded)
    // =============================
    for (let i = 0; i < resources.length; i++) {
      const res = resources[i];

      if (res.files.length > MAX_FILES_PER_RESOURCE) {
        return NextResponse.json(
          {
            error: `Too many files for resource ${
              i + 1
            }. Maximum is ${MAX_FILES_PER_RESOURCE}.`,
          },
          { status: 400 }
        );
      }

      const uploadedFiles = [];

      for (const file of res.files) {
        if (file.size > MAX_FILE_SIZE_BYTES) {
          return NextResponse.json(
            {
              error: `File "${
                file.name
              }" is too large. Maximum size is ${Math.floor(
                MAX_FILE_SIZE_BYTES / (1024 * 1024)
              )}MB.`,
            },
            { status: 400 }
          );
        }

        if (!ALLOWED_FILE_MIME_TYPES.has(file.type)) {
          return NextResponse.json(
            {
              error: `File type not allowed for "${file.name}".`,
            },
            { status: 400 }
          );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const ext = file.name.split(".").pop();
        const safeName = crypto.randomUUID();

        const key = `submissions/${submissionId}/resource_${
          i + 1
        }/${safeName}.${ext}`;

        const uploaded = await uploadFileToR2(
          buffer,
          key,
          file.type,
          process.env.R2_BUCKET_NAME!,
          process.env.R2_PUBLIC_URL!
        );

        uploadedFiles.push({
          fieldId: "files",
          originalName: file.name,
          size: file.size,
          mimeType: file.type,
          r2Key: key,
          url: uploaded.url,
        });
      }

      submission.resources.push({
        title: res.title,
        description: res.description,
        resourceType: res.resourceType,
        levels: res.levels,
        boards: res.boards,
        madeByMe: res.madeByMe,
        links: res.links,
        files: uploadedFiles,
      });
    }

    await submission.save();

    // Track server-side resource submission
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: email,
      event: "resource_submitted",
      properties: {
        resource_count: resources.length,
        contributor_email: email,
        is_returning_contributor: contributor.totalSubmissions > 1,
      },
    });
    posthog.identify({
      distinctId: email,
      properties: {
        name: fullName,
        email,
        discord_or_reddit_id: discordOrRedditId,
      },
    });

    // =============================
    // 7️⃣ Done
    // =============================
    return NextResponse.json({
      success: true,
      submissionId: submission._id,
    });
  } catch (error) {
    console.error("RESOURCE SUBMIT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to submit resources" },
      { status: 500 }
    );
  }
}
