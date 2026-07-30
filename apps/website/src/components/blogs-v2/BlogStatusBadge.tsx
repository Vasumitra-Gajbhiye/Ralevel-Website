import type { BlogV2Status } from "@/types/blogV2";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<BlogV2Status, string> = {
  draft: "Draft",
  in_review: "In review",
  changes_requested: "Changes requested",
  published: "Published",
};

const STATUS_VARIANTS: Record<
  BlogV2Status,
  "default" | "secondary" | "destructive" | "outline"
> = {
  draft: "secondary",
  in_review: "default",
  changes_requested: "outline",
  published: "outline",
};

const STATUS_CLASSNAMES: Partial<Record<BlogV2Status, string>> = {
  changes_requested: "border-amber-300 bg-amber-50 text-amber-800",
};

type BlogStatusBadgeProps = {
  status: BlogV2Status;
  className?: string;
};

export default function BlogStatusBadge({ status, className }: BlogStatusBadgeProps) {
  return (
    <Badge
      variant={STATUS_VARIANTS[status]}
      className={cn(STATUS_CLASSNAMES[status], className)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
