import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import CertData from "@/models/certsData";
import { Types } from "mongoose";
import { getServerSession } from "next-auth";
import CertificatesAdminPage, { Certificate } from "./certificateClient";

// 🔒 Define DB type explicitly (important)
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

export default async function Certificates() {
  const session = await getServerSession(authOptions);
  await connectDB();

  // ✅ lean + explicit type
  const certificates = await CertData.find()
    .sort({ createdAt: -1 })
    .lean<CertDoc[]>();

  // ✅ clean DTO mapping
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
    hasCustomMessage: doc.hasCustomMessage,
    discordUserId: doc.discordUserId,
    certificateDesigned: doc.certificateDesigned,
    certificateDelivered: doc.certificateDelivered,
    dateGiven: doc.dateGiven,
  }));

  return (
    <CertificatesAdminPage
      initialCertificates={data}
      handler={session?.user.name}
    />
  );
}
