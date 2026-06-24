// import QRCodeStyling from "qr-code-styling";

// export function downloadQRCode(certId: string) {
//   const qrCode = new QRCodeStyling({
//     width: 500,
//     height: 500,
//     data: `https://www.ralevel.com/certificates/${certId}`,

//     image: "/ralevel_logo_png_white.png",

//     dotsOptions: {
//       color: "#22B8CF",
//       type: "rounded",
//     },

//     cornersSquareOptions: {
//       type: "extra-rounded",
//     },

//     cornersDotOptions: {
//       type: "dot",
//     },

//     backgroundOptions: {
//       color: "#ffffff",
//     },

//     imageOptions: {
//       crossOrigin: "anonymous",
//       margin: 5,
//     },
//   });

//   // 🔥 THIS is what you were missing
//   qrCode.download({
//     name: `certificate-${certId}`,
//     extension: "png",
//   });
// }
// import QRCodeStyling from "qr-code-styling";

// export async function getQRCodeBuffer(certId: string): Promise<ArrayBuffer> {
//   const qrCode = new QRCodeStyling({
//     width: 500,
//     height: 500,
//     data: `https://www.ralevel.com/certificates/${certId}`,
//     image: "/ralevel_logo_png_white.png",
//     dotsOptions: {
//       color: "#22B8CF",
//       type: "rounded",
//     },
//     cornersSquareOptions: {
//       type: "extra-rounded",
//     },
//     cornersDotOptions: {
//       type: "dot",
//     },
//     backgroundOptions: {
//       color: "#ffffff",
//     },
//     imageOptions: {
//       crossOrigin: "anonymous",
//       margin: 5,
//     },
//   });

//   // Extract the raw image data as a Blob, then convert to ArrayBuffer
//   const blob = await qrCode.getRawData("png") as Blob;
//   if (!blob) throw new Error("Failed to generate QR code");

//   return await blob.arrayBuffer();
// }
import QRCodeStyling from "qr-code-styling";

// Updated helper function
// Updated helper function using FileReader
async function applyRoundedCorners(
  imageBufferOrBlob: any,
  radius: number
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const realBlob = new Blob([imageBufferOrBlob], { type: "image/png" });

    // 🔥 THE FIX: Convert the blob to a base64 "data:" URI instead of a "blob:" URL
    const reader = new FileReader();

    reader.onloadend = () => {
      // Once the reader finishes converting, setup the image
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.beginPath();
        ctx.roundRect(0, 0, canvas.width, canvas.height, radius);
        ctx.clip();

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(async (roundedBlob) => {
          if (!roundedBlob) return reject(new Error("Canvas toBlob failed"));
          resolve(await roundedBlob.arrayBuffer());
        }, "image/png");
      };

      img.onerror = () => {
        reject(new Error("Failed to load image for clipping"));
      };

      // Assign the base64 string (which starts with "data:image/png;base64...")
      img.src = reader.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read blob as Data URL"));

    // Trigger the conversion
    reader.readAsDataURL(realBlob);
  });
}

export async function getQRCodeBuffer(certId: string): Promise<ArrayBuffer> {
  const qrCode = new QRCodeStyling({
    width: 500,
    height: 500,
    data: `https://www.ralevel.com/certificates/${certId}`,
    image: "/ralevel_logo_png_white.png",
    dotsOptions: {
      color: "#22B8CF",
      type: "rounded",
    },
    cornersSquareOptions: {
      type: "extra-rounded",
    },
    cornersDotOptions: {
      type: "dot",
    },
    backgroundOptions: {
      color: "#ffffff",
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 5,
    },
  });

  const rawData = await qrCode.getRawData("png");
  if (!rawData) throw new Error("Failed to generate QR code");

  // Pass the rawData directly to the helper.
  // It handles the conversion safely now without needing 'as Blob'
  return await applyRoundedCorners(rawData, 40);
}
