"use server";

import connectDB from "@/lib/mongodb";
import CertData from "@/models/certsData";

export async function createCertificate(data: {
  certId: string;
  name: string;
  email: string;
  certType: string;
  applicationID: string;
  discordUserId: string;
  hasCustomMessage?: boolean;
  message?: string;
  admin: string;
  owner: string;
  handler: string | null | undefined;
}) {
  await connectDB();
  try {
    const cert = await CertData.create({
      ...data,
      issueDate: null,
      customMessage: data.message,
      certificateDesigned: false,
      certificateDelivered: false,
    });
    return JSON.parse(JSON.stringify(cert));
  } catch (err: any) {
    // Mongo duplicate key error
    if (err.code === 11000) {
      throw new Error("DUPLICATE_CERT_ID");
    }
    throw err;
  }
}
export async function updateCertificate(data: {
  _id: string;
  name: string;
  email?: string;
  certType: string;
  applicationID?: string;
  discordUserId?: string;
  owner?: string;
  admin?: string;
  handler?: string | null;
  hasCustomMessage?: boolean;
  message?: string;
  certificateDelivered?: boolean;
  issueDate?: Date | null;
}) {
  await connectDB();

  const updated = await CertData.findByIdAndUpdate(
    data._id,
    {
      $set: {
        name: data.name,
        email: data.email,
        certType: data.certType,
        applicationID: data.applicationID,
        discordUserId: data.discordUserId,
        owner: data.owner,
        admin: data.admin,
        handler: data.handler,
        hasCustomMessage: data.hasCustomMessage,
        customMessage: data.message,
        certificateDelivered: data.certificateDelivered,
        issueDate: data.issueDate ?? null, // ✅ key line
      },
    },
    { new: true }
  ).lean();

  return JSON.parse(JSON.stringify(updated));
}

export async function deleteCertificate(id: string) {
  await connectDB();

  const deleted = await CertData.findByIdAndDelete(id).lean();

  if (!deleted) {
    throw new Error("NOT_FOUND");
  }

  return { success: true };
}
