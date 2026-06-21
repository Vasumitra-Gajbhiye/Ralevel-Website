import { getAuthSession } from "@/lib/getAuthSession";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: session.user,
    userData: session.userData,
  });
}
