import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import { revalidateDataTags } from "@/lib/data-cache";
import {
  getAdminTeamMembers,
  getNextTeamSortOrder,
  serializeTeamMember,
} from "@/lib/data/admin/team";
import connectDB from "@/lib/mongodb";
import TeamData from "@/models/teamData";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

const TEAM_ADMIN_ROLES = ["owner", "admin"] as const;

function revalidateTeamSurfaces() {
  revalidateDataTags("team");
  revalidatePath("/team");
  revalidatePath("/");
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
    roles: [...TEAM_ADMIN_ROLES],
    rateLimit: { routeKey: "admin-team-list" },
  });
  if (auth instanceof Response) return auth;

  const data = await getAdminTeamMembers();
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...TEAM_ADMIN_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  try {
    const body = await req.json();
    const name = asTrimmedString(body.name, "NAME");
    const title = asTrimmedString(body.title, "TITLE");
    const discordId = asTrimmedString(body.discordId, "DISCORD_ID");
    const linkedin = asOptionalString(body.linkedin) ?? "";
    const imgSrc = asOptionalString(body.imgSrc) ?? "";
    const showOnHomepage = Boolean(body.showOnHomepage);

    await connectDB();
    const sortOrder = await getNextTeamSortOrder();

    const created = await TeamData.create({
      name,
      title,
      discordId,
      linkedin,
      imgSrc,
      showOnHomepage,
      sortOrder,
    });

    revalidateTeamSurfaces();

    return NextResponse.json(
      { data: serializeTeamMember(created.toObject()) },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("INVALID_")) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Create team member error:", error);
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...TEAM_ADMIN_ROLES],
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
      await TeamData.bulkWrite(
        orderedIds.map((id: string, index: number) => ({
          updateOne: {
            filter: { _id: id },
            update: { $set: { sortOrder: index } },
          },
        })),
      );

      revalidateTeamSurfaces();
      return NextResponse.json({ success: true });
    }

    const id = typeof body.id === "string" ? body.id : "";
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const patch: Record<string, string | boolean | number> = {};

    if (body.name !== undefined) {
      patch.name = asTrimmedString(body.name, "NAME");
    }
    if (body.title !== undefined) {
      patch.title = asTrimmedString(body.title, "TITLE");
    }
    if (body.discordId !== undefined) {
      patch.discordId = asTrimmedString(body.discordId, "DISCORD_ID");
    }
    if (body.linkedin !== undefined) {
      patch.linkedin = asOptionalString(body.linkedin) ?? "";
    }
    if (body.imgSrc !== undefined) {
      patch.imgSrc = asOptionalString(body.imgSrc) ?? "";
    }
    if (body.showOnHomepage !== undefined) {
      if (typeof body.showOnHomepage !== "boolean") {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
      }
      patch.showOnHomepage = body.showOnHomepage;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await connectDB();
    const updated = await TeamData.findByIdAndUpdate(
      id,
      { $set: patch },
      { new: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    revalidateTeamSurfaces();
    return NextResponse.json({ data: serializeTeamMember(updated) });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("INVALID_")) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Update team member error:", error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...TEAM_ADMIN_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  try {
    const body = await req.json();
    const id = typeof body.id === "string" ? body.id : "";

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await connectDB();
    const deleted = await TeamData.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    revalidateTeamSurfaces();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete team member error:", error);
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}
