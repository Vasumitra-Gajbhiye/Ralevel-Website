import { cn } from "@/lib/utils";

type BlogHeroPlaceholderProps = {
  className?: string;
};

/** Default 2:1 grey hero when no image URL or upload is set. */
export default function BlogHeroPlaceholder({
  className,
}: BlogHeroPlaceholderProps) {
  return (
    <svg
      viewBox="0 0 12 6"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("block h-full w-full", className)}
      aria-hidden
    >
      <rect width="12" height="6" fill="#E5E5E5" />
    </svg>
  );
}
