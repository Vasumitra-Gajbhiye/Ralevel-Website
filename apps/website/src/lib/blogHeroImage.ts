const cloudinaryBase = () => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  if (!cloudName) {
    throw new Error(
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is missing or empty. Set it at build time.",
    );
  }
  return `https://res.cloudinary.com/${cloudName}/image/upload/ralevel`;
};

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
  return `${cloudinaryBase()}/${trimmed.replace(/^\/+|\/+$/g, "")}`;
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
