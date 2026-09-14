import { cldImage } from "@/lib/cloudinary";

export function dicebearUrl(name: string): string {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name || "member")}`;
}

export function isExternalImageUrl(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://");
}

/** Resolve a team photo to a loadable src (full URL, Cloudinary path, or Dicebear fallback). */
export function resolveTeamImage(
  imgSrc?: string | null,
  name = "",
): string {
  const trimmed = imgSrc?.trim();
  if (!trimmed) return dicebearUrl(name);

  if (isExternalImageUrl(trimmed)) return trimmed;

  if (trimmed.startsWith("/team_avatars/")) {
    return cldImage(trimmed);
  }

  if (trimmed.startsWith("/")) return trimmed;

  return cldImage(trimmed);
}
