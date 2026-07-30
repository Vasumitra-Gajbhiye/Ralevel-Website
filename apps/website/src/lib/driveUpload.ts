// import { Readable } from "stream";
// import { drive } from "./googleDrive";

// export async function createDriveFolder(name: string, parentId: string) {
//   const res = await drive.files.create({
//     requestBody: {
//       name,
//       mimeType: "application/vnd.google-apps.folder",
//       parents: [parentId],
//     },
//     fields: "id",
//   });

//   return res.data.id!;
// }

// export async function uploadFileToDrive(
//   buffer: Buffer,
//   fileName: string,
//   mimeType: string,
//   parentFolderId: string
// ) {
//   const stream = Readable.from(buffer);

//   const res = await drive.files.create({
//     requestBody: {
//       name: fileName,
//       parents: [parentFolderId],
//     },
//     media: {
//       mimeType,
//       body: stream,
//     },
//     fields: "id, webViewLink",
//   });

//   return res.data;
// }

import { Buffer } from "buffer";
import { google } from "googleapis";
import { Readable } from "stream";
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);

// Fix newline formatting
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

export async function createDriveFolder(name: string, parentId: string) {
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    supportsAllDrives: true,

    fields: "id",
  });

  return res.data.id!;
}

export async function uploadFileToDrive(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  parentFolderId: string
) {
  const stream = Readable.from(buffer);

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [parentFolderId],
    },
    media: {
      mimeType,
      body: stream,
    },
    supportsAllDrives: true,

    fields: "id, webViewLink",
  });

  return res.data;
}
