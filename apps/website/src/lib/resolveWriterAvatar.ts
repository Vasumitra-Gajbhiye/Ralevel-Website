const cloudinaryBase = () =>
  `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/ralevel`;

/** Resolve a writer avatar to a loadable src (full URL, site path, or Cloudinary key). */
export function resolveWriterAvatar(src: string): string {
  const trimmed = src.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/writer_avatars/")) {
    return `${cloudinaryBase()}${trimmed}`;
  }
  if (trimmed.startsWith("/")) {
    return trimmed;
  }
  return `${cloudinaryBase()}/${trimmed}`;
}

export function isExternalImageUrl(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://");
}
