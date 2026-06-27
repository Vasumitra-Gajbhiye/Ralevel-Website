"use client";

import BlogSignInDialog from "@/components/blogs-v2/BlogSignInDialog";

type BlogLikeSignInDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function BlogLikeSignInDialog({
  open,
  onOpenChange,
}: BlogLikeSignInDialogProps) {
  return (
    <BlogSignInDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Sign in to like"
      description="Create a free account or sign in to like this post and show your support for the author."
    />
  );
}
