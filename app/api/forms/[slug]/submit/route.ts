import { authOptions } from "@/lib/auth";
import { confirmationEmail } from "@/lib/emails/confirmationEmail";
import connectDB from "@/lib/mongodb";
import { getPostHogClient } from "@/lib/posthog-server";
import { uploadFileToR2 } from "@/lib/r2Upload";
import { enforceRateLimit } from "@/lib/rateLimit";
import Form from "@/models/Form";
import FormSubmission from "@/models/FormSubmission";
import crypto from "crypto";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const MAX_FILES_PER_SUBMISSION = 10;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_FILE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
]);
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const sessionEmail = session?.user?.email ?? undefined;
  // Basic slug validation
  if (!slug || typeof slug !== "string" || slug.length > 100) {
    return NextResponse.json({ error: "Invalid form slug." }, { status: 400 });
  }
  // Global request size protection (~15MB max request)
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  const rlError = await enforceRateLimit(req, `form-submit:${slug}`, {
    limit: 5, // 5 submissions per 5 minutes per IP per form
    windowSec: 5 * 60,
  });
  if (rlError) return rlError;

  await connectDB();

  // Fetch form definition early (needed for file path structure)
  const form = await Form.findOne({ slug });

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  if (form.status !== "open") {
    return NextResponse.json(
      { error: "This form is currently closed" },
      { status: 400 }
    );
  }

  let body: any = {};
  let uploadedFiles: any[] = [];
  let pendingFiles: { fieldId: string; file: File }[] = [];

  const contentType = req.headers.get("content-type") || "";

  // -------------------------
  // MULTIPART FORM (files)
  // -------------------------
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    // Honeypot anti-spam check
    const honeypot = formData.get("website");
    if (honeypot) {
      return NextResponse.json({ error: "Spam detected" }, { status: 400 });
    }
    const responsesRaw = formData.get("responses");
    if (responsesRaw) {
      try {
        body.responses = JSON.parse(responsesRaw.toString());
      } catch {
        return NextResponse.json(
          { error: "Invalid responses JSON" },
          { status: 400 }
        );
      }
    }

    const submissionId = new mongoose.Types.ObjectId().toString();

    const rawEntries = Array.from(formData.entries()).filter(([key]) =>
      key.startsWith("files:")
    );

    if (rawEntries.length > MAX_FILES_PER_SUBMISSION) {
      return NextResponse.json(
        { error: `Too many files. Maximum is ${MAX_FILES_PER_SUBMISSION}.` },
        { status: 400 }
      );
    }

    for (const [fieldKey, file] of rawEntries) {
      if (!(file instanceof File)) continue;

      const fieldId = fieldKey.replace("files:", "");

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

      const duplicate = pendingFiles.find(
        (f) =>
          f.fieldId === fieldId &&
          f.file.name === file.name &&
          f.file.size === file.size
      );

      if (!duplicate) {
        pendingFiles.push({
          fieldId,
          file,
        });
      }
    }

    body.__submissionId = submissionId;
  }
  // -------------------------
  // JSON FORM (no files)
  // -------------------------
  else {
    try {
      body = await req.json();
      // Honeypot anti-spam check
      if (body.website) {
        return NextResponse.json({ error: "Spam detected" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  }

  // 2️⃣ Validate + Normalize responses
  // Ensure responses object exists
  if (!body.responses || typeof body.responses !== "object") {
    return NextResponse.json(
      { error: "Invalid submission payload." },
      { status: 400 }
    );
  }
  const sanitizedResponses: Record<string, any> = {};

  let submitterName: string | undefined;
  let submitterEmail: string | undefined;

  for (const section of form.sections ?? []) {
    const sectionResponses = body?.responses?.[section.id] || {};
    sanitizedResponses[section.id] = {};

    for (const field of section.fields ?? []) {
      let value = sectionResponses?.[field.id];

      const isOptionField = ["select", "checkbox", "radio"].includes(
        field.type
      );

      // -------------------------
      // REQUIRED CHECK
      // -------------------------
      if (field.required) {
        const isEmpty =
          value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0);

        if (isEmpty) {
          return NextResponse.json(
            { error: `Missing required field: ${field.label}` },
            { status: 400 }
          );
        }
      }

      // -------------------------
      // OPTION FIELDS VALIDATION
      // -------------------------
      if (isOptionField) {
        const allowedOptions = field.options || [];

        let valuesArray: string[] = [];

        if (Array.isArray(value)) {
          valuesArray = value;
        } else if (typeof value === "string" && value !== "") {
          valuesArray = [value];
        }

        // Strip invalid options
        valuesArray = valuesArray.filter((v) => {
          if (v.startsWith("__OTHER__:")) return field.allowOther;
          return allowedOptions.includes(v);
        });

        // Radio → single only
        if (field.type === "radio") {
          valuesArray = valuesArray.slice(0, 1);
        }

        // Enforce maxSelections
        if (field.maxSelections !== undefined) {
          valuesArray = valuesArray.slice(0, field.maxSelections);
        }

        // Enforce minSelections
        if (
          field.minSelections !== undefined &&
          valuesArray.length < field.minSelections
        ) {
          return NextResponse.json(
            {
              error: `Minimum ${field.minSelections} selections required for ${field.label}`,
            },
            { status: 400 }
          );
        }

        // Normalize single vs multiple
        if (!field.multiple && field.type !== "checkbox") {
          sanitizedResponses[section.id][field.id] = valuesArray[0] ?? null;
        } else {
          sanitizedResponses[section.id][field.id] = valuesArray;
        }

        continue;
      }

      // -------------------------
      // NON OPTION FIELDS
      // -------------------------
      if (value !== undefined && value !== null && value !== "") {
        sanitizedResponses[section.id][field.id] = value;

        // Auto-detect submitter email
        if (field.type === "email" && !submitterEmail) {
          submitterEmail = value;
        }

        // Auto-detect submitter name
        if (
          field.type === "text" &&
          field.label.toLowerCase().includes("name") &&
          !submitterName
        ) {
          submitterName = value;
        }
      }
    }

    // Remove empty sections
    if (Object.keys(sanitizedResponses[section.id]).length === 0) {
      delete sanitizedResponses[section.id];
    }
  }

  // -------------------------
  // REQUIRED FILE FIELD VALIDATION
  // -------------------------
  for (const section of form.sections ?? []) {
    for (const field of section.fields ?? []) {
      if (field.type !== "file") continue;
      if (!field.required) continue;

      const hasFile = pendingFiles.some((f) => f.fieldId === field.id);

      if (!hasFile) {
        return NextResponse.json(
          {
            success: false,
            type: "FILE_REQUIRED",
            message: `${field.label} is required.`,
          },
          { status: 400 }
        );
      }
    }
  }

  if (pendingFiles.length > 0) {
    const submissionId =
      body.__submissionId || new mongoose.Types.ObjectId().toString();

    body.__submissionId = submissionId;

    const uploads = pendingFiles.map(async ({ fieldId, file }) => {
      const buffer = Buffer.from(await file.arrayBuffer());

      // const ext = file.name.split(".").pop();
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      const safeName = crypto.randomUUID();

      const key = `forms/${slug}/${submissionId}/${safeName}.${ext}`;

      const uploaded = await uploadFileToR2(
        buffer,
        key,
        file.type,
        process.env.R2_FORMS_BUCKET_NAME!,
        process.env.R2_FORMS_PUBLIC_URL!
      );

      return {
        fieldId,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        key,
        url: uploaded.url,
      };
    });

    uploadedFiles = await Promise.all(uploads);

    body.__uploadedFiles = uploadedFiles;
  }

  let submission;
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    submission = await FormSubmission.create({
      _id: body.__submissionId ? body.__submissionId : undefined,
      formSlug: slug,
      responses: sanitizedResponses,
      cycleId: form.cycleId,
      formType: form.formType,
      submitterName,
      submitterEmail,
      sessionEmail,
      files: body.__uploadedFiles || [],
      metadata: {
        ip:
          req.headers.get("x-forwarded-for") ??
          req.headers.get("x-real-ip") ??
          undefined,
        userAgent: req.headers.get("user-agent") ?? undefined,
      },
    });
    console.log("created");
    if (submitterEmail) {
      const emailRl = await enforceRateLimit(req, `email-send:${slug}`, {
        limit: 3,
        windowSec: 10 * 60,
      });

      if (!emailRl) {
        await resend.emails.send({
          from: "r/alevel <application@ralevel.com>", // must match verified domain
          to: submitterEmail,
          subject: `We received your application`,
          html: confirmationEmail({
            name: submitterName,
            formTitle: form.title.replace(/\s+Intake\s+\d+$/i, ""),
          }),
        });
      }
    }
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          type: "DUPLICATE_SUBMISSION",
          message: "You have already submitted this form for this intake.",
        },
        { status: 409 } // 🔥 better than 400
      );
    }

    console.error(err);

    return NextResponse.json(
      {
        success: false,
        type: "SERVER_ERROR",
        message: "Something went wrong.",
      },
      { status: 500 }
    );
  }

  // 4️⃣ Increment response count
  form.responseCount++;
  await form.save();

  // Track server-side form submission
  const posthog = getPostHogClient();
  const distinctId = sessionEmail ?? submission._id.toString();
  posthog.capture({
    distinctId,
    event: "form_submitted",
    properties: {
      form_slug: slug,
      form_title: form.title,
      form_type: form.formType,
      has_files: uploadedFiles.length > 0,
      submitter_email: submitterEmail,
    },
  });

  return NextResponse.json(
    {
      success: true,
      submissionId: submission._id.toString(),
    },
    { status: 201 }
  );
}
