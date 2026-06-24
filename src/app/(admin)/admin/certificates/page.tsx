import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import {
  buildPaginatedResponse,
  parsePaginationParams,
} from "@/lib/pagination";
import CertData from "@/models/certsData";
import { Types } from "mongoose";
import CertificatesAdminPage, { Certificate } from "./certificateClient";

type CertDoc = {
  _id: Types.ObjectId;
  admin: string;
  certId: string;
  certType: string;
  issueDate: Date;
  name: string;
  owner: string;
  email?: string;
  handler: string;
  discordUserId?: string;
  applicationID?: string;
  certificateDesigned?: boolean;
  hasCustomMessage?: boolean;
  customMessage?: string;
  certificateDelivered?: boolean;
  dateGiven?: string;
};

export default async function Certificates({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getAuthSession();
  await connectDB();

  const params = await searchParams;
  const { page, limit, skip } = parsePaginationParams(
    new URLSearchParams({ page: params.page ?? "1" }),
  );

  const [certificates, total] = await Promise.all([
    CertData.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<CertDoc[]>(),
    CertData.countDocuments(),
  ]);

  const data: Certificate[] = certificates.map((doc) => ({
    _id: doc._id.toString(),
    admin: doc.admin,
    certId: doc.certId,
    certType: doc.certType,
    issueDate: doc.issueDate,
    applicationID: doc.applicationID,
    name: doc.name,
    owner: doc.owner,
    email: doc.email,
    handler: doc.handler,
    customMessage: doc.customMessage,
    message: doc.customMessage,
    hasCustomMessage: doc.hasCustomMessage,
    discordUserId: doc.discordUserId,
    certificateDesigned: doc.certificateDesigned,
    certificateDelivered: doc.certificateDelivered,
    dateGiven: doc.dateGiven,
  }));

  const pagination = buildPaginatedResponse(
    data,
    total,
    page,
    limit,
  ).pagination;

  return (
    <CertificatesAdminPage
      initialCertificates={data}
      pagination={pagination}
      handler={session?.user.name}
    />
  );
}
