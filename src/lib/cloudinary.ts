import "dotenv/config";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;

const BASE = `https://res.cloudinary.com/${CLOUD_NAME}`;

export const cldImage = (path: string) =>
  `${BASE}/image/upload/ralevel/${path}`;

export const cldRaw = (path: string) => `${BASE}/raw/upload/ralevel/${path}`;
