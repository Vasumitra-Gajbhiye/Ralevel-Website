import { getAuthSession } from "@/lib/getAuthSession";
// import mongoDBConnect from "@/libs/mongodb";
// import TeamData from "@/models/teamData";
// import { NextResponse, NextRequest } from "next/server";

// // GET ALL SUBJECTS
// export async function GET(req: NextRequest) {
//   try {
//     await mongoDBConnect();

//     const members = await TeamData.find();

//     return NextResponse.json(
//       {
//         message: "Successfully fetched all members",
//         data: members,
//       },
//       {
//         status: 200,
//       }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       {
//         message: "Failed to fetch all members",
//         error: error,
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }

// // CREATE A SUBJECT
// export async function POST(req: NextRequest) {
//   try {
//     const { name, title, discordId } = await req.json();

//     const newTeamData = {
//       name: name,
//       title: title,
//       discordId: discordId,
//     };

//     await mongoDBConnect();

//     await TeamData.create(newTeamData);

//     return NextResponse.json(
//       {
//         message: "Successfully created a new member",
//         data: newTeamData,
//       },
//       {
//         status: 201,
//       }
//     );
//   } catch (error) {
//     return NextResponse.json({
//       message: "Cannot create a new member",
//       error: error,
//     });
//   }
// }

// export async function DELETE(req: NextRequest) {
//   try {
//     const id = req.nextUrl.searchParams.get("id");

//     console.log(id);

//     await mongoDBConnect();

//     await TeamData.findByIdAndDelete(id);

//     return NextResponse.json(
//       {
//         message: "Member deleted successfully",
//       },
//       {
//         status: 200,
//       }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       {
//         message: "Failed to delete member",
//         error: error,
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }

import { revalidateDataTags } from "@/lib/data-cache";
import { getPaginatedTeamList } from "@/lib/data/team";
import mongoDBConnect from "@/lib/mongodb";
import { parsePaginationParams } from "@/lib/pagination";
import { requireRoles } from "@/lib/requireRoles";
import TeamData from "@/models/teamData";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

/* ================= GET TEAM ================= */
export async function GET(req: NextRequest) {
  try {
    const { page, limit } = parsePaginationParams(req.nextUrl.searchParams);
    const result = await getPaginatedTeamList({ page, limit });

    return NextResponse.json(
      {
        message: "Successfully fetched members",
        ...result,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

/* ================= CREATE MEMBER ================= */
export async function POST(req: NextRequest) {
  const session = await getAuthSession();

  try {
    requireRoles(session, ["owner", "admin"]);

    const body = await req.json();
    const { name, title, discordId } = body;

    if (
      typeof name !== "string" ||
      typeof title !== "string" ||
      typeof discordId !== "string"
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await mongoDBConnect();

    const newMember = await TeamData.create({
      name,
      title,
      discordId,
    });

    revalidateDataTags("team");

    return NextResponse.json(
      {
        message: "Successfully created member",
        data: {
          id: newMember._id,
          name: newMember.name,
          title: newMember.title,
          discordId: newMember.discordId,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

/* ================= DELETE MEMBER ================= */
export async function DELETE(req: NextRequest) {
  const session = await getAuthSession();

  try {
    requireRoles(session, ["owner", "admin"]);

    const id = req.nextUrl.searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await mongoDBConnect();

    const deleted = await TeamData.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    revalidateDataTags("team");

    return NextResponse.json(
      { message: "Member deleted successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
