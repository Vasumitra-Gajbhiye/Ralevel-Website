import { cachedQuery } from "@/lib/data-cache";
import connectDB from "@/lib/mongodb";
import { buildPaginatedResponse } from "@/lib/pagination";
import { redisCached } from "@/lib/redis-cache";
import CertData from "@/models/certsData";

const CERT_LIST_PROJECTION = {
  certId: 1,
  name: 1,
  certType: 1,
  issueDate: 1,
};

type CertListOptions = {
  page?: number;
  limit?: number;
};

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

export async function getCachedCertificateList(options: CertListOptions = {}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 50;
  const skip = (page - 1) * limit;

  return redisCached(
    `certs:list:${page}:${limit}`,
    async () => {
      await connectDB();
      const [data, total] = await Promise.all([
        CertData.find({}, CERT_LIST_PROJECTION)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        CertData.countDocuments(),
      ]);
      return { data, total, page, limit };
    },
    { ttlSec: 600, tags: ["certs"] }
  );
}

export async function getPaginatedCertificateList(options: CertListOptions = {}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 50;
  const result = await getCachedCertificateList({ page, limit });
  return buildPaginatedResponse(result.data, result.total, page, limit);
}
