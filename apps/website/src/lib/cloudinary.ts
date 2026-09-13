import "dotenv/config";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();

if (!CLOUD_NAME) {
  throw new Error(
    "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is missing or empty. Set it at build time.",
  );
}

const BASE = `https://res.cloudinary.com/${CLOUD_NAME}`;

const normalizePath = (path: string) => path.replace(/^\/+|\/+$/g, "");

export const cldImage = (path: string) =>
  `${BASE}/image/upload/ralevel/${normalizePath(path)}`;

export const cldRaw = (path: string) =>
  `${BASE}/raw/upload/ralevel/${normalizePath(path)}`;
