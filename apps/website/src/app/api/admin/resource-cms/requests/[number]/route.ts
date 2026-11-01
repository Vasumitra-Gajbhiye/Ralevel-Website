import { getChangeRequestDetail } from "@/lib/data/admin/resource-change-requests";
import {
  authorizeChangeRequestRoute,
  notFound,
  parseRequestNumber,
} from "@/lib/resource-cms/requests/route";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ number: string }> },
) {
  const ctx = await authorizeChangeRequestRoute(req);
  if (ctx instanceof Response) return ctx;

  const number = parseRequestNumber((await context.params).number);
  if (!number) return notFound();

  const detail = await getChangeRequestDetail(number);
  if (!detail) return notFound();
  return NextResponse.json(detail);
}
