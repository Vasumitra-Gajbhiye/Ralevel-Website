import connectDB from "@/lib/mongodb";
import CertData from "@/models/certsData";
import { Types } from "mongoose";
import CertificatesAdminPage, { Certificate } from "./certificateClient";

// 🔒 Define DB type explicitly (important)
type CertDoc = {
  _id: Types.ObjectId;
  admin: string;
  certId: string;
  certType: string;
  issueDate: string;
  name: string;
  owner: string;
  email?: string;
  discordUserId?: string;
  certificateDesigned?: boolean;
  certificateDelivered?: boolean;
  dateGiven?: string;
};

export default async function Certificates() {
  await connectDB();

  // ✅ lean + explicit type
  const certificates = await CertData.find().lean<CertDoc[]>();

  // ✅ clean DTO mapping
  const data: Certificate[] = certificates.map((doc) => ({
    _id: doc._id.toString(),
    admin: doc.admin,
    certId: doc.certId,
    certType: doc.certType,
    issueDate: doc.issueDate,
    name: doc.name,
    owner: doc.owner,
    email: doc.email,
    discordUserId: doc.discordUserId,
    certificateDesigned: doc.certificateDesigned,
    certificateDelivered: doc.certificateDelivered,
    dateGiven: doc.dateGiven,
  }));

  return <CertificatesAdminPage initialCertificates={data} />;
}
