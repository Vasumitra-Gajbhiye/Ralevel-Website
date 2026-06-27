const DEFAULT_SITE_URL = "https://ralevel.com";

export const DUMMY_BLOG_SHARE_URL = `${DEFAULT_SITE_URL}/blogs/v2/your-post-title`;

export function getBlogPublicSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_URL?.trim();
  if (!raw) return DEFAULT_SITE_URL;
  return raw.replace(/\/$/, "");
}

export function getBlogPublicShareUrl(slug: string): string {
  return `${getBlogPublicSiteUrl()}/blogs/v2/${slug}`;
}

export function resolveBlogShareUrl(
  slug: string | null | undefined,
  shareLive: boolean,
): string {
  if (shareLive && slug?.trim()) {
    return getBlogPublicShareUrl(slug.trim());
  }
  return DUMMY_BLOG_SHARE_URL;
}

export type BlogSharePlatform = "x" | "facebook" | "linkedin" | "whatsapp";

export function buildBlogSocialShareUrl(
  platform: BlogSharePlatform,
  url: string,
  title?: string,
): string {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title?.trim() || "Check out this post");

  switch (platform) {
    case "x":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(`${title?.trim() || "Check out this post"} ${url}`)}`;
  }
}
