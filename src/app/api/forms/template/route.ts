import { getAuthSession } from "@/lib/getAuthSession";
import { buildCreateFormFromCycle, type SourceFormForCopy } from "@/lib/forms/buildCreateFormFromCycle";
import connectDB from "@/lib/mongodb";
import { canManageFormType, type Role } from "@/lib/roles";
import Form from "@/models/Form";
import FormIndex from "@/models/FormIndex";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getAuthSession();
  const roles = session?.userData?.roles as Role[] | undefined;

  const { searchParams } = new URL(req.url);
  const formType = searchParams.get("formType");
  const cycleIdParam = searchParams.get("cycleId");

  if (!formType || !cycleIdParam) {
    return NextResponse.json(
      { error: "formType and cycleId are required" },
      { status: 400 },
    );
  }

  const cycleId = Number(cycleIdParam);
  if (!Number.isInteger(cycleId) || cycleId < 1) {
    return NextResponse.json({ error: "Invalid cycleId" }, { status: 400 });
  }

  if (!canManageFormType(roles, formType)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const [sourceForm, formIndex, latestForm] = await Promise.all([
    Form.findOne({ formType, cycleId }).lean(),
    FormIndex.findOne({ slug: formType }).select("activeCycleId").lean(),
    Form.findOne({ formType }).sort({ cycleId: -1 }).select("cycleId").lean(),
  ]);

  if (!sourceForm || Array.isArray(sourceForm)) {
    return NextResponse.json({ error: "Cycle not found" }, { status: 404 });
  }

  const activeCycleId =
    formIndex && !Array.isArray(formIndex)
      ? (formIndex.activeCycleId as number | undefined)
      : undefined;
  const latestCycleId =
    latestForm && !Array.isArray(latestForm)
      ? (latestForm.cycleId as number | undefined)
      : undefined;

  const nextCycleId = (activeCycleId ?? latestCycleId ?? 0) + 1;

  const template = buildCreateFormFromCycle(
    sourceForm as unknown as SourceFormForCopy,
    {
      formType,
      nextCycleId,
    },
  );

  return NextResponse.json({
    template,
    source: {
      cycleId: sourceForm.cycleId,
      title: sourceForm.title,
      slug: sourceForm.slug,
    },
    nextCycleId,
  });
}
