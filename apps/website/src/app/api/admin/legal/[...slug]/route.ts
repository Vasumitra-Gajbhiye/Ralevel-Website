import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import { revalidateDataTags } from "@/lib/data-cache";
import {
  getAdminLegalPage,
  serializeLegalEditor,
} from "@/lib/data/admin/legalPages";
import {
  isLegalPageSlug,
  joinLegalSlug,
  LEGAL_ADMIN_ROLES,
  legalPublicPath,
} from "@/lib/legal-pages";
import { ensureLegalPages } from "@/lib/legal-pages/ensure";
import connectDB from "@/lib/mongodb";
import LegalPage from "@/models/legalPage";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

function revalidateLegalSurfaces(slug: string) {
  revalidateDataTags("legal");
  revalidatePath(legalPublicPath(slug));
}

function asTitle(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("INVALID_TITLE");
  }
  return value.trim();
}

function asContent(value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error("INVALID_CONTENT");
  }
  return value;
}

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string[] }> },
) {
  const auth = await authorizeAdminApi(req, {
    roles: [...LEGAL_ADMIN_ROLES],
    rateLimit: { routeKey: "admin-legal-get" },
  });
  if (auth instanceof Response) return auth;

  const { slug: segments } = await context.params;
  const slug = joinLegalSlug(segments);
  if (!isLegalPageSlug(slug)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = await getAdminLegalPage(slug);
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ slug: string[] }> },
) {
  const auth = await authorizeAdminApi(req, {
    roles: [...LEGAL_ADMIN_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  const { slug: segments } = await context.params;
  const slug = joinLegalSlug(segments);
  if (!isLegalPageSlug(slug)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const title = asTitle(body.title);
    const content = asContent(body.content);

    await connectDB();
    await ensureLegalPages();

    const updated = await LegalPage.findOneAndUpdate(
      { slug },
      {
        $set: {
          draft: {
            title,
            content,
            updatedAt: new Date(),
          },
        },
      },
      { new: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: serializeLegalEditor(updated) });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("INVALID_")) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Save legal draft error:", error);
    return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string[] }> },
) {
  const auth = await authorizeAdminApi(req, {
    roles: [...LEGAL_ADMIN_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  const { slug: segments } = await context.params;
  const slug = joinLegalSlug(segments);
  if (!isLegalPageSlug(slug)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    await connectDB();
    await ensureLegalPages();

    if (action === "discard") {
      const updated = await LegalPage.findOneAndUpdate(
        { slug },
        { $set: { draft: null } },
        { new: true },
      ).lean();

      if (!updated) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      return NextResponse.json({ data: serializeLegalEditor(updated) });
    }

    if (action === "publish") {
      const doc = await LegalPage.findOne({ slug });
      if (!doc) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const title =
        typeof body.title === "string" && body.title.trim()
          ? body.title.trim()
          : doc.draft?.title || doc.title;
      const content = Array.isArray(body.content)
        ? body.content
        : Array.isArray(doc.draft?.content)
          ? doc.draft.content
          : doc.content;

      if (!title) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
      }

      doc.title = title;
      doc.content = content;
      doc.lastPublishedAt = new Date();
      doc.draft = null;
      await doc.save();

      revalidateLegalSurfaces(slug);

      return NextResponse.json({
        data: serializeLegalEditor(doc.toObject()),
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Legal page mutation error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
