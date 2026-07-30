import { getAuthSession } from "@/lib/getAuthSession";
import { getDrive } from "@/lib/googleDrive";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1) Only allow admins/owners to use this diagnostic endpoint
    const session = await getAuthSession();
    const roles = session?.userData?.roles as string[] | undefined;

    if (!roles || !roles.some((r) => ["owner", "admin"].includes(r))) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // 2) Basic origin check for CSRF protection on cookie-based auth
    const origin = (globalThis as any).headers?.get("origin") ?? null;
    const host = (globalThis as any).headers?.get("host") ?? null;
    if (origin && host && !origin.includes(host)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }
    const drive = getDrive();

    const res = await drive.files.list({
      q: `'${process.env.DRIVE_ROOT_FOLDER_ID}' in parents`,
      fields: "files(id, name)",
    });

    return NextResponse.json({
      success: true,
      files: res.data.files,
    });
  } catch (error: any) {
    console.error("Drive test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
