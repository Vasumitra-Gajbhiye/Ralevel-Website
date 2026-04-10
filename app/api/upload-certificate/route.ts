// // app/api/upload-certificate/route.ts
// import { v2 as cloudinary } from "cloudinary";
// import { NextRequest, NextResponse } from "next/server";

// // Configure Cloudinary with your environment variables
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// });

// export async function POST(req: NextRequest) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("file") as File;
//     const certId = formData.get("certId") as string;

//     if (!file || !certId) {
//       return NextResponse.json(
//         { error: "Missing file or certId" },
//         { status: 400 }
//       );
//     }

//     // Convert the File object to a Node.js Buffer for streaming
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     // Exact path structure requested
//     // Note: For raw files in Cloudinary, the extension MUST be included in the public_id
//     const exactPublicId = `ralevel/cert_pdf_doc/${certId}-pdf.pdf`;

//     const uploadResult = await new Promise((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         {
//           public_id: exactPublicId,
//           resource_type: "raw", // "raw" is required for PDFs and non-image files
//           access_control: [{ access_type: "anonymous" }],
//           overwrite: true,
//         },
//         (error, result) => {
//           if (error) reject(error);
//           else resolve(result);
//         }
//       );

//       // Pipe the buffer into the stream
//       uploadStream.end(buffer);
//     });

//     return NextResponse.json({ success: true, result: uploadResult });
//   } catch (error) {
//     console.error("Upload error:", error);
//     return NextResponse.json({ error: "Upload failed" }, { status: 500 });
//   }
// }

// app/api/upload-certificate/route.ts
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

// Configure Cloudinary with your environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const certId = formData.get("certId") as string;

    if (!file || !certId) {
      return NextResponse.json(
        { error: "Missing file or certId" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const exactPublicId = `ralevel/cert_pdf_doc/${certId}-pdf.pdf`;

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: exactPublicId,
          resource_type: "raw",
          access_control: [{ access_type: "anonymous" }],

          // 👇 ALREADY REPLACES THE FILE ON CLOUDINARY
          overwrite: true,

          // 🔥 NEW: FORCES THE CDN TO FORGET THE OLD PDF INSTANTLY
          invalidate: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({ success: true, result: uploadResult });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
