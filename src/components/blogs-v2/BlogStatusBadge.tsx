import type { BlogV2Status } from "@/types/blogV2";
import { Badge } from "@/components/ui/badge";

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
  changes_requested: "destructive",
  published: "outline",
};

type BlogStatusBadgeProps = {
  status: BlogV2Status;
  className?: string;
};

export default function BlogStatusBadge({ status, className }: BlogStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]} className={className}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
