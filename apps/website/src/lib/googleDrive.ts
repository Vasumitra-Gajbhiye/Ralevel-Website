// // lib/googleDrive.ts
// import { google } from "googleapis";

// const auth = new google.auth.GoogleAuth({
//   credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!),
//   scopes: ["https://www.googleapis.com/auth/drive"],
// });

// console.log(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

// export const drive = google.drive({
//   version: "v3",
//   auth,
// });

// lib/googleDrive.ts
import { google } from "googleapis";

let _drive: ReturnType<typeof google.drive> | null = null;

export function getDrive() {
  if (_drive) return _drive;

  const credsRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credsRaw) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credsRaw),
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  _drive = google.drive({ version: "v3", auth });
  return _drive;
}
