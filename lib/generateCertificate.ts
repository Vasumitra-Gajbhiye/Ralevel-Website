// import fs from "fs";
// import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// function formatDate(dateString: string) {
//   const date = new Date(dateString);

//   const day = date.getDate().toString().padStart(2, "0");

//   const months = [
//     "jan",
//     "feb",
//     "mar",
//     "apr",
//     "may",
//     "jun",
//     "jul",
//     "aug",
//     "sep",
//     "oct",
//     "nov",
//     "dec",
//   ];

//   const month = months[date.getMonth()];
//   const year = date.getFullYear();

//   return `${day} ${month} ${year}`;
// }
// function splitText(text: string, font: any, size: number, maxWidth: number) {
//   const words = text.split(" ");
//   let lines: string[] = [];
//   let currentLine = "";

//   for (const word of words) {
//     const testLine = currentLine ? currentLine + " " + word : word;
//     const width = font.widthOfTextAtSize(testLine, size);

//     if (width < maxWidth) {
//       currentLine = testLine;
//     } else {
//       lines.push(currentLine);
//       currentLine = word;
//     }
//   }

//   if (currentLine) lines.push(currentLine);

//   return lines;
// }
// export async function generateCertificate({
//   name,
//   certId,
//   issueDate,
//   message,
// }: {
//   name: string;
//   certId: string;
//   issueDate: string;
//   message: string;
// }) {
//   // 1. Load existing PDF template
//   const templateBytes = fs.readFileSync("public/certificate-template.pdf");
//   const pdfDoc = await PDFDocument.load(templateBytes);

//   const maxWidth = 450; // 👈 tweak this
//   const fontSize = 40;

//   // 2. Get first page
//   const page = pdfDoc.getPages()[0];
//   const { width, height } = page.getSize();

//   // 3. Load font
//   const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
//   const fontLight = await pdfDoc.embedFont(StandardFonts.Helvetica);

//   // 4. Add NAME

//   let baseFontSize = 40;

//   // First pass (detect line count)
//   let lines = splitText(name, font, baseFontSize, maxWidth);

//   // 👇 adjust font size based on lines
//   let adjustedFontSize = baseFontSize;

//   if (lines.length === 2) {
//     adjustedFontSize = 32;
//   } else if (lines.length >= 3) {
//     adjustedFontSize = 28;
//   }

//   // 👇 recompute lines with new size (VERY IMPORTANT)
//   lines = splitText(name, font, adjustedFontSize, maxWidth);

//   // recalc layout
//   const lineHeight = adjustedFontSize + 10;
//   const totalHeight = lines.length * lineHeight;

//   let startY = height / 2 + 57 + totalHeight / 2;

//   // draw
//   lines.forEach((line, i) => {
//     const textWidth = font.widthOfTextAtSize(line, adjustedFontSize);

//     page.drawText(line, {
//       x: (width - textWidth) / 2,
//       y: startY - i * lineHeight,
//       size: adjustedFontSize,
//       font,
//       color: rgb(0.1, 0.2, 0.5),
//     });
//   });

//   // 5. Add MESSAGE

//   const messageFontSize = 16;
//   const messageMaxWidth = 500; // 👈 wider than name

//   const messageLines = splitText(
//     message,
//     fontLight,
//     messageFontSize,
//     messageMaxWidth
//   );

//   const messageLineHeight = messageFontSize + 6;
//   const messageTotalHeight = messageLines.length * messageLineHeight;

//   // 👇 base Y (adjust visually later)
//   let messageStartY = height / 2 - 20 + messageTotalHeight / 2;

//   messageLines.forEach((line, i) => {
//     const textWidth = font.widthOfTextAtSize(line, messageFontSize);

//     page.drawText(line, {
//       x: (width - textWidth) / 2,
//       y: messageStartY - i * messageLineHeight,
//       size: messageFontSize,
//       font: fontLight,
//       color: rgb(0.373, 0.549, 0.859), // slightly lighter than name
//     });
//   });

//   // 6. Add DATE
//   page.drawText(formatDate(issueDate), {
//     x: width - 50,
//     y: 14,
//     size: 6,
//     color: rgb(1, 1, 1),
//   });

//   // 7. Add Cert ID
//   page.drawText(`${certId}`, {
//     x: width - 71,
//     y: 22,
//     size: 7,
//     color: rgb(1, 1, 1),
//   });

//   // 8. Add QR
//   const qrBytes = fs.readFileSync("public/temp-qr.png");
//   const qrImage = await pdfDoc.embedPng(qrBytes);

//   page.drawImage(qrImage, {
//     x: width - 92,
//     y: 40,
//     width: 80,
//     height: 80,
//   });

//   // 9. Export
//   const pdfBytes = await pdfDoc.save();

//   return pdfBytes;
// }

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { getQRCodeBuffer } from "./qrGenerator";
// Assume formatDate and splitText are defined here as in your original code

function splitText(text: string, font: any, size: number, maxWidth: number) {
  const words = text.split(" ");
  let lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? currentLine + " " + word : word;
    const width = font.widthOfTextAtSize(testLine, size);

    if (width < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);

  return lines;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);

  const day = date.getDate().toString().padStart(2, "0");

  const months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];

  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

export async function generateAndDownloadCertificate({
  name,
  certId,
  issueDate,
  message,
}: {
  name: string;
  certId: string;
  issueDate: string;
  message: string;
}) {
  // 1. Fetch template from the public folder (replaces fs)
  const templateRes = await fetch("/certificate-template.pdf");
  const templateBytes = await templateRes.arrayBuffer();
  const pdfDoc = await PDFDocument.load(templateBytes);

  const maxWidth = 450;
  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontLight = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // --- NAME LOGIC ---
  let baseFontSize = 40;
  let lines = splitText(name, font, baseFontSize, maxWidth);
  let adjustedFontSize = baseFontSize;

  if (lines.length === 2) {
    adjustedFontSize = 32;
  } else if (lines.length >= 3) {
    adjustedFontSize = 28;
  }

  lines = splitText(name, font, adjustedFontSize, maxWidth);
  const lineHeight = adjustedFontSize + 10;
  const totalHeight = lines.length * lineHeight;
  let startY = height / 2 + 57 + totalHeight / 2;

  lines.forEach((line, i) => {
    const textWidth = font.widthOfTextAtSize(line, adjustedFontSize);
    page.drawText(line, {
      x: (width - textWidth) / 2,
      y: startY - i * lineHeight,
      size: adjustedFontSize,
      font,
      color: rgb(0.1, 0.2, 0.5),
    });
  });

  // --- MESSAGE LOGIC ---
  const messageFontSize = 16;
  const messageMaxWidth = 500;
  const messageLines = splitText(
    message,
    fontLight,
    messageFontSize,
    messageMaxWidth
  );
  const messageLineHeight = messageFontSize + 6;
  const messageTotalHeight = messageLines.length * messageLineHeight;
  let messageStartY = height / 2 - 20 + messageTotalHeight / 2;

  messageLines.forEach((line, i) => {
    const textWidth = font.widthOfTextAtSize(line, messageFontSize);
    page.drawText(line, {
      x: (width - textWidth) / 2,
      y: messageStartY - i * messageLineHeight,
      size: messageFontSize,
      font: fontLight,
      color: rgb(0.373, 0.549, 0.859),
    });
  });

  // --- DATE & ID ---
  page.drawText(formatDate(issueDate), {
    x: width - 50,
    y: 14,
    size: 6,
    color: rgb(1, 1, 1),
  });

  page.drawText(`${certId}`, {
    x: width - 71,
    y: 22,
    size: 7,
    color: rgb(1, 1, 1),
  });

  // --- 8. DYNAMIC QR INTEGRATION ---
  // Await the buffer from your QR function
  const qrArrayBuffer = await getQRCodeBuffer(certId);
  const qrImage = await pdfDoc.embedPng(qrArrayBuffer);

  page.drawImage(qrImage, {
    x: width - 92,
    y: 40,
    width: 80,
    height: 80,
  });

  // --- 9. Export, Download & Upload ---
  const pdfBytes = await pdfDoc.save();

  // 1. Prepare the Blob and File Name
  // 🔥 Fix: Cast pdfBytes to any to bypass the strict ArrayBuffer type mismatch
  const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
  const fileName = `${certId}-pdf.pdf`;

  // 2. Trigger Local Browser Download immediately
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  // Cleanup local download objects
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  // 3. Upload to Cloudinary via your new API Route in the background
  const formData = new FormData();
  formData.append("file", blob, fileName);
  formData.append("certId", certId);

  try {
    const response = await fetch("/api/upload-certificate", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      console.log(
        "✅ Successfully uploaded to Cloudinary:",
        data.result.secure_url
      );

      // Optional: Return the secure URL so your UI knows it finished
      return data.result.secure_url;
    } else {
      console.error("❌ Cloudinary upload failed:", data.error);
    }
  } catch (error) {
    console.error("❌ Failed to reach upload API:", error);
  }
}
