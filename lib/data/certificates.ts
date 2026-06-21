import { cachedQuery } from "@/lib/data-cache";
import connectDB from "@/lib/mongodb";
import CertData from "@/models/certsData";

export async function getCachedCertificateByCertId(certId: string) {
  return cachedQuery(
    ["certs", "id", certId],
    async () => {
      await connectDB();
      const cert = await CertData.findOne({ certId }).lean();
      return cert ? JSON.parse(JSON.stringify(cert)) : null;
    },
    { revalidate: 900, tags: ["certs", `cert:${certId}`] }
  );
}
