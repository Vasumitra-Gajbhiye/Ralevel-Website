import { getUserProfile } from "@/lib/data/user-profile";
import { getAuthSession } from "@/lib/getAuthSession";
import { enforceSameOrigin } from "@/lib/csrf";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getAuthSession();
    const email = session?.user?.email;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const forbidden = enforceSameOrigin(req);
    if (forbidden) return forbidden;

    const profile = await getUserProfile();
    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (err) {
    console.error("Error in /api/user:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
