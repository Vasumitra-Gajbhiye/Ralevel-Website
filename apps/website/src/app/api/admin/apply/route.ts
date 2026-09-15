import { authorizeAdminApi } from "@/lib/adminApiAuth";
import {
  isApplyCardIconName,
  isApplyCardStatus,
} from "@/lib/apply-cards";
import { enforceSameOrigin } from "@/lib/csrf";
import {
  getAdminApplyCards,
  serializeApplyCard,
} from "@/lib/data/admin/applyCards";
import connectDB from "@/lib/mongodb";
import FormIndex from "@/models/FormIndex";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

const APPLY_CARD_ADMIN_ROLES = ["owner", "admin"] as const;

function revalidateApplySurfaces() {
  revalidatePath("/apply");
}

function asTrimmedString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`INVALID_${field}`);
  }
  return value.trim();
}

function asOptionalString(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new Error("INVALID_INPUT");
  }
  return value.trim();
}

export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...APPLY_CARD_ADMIN_ROLES],
    rateLimit: { routeKey: "admin-apply-list" },
  });
  if (auth instanceof Response) return auth;

  const data = await getAdminApplyCards();
  return NextResponse.json({ data });
}

export async function PATCH(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...APPLY_CARD_ADMIN_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  try {
    const body = await req.json();

    if (Array.isArray(body.orderedIds)) {
      const orderedIds = body.orderedIds.filter(
        (id: unknown): id is string =>
          typeof id === "string" && mongoose.Types.ObjectId.isValid(id),
      );

      if (orderedIds.length === 0) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
      }

      await connectDB();
      await FormIndex.bulkWrite(
        orderedIds.map((id: string, index: number) => ({
          updateOne: {
            filter: { _id: id },
            update: { $set: { order: index } },
          },
        })),
      );

      revalidateApplySurfaces();
      return NextResponse.json({ success: true });
    }

    const id = typeof body.id === "string" ? body.id : "";
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const patch: Record<string, string | string[]> = {};

    if (body.title !== undefined) {
      patch.title = asTrimmedString(body.title, "TITLE");
    }
    if (body.description !== undefined) {
      patch.description = asTrimmedString(body.description, "DESCRIPTION");
    }
    if (body.ctaText !== undefined) {
      patch.ctaText = asTrimmedString(body.ctaText, "CTA_TEXT");
    }
    if (body.gradient !== undefined) {
      patch.gradient = asTrimmedString(body.gradient, "GRADIENT");
    }
    if (body.icon !== undefined) {
      const icon = asTrimmedString(body.icon, "ICON");
      if (!isApplyCardIconName(icon)) {
        throw new Error("INVALID_ICON");
      }
      patch.icon = icon;
    }
    if (body.logo !== undefined) {
      patch.logo = asOptionalString(body.logo) ?? "";
    }
    if (body.status !== undefined) {
      if (typeof body.status !== "string" || !isApplyCardStatus(body.status)) {
        throw new Error("INVALID_STATUS");
      }
      patch.status = body.status;
    }
    if (body.steps !== undefined) {
      if (!Array.isArray(body.steps)) {
        throw new Error("INVALID_STEPS");
      }
      patch.steps = body.steps
        .filter((step: unknown): step is string => typeof step === "string")
        .map((step: string) => step.trim())
        .filter(Boolean);
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await connectDB();
    const updated = await FormIndex.findByIdAndUpdate(
      id,
      { $set: patch },
      { new: true },
    ).lean<Parameters<typeof serializeApplyCard>[0] | null>();

    if (!updated) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    revalidateApplySurfaces();
    return NextResponse.json({ data: serializeApplyCard(updated) });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("INVALID_")) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Update apply card error:", error);
    return NextResponse.json(
      { error: "Failed to update card" },
      { status: 500 },
    );
  }
}
