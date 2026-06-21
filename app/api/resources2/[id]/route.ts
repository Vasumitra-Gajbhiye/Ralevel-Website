import { CACHE_HEADERS } from "@/lib/cache";
import { getCachedResource2ById } from "@/lib/data/resources";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const resData = await getCachedResource2ById(id);

  if (!resData) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(resData, { headers: CACHE_HEADERS });
}
