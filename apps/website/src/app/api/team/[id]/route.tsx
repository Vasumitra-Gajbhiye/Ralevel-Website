import { getAuthSession } from "@/lib/getAuthSession";
// import mongoDBConnect from "@/libs/mongodb";
// import TeamData from "@/models/teamData";
// import { NextResponse, NextRequest } from "next/server";

// // GET ALL SUBJECTS
// export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;

//   console.log(id);
//   try {
//     // const searchParams = useSearchParams();

//     // const id = searchParams.get("id");
//     console.log(id);

//     await mongoDBConnect();

//     const subject = await TeamData.findOne({ _id: id });

//     return NextResponse.json(
//       {
//         message: "Successfully fetched single subjects",
//         data: subject,
//       },
//       {
//         status: 200,
//       }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       {
//         message: "Failed to fetch single subjects",
//         error: error,
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }

// export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;

//   console.log(id);
//   let pramasID = id;
//   try {
//     const {
//       newTitle: title,
//       newEmoji: emoji,
//       newLinks: links,
//       newId: id,
//     } = await req.json();

//     const newTeamData = {
//       title: title,
//       emoji: emoji,
//       links: links,
//       id: id,
//     };
//     console.log(pramasID);

//     await mongoDBConnect();

//     await TeamData.findByIdAndUpdate(pramasID, newTeamData);

//     return NextResponse.json(
//       {
//         message: "Successfully updated a new subject",
//         data: newTeamData,
//       },
//       {
//         status: 201,
//       }
//     );
//   } catch (error) {
//     return NextResponse.json({
//       message: "Cannot update a subject",
//       error: error,
//     });
//   }
// }

import mongoDBConnect from "@/lib/mongodb";
import { requireRoles } from "@/lib/requireRoles";
import TeamData from "@/models/teamData";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

/* ================= GET SINGLE MEMBER ================= */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await mongoDBConnect();

    const member = await TeamData.findById(id).select(
      "name title discordId emoji links",
    );

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Successfully fetched member",
        data: member,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch member" },
      { status: 500 },
    );
  }
}

/* ================= UPDATE MEMBER ================= */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getAuthSession();

  try {
    requireRoles(session, ["owner", "admin"]);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();

    const { newTitle, newEmoji, newLinks } = body;

    if (
      (newTitle && typeof newTitle !== "string") ||
      (newEmoji && typeof newEmoji !== "string") ||
      (newLinks && !Array.isArray(newLinks))
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await mongoDBConnect();

    const updated = await TeamData.findByIdAndUpdate(
      id,
      {
        ...(newTitle && { title: newTitle }),
        ...(newEmoji && { emoji: newEmoji }),
        ...(newLinks && { links: newLinks }),
      },
      { new: true },
    ).select("name title emoji links discordId");

    if (!updated) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Member updated successfully",
        data: updated,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
