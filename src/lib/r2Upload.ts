// import { PutObjectCommand } from "@aws-sdk/client-s3";
// import { r2 } from "./r2";

// export async function uploadFileToR2(
//   buffer: Buffer,
//   key: string,
//   mimeType: string
// ) {
//   const command = new PutObjectCommand({
//     Bucket: process.env.R2_BUCKET_NAME!,
//     Key: key,
//     Body: buffer,
//     ContentType: mimeType,
//   });

//   await r2.send(command);

//   return {
//     url: `${process.env.R2_PUBLIC_URL}/${key}`,
//   };
// }

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "./r2";

export async function uploadFileToR2(
  buffer: Buffer,
  key: string,
  mimeType: string,
  bucket: string,
  publicUrl: string
) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });

  await r2.send(command);

  return {
    url: `${publicUrl}/${key}`,
  };
}
