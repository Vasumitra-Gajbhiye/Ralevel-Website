import { getAuthSession } from "@/lib/getAuthSession";
import { revalidateDataTags } from "@/lib/data-cache";
import { getPaginatedCertificateList } from "@/lib/data/certificates";
import connectDB from "@/lib/mongodb";
import { parsePaginationParams } from "@/lib/pagination";
import { enforceRateLimit } from "@/lib/rateLimit";
import { requireRoles } from "@/lib/requireRoles";
import CertData from "@/models/certsData";
import { NextRequest, NextResponse } from "next/server";

// GET ALL SUBJECTS
export async function GET(req: NextRequest) {
  try {
    const rlError = await enforceRateLimit(req, "public-certs-list", {
      limit: 100,
      windowSec: 60,
    });
    if (rlError) return rlError;

    const { page, limit } = parsePaginationParams(req.nextUrl.searchParams);
    const result = await getPaginatedCertificateList({ page, limit });

    return NextResponse.json(
      {
        message: "Successfully fetched certs",
        ...result,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch all certs",
        error: error,
      },
      {
        status: 500,
      }
    );
  }
}

// CREATE A SUBJECT
export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  try {
    requireRoles(session, ["owner", "admin"]);
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { name, certType, certId, issueDate, admin, owner } =
      await req.json();

    const newCertData = {
      name: name,
      certType: certType,
      certId: certId,
      issueDate: issueDate,
      adimn: admin,
      owner: owner,
    };

    await connectDB();

    await CertData.create(newCertData);

    const tags = ["certs"];
    if (certId) tags.push(`cert:${certId}`);
    revalidateDataTags(...tags);

    return NextResponse.json(
      {
        message: "Successfully created a new cert",
        data: newCertData,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return NextResponse.json({
      message: "Cannot create a new cert",
      error: error,
    });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAuthSession();
  try {
    requireRoles(session, ["owner", "admin"]);
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const id = req.nextUrl.searchParams.get("id");

    await connectDB();

    const deleted = await CertData.findByIdAndDelete(id);
    const tags = ["certs"];
    if (deleted?.certId) tags.push(`cert:${deleted.certId}`);
    revalidateDataTags(...tags);

    return NextResponse.json(
      {
        message: "Cert deleted successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to delete cert",
        error: error,
      },
      {
        status: 500,
      }
    );
  }
}
