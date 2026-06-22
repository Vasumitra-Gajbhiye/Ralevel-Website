import { v2 as cloudinary } from "cloudinary";
import type { ThumbnailSection } from "@/types/resources2";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const THUMBNAIL_FOLDER_MAP: Record<ThumbnailSection, string> = {
  books: "books_thumb",
  youtubeChannel: "youtube_thumb",
  youtubePlaylist: "playlist_thumb",
};

function extensionFromMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

export function thumbnailFolderForSection(section: ThumbnailSection): string {
  return THUMBNAIL_FOLDER_MAP[section];
}

export function publicIdToThumbnailPath(
  publicId: string,
  extension: string
): string {
  const withoutPrefix = publicId.replace(/^ralevel\//, "");
  return `/${withoutPrefix}.${extension}`;
}

type UploadImageOptions = {
  section: ThumbnailSection;
  slug: string;
  mimeType: string;
  uniqueId: string;
};

export async function uploadImageToCloudinary(
  buffer: Buffer,
  { section, slug, mimeType, uniqueId }: UploadImageOptions
): Promise<{ path: string }> {
  const folder = thumbnailFolderForSection(section);
  const extension = extensionFromMime(mimeType);
  const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "-");
  const publicId = `ralevel/${folder}/${safeSlug}-${uniqueId}`;

  const result = await new Promise<{ public_id: string; format: string }>(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: "image",
          overwrite: false,
          invalidate: true,
        },
        (error, uploadResult) => {
          if (error) reject(error);
          else if (!uploadResult?.public_id) {
            reject(new Error("Cloudinary upload returned no public_id"));
          } else {
            resolve({
              public_id: uploadResult.public_id,
              format: uploadResult.format ?? extension,
            });
          }
        }
      );

      uploadStream.end(buffer);
    }
  );

  return {
    path: publicIdToThumbnailPath(result.public_id, result.format),
  };
}
