import { buildKey, getOrSet } from "@/lib/cache";
import connectDB from "@/lib/mongodb";
import CertData from "@/models/certsData";

export async function getCachedCertificateByCertId(certId: string) {
  return getOrSet(
    buildKey("certs", "id", certId),
    async () => {
      await connectDB();
      const cert = await CertData.findOne({ certId }).lean();
      return cert ? JSON.parse(JSON.stringify(cert)) : null;
    },
    { ttlSec: 900, tags: ["certs", `cert:${certId}`] }
  );
}
