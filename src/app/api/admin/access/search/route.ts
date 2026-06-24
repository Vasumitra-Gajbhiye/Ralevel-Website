import { authorizeAdminApi } from "@/lib/adminApiAuth";
import connectDB from "@/lib/mongodb";
import UserData from "@/models/userData";
import { NextResponse } from "next/server";

/* ---------------- SEARCH USERS BY EMAIL ---------------- */
export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin"],
    rateLimit: { routeKey: "admin-access-search" },
  });
  if (auth instanceof Response) return auth;

  await connectDB();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const users = await UserData.find({
    email: { $regex: `^${q}`, $options: "i" },
  })
    .limit(5)
    .select("email name")
    .lean();

  return NextResponse.json(users);
}
