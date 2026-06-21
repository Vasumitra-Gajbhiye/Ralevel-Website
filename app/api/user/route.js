import { getAuthSession } from "@/lib/getAuthSession";
// // app/api/user/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/libs/mongodb";
// import UserData from "@/models/userData";

// /**
//  * POST /api/user
//  * Body: { email: string }
//  * Returns: user payload for profile page
//  */
// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { email } = body || {};

//     if (!email || typeof email !== "string") {
//       return NextResponse.json(
//         { error: "Missing or invalid 'email' in request body" },
//         { status: 400 }
//       );
//     }

//     // ensure DB connection
//     await connectDB();

//     // find user by email
//     const user = await UserData.findOne({ email }).lean();

//     if (!user) {
//       return NextResponse.json(
//         { error: "User not found" },
//         { status: 404 }
//       );
//     }

//     // Normalize fields so client always receives expected types
//     const payload = {
//       name: user.name ?? "",
//       email: user.email ?? "",
//       boards: Array.isArray(user.boards) ? user.boards : [],
//       subjectsAS: Array.isArray(user.subjectsAS) ? user.subjectsAS : [],
//       subjectsA2: Array.isArray(user.subjectsA2) ? user.subjectsA2 : [],
//       // ensure examSession is an array (you requested multiple sessions)
//       examSession: Array.isArray(user.examSession)
//         ? user.examSession
//         : user.examSession
//         ? [user.examSession]
//         : [],
//       receiveEmails: typeof user.receiveEmails === "boolean" ? user.receiveEmails : false,
//     };

//     return NextResponse.json(payload, { status: 200 });
//   } catch (err) {
//     console.error("Error in /api/user:", err);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// app/api/user/route.js
// app/api/user/route.js
import connectDB from "@/lib/mongodb";
import UserData from "@/models/userData";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // 1) Ensure user is authenticated and derive identity from the session
    const session = await getAuthSession();
    const email = session?.user?.email;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Strict same-origin check to reduce CSRF risk for cookie-based auth
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");

    if (!origin || !host) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const user = await UserData.findOne({ email }).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const payload = {
      name: user.name ?? "",
      email: user.email ?? "",
      boards: Array.isArray(user.boards) ? user.boards : [],
      subjectsAS: Array.isArray(user.subjectsAS) ? user.subjectsAS : [],
      subjectsA2: Array.isArray(user.subjectsA2) ? user.subjectsA2 : [],
      examSession: Array.isArray(user.examSession)
        ? user.examSession
        : user.examSession
        ? [user.examSession]
        : [],
      receiveEmails:
        typeof user.receiveEmails === "boolean" ? user.receiveEmails : false,
      redditUsername: user.redditUsername ?? "",
      discordUsername: user.discordUsername ?? "",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    console.error("Error in /api/user:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
