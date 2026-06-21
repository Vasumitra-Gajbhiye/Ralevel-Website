import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
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
    await connectDB();

    const certs = await CertData.find();

    return NextResponse.json(
      {
        message: "Successfully fetched all certs",
        data: certs,
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

    console.log(id);

    await connectDB();

    await CertData.findByIdAndDelete(id);

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
