import { CACHE_HEADERS, invalidateTags } from "@/lib/cache";
import { getCachedCertificateByCertId } from "@/lib/data/certificates";
import { enforceRateLimit } from "@/lib/rateLimit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rlError = await enforceRateLimit(req, "public-certs-detail", {
    limit: 100,
    windowSec: 60,
  });
  if (rlError) return rlError;
  const { id } = await params;

  try {
    const cert = await getCachedCertificateByCertId(id);

    return NextResponse.json(
      {
        message: "Successfully fetched single cert",
        data: cert,
      },
      {
        status: 200,
        headers: CACHE_HEADERS,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch single cert",
        error: error,
      },
      {
        status: 500,
      }
    );
  }
}
