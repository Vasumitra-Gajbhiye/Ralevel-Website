const cloudinaryBase = () => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  if (!cloudName) {
    throw new Error(
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is missing or empty. Set it at build time.",
    );
  }
  return `https://res.cloudinary.com/${cloudName}/image/upload/ralevel`;
};

/** Resolve a writer avatar to a loadable src (full URL, site path, or Cloudinary key). */
export function resolveWriterAvatar(src: string): string {
  const trimmed = src.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/writer_avatars/")) {
    return `${cloudinaryBase()}/${trimmed.replace(/^\/+|\/+$/g, "")}`;
  }
  if (trimmed.startsWith("/")) {
    return trimmed;
  }
  return `${cloudinaryBase()}/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

export function isExternalImageUrl(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://");
}
