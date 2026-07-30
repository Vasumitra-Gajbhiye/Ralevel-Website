const cloudinaryBase = () =>
  `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/ralevel`;

export function hasBlogHeroImage(image?: string | null): boolean {
  return Boolean(image?.trim());
}

/** Resolve a blog hero image to a loadable src (full URL, site path, or Cloudinary key). */
export function resolveBlogHeroImage(src: string): string {
  const trimmed = src.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  return `${cloudinaryBase()}/${trimmed}`;
}

export function isExternalImageUrl(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://");
}

/** Absolute URL for Open Graph / meta tags. */
export function toAbsoluteBlogImageUrl(src: string, siteOrigin: string): string {
  const trimmed = src.trim();
  if (isExternalImageUrl(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${siteOrigin}${trimmed}`;
  return `${siteOrigin}/${trimmed}`;
}
