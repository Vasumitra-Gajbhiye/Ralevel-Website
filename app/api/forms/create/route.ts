import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import Form from "@/models/Form";
import FormIndex from "@/models/FormIndex";
import { NextResponse } from "next/server";

type IntroBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "bullet_list";
      bulletColor: string;
      items: string[];
    };

type FieldType =
  | "text"
  | "email"
  | "textarea"
  | "select"
  | "file"
  | "url"
  | "checkbox"
  | "radio";
type FormField = {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];

  // 🔥 NEW
  multiple?: boolean;
  minSelections?: number;
  maxSelections?: number;

  allowOther?: boolean;
};

type FormSection = {
  id: string;
  title: string;
  subtitle?: string;
  fields: FormField[];
};

type Form = {
  title: string;
  slug: string;
  formType: string;
  banner: {
    type: "gradient";
    value: string;
  };
  ctaText: string;
  introductionBlocks: IntroBlock[];
  sections: FormSection[];
  confirmationMessage: {
    title: string;
    body: string[];
    contactEmail: string;
  };
};

export async function POST(req: Request) {
  // 1) Auth: only admins/owners can create forms
  const session = await getAuthSession();
  const roles = session?.userData?.roles as string[] | undefined;

  if (!roles || !roles.some((r) => ["owner", "admin"].includes(r))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2) Basic origin check to reduce CSRF risk
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && !origin.includes(host)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  let body: Form;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.title || !body.slug || !body.formType) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const [existingSlug, prevForm] = await Promise.all([
    Form.findOne({ slug: body.slug }),
    Form.findOne({ formType: body.formType }).sort({ cycleId: -1 }),
  ]);
  if (existingSlug) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
  }

  const prevCycleId = prevForm ? prevForm.cycleId : 0;
  // 🔥 Validate select fields
  // 🔥 Validate select fields
  for (const section of body.sections) {
    for (const field of section.fields) {
      if (["select", "checkbox", "radio"].includes(field.type)) {
        // Radio cannot be multiple
        if (field.type === "radio") {
          field.multiple = false;
          field.minSelections = undefined;
          field.maxSelections = undefined;
        }
        // Must have options
        if (!field.options || field.options.length === 0) {
          return NextResponse.json(
            { error: `Select field "${field.label}" must have options` },
            { status: 400 }
          );
        }

        // If NOT multiple, clear limits
        if (!field.multiple) {
          field.minSelections = undefined;
          field.maxSelections = undefined;
        }

        // If multiple → validate limits
        if (field.multiple) {
          if (field.minSelections !== undefined && field.minSelections < 0) {
            return NextResponse.json(
              { error: `Invalid min selections in "${field.label}"` },
              { status: 400 }
            );
          }

          if (field.maxSelections !== undefined && field.maxSelections < 1) {
            return NextResponse.json(
              { error: `Invalid max selections in "${field.label}"` },
              { status: 400 }
            );
          }

          if (
            field.minSelections !== undefined &&
            field.maxSelections !== undefined &&
            field.minSelections > field.maxSelections
          ) {
            return NextResponse.json(
              { error: `Min selections cannot exceed max in "${field.label}"` },
              { status: 400 }
            );
          }
        }

        // Normalize allowOther
        field.allowOther = Boolean(field.allowOther);
      }
    }
  }

  // 🔥 Normalize select fields before saving
  for (const section of body.sections) {
    for (const field of section.fields) {
      if (!["select", "checkbox", "radio"].includes(field.type)) {
        field.options = [];
        field.multiple = false;
        field.minSelections = undefined;
        field.maxSelections = undefined;
        field.allowOther = false;
      }
    }
  }
  const newForm = await Form.create({
    banner: body.banner,
    title: body.title,
    slug: body.slug,
    status: "open",
    ctaText: body.ctaText,
    introductionBlocks: body.introductionBlocks,
    sections: body.sections,
    cycleId: prevCycleId + 1,
    formType: body.formType,
  });

  if (prevForm) {
    prevForm.status = "permanently-closed";
    await prevForm.save();
  }

  await FormIndex.updateOne(
    { slug: body.formType },
    { $inc: { activeCycleId: 1 } }
  );

  return NextResponse.json({ success: true }, { status: 201 });
}
