import { isApplyCardStatus, type ApplyFormCardData } from "@/lib/apply-cards";
import connectDB from "@/lib/mongodb";
import FormIndex from "@/models/FormIndex";
import { Types } from "mongoose";

export type AdminApplyCard = ApplyFormCardData & {
  _id: string;
  slug: string;
  order: number;
  activeCycleId: number | null;
};

type FormIndexDoc = {
  _id: Types.ObjectId;
  slug?: string;
  title?: string;
  description?: string;
  status?: string;
  gradient?: string;
  icon?: string;
  logo?: string;
  steps?: string[];
  ctaText?: string;
  order?: number;
  activeCycleId?: number;
};

export function serializeApplyCard(doc: FormIndexDoc): AdminApplyCard {
  const status = doc.status ?? "";
  return {
    _id: String(doc._id),
    slug: doc.slug ?? "",
    title: doc.title ?? "",
    description: doc.description ?? "",
    status: isApplyCardStatus(status) ? status : "open",
    gradient: doc.gradient ?? "from-slate-500 to-slate-700",
    icon: doc.icon ?? "FileText",
    logo: doc.logo || undefined,
    steps: Array.isArray(doc.steps)
      ? doc.steps.filter((step): step is string => typeof step === "string")
      : [],
    ctaText: doc.ctaText ?? "",
    order: typeof doc.order === "number" ? doc.order : 0,
    activeCycleId:
      typeof doc.activeCycleId === "number" ? doc.activeCycleId : null,
  };
}

export async function getAdminApplyCards(): Promise<AdminApplyCard[]> {
  await connectDB();
  const cards = await FormIndex.find()
    .select(
      "slug title description status gradient icon logo steps ctaText order activeCycleId",
    )
    .sort({ order: 1 })
    .lean<FormIndexDoc[]>();

  return cards.map(serializeApplyCard);
}
