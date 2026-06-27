"use client";

import BlogHistoryTimeline from "@/components/blogs-v2/BlogHistoryTimeline";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type {
  BlogV2HistoryTimelineItem,
  BlogV2VersionSummary,
} from "@/types/blogV2";
import { History } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

type BlogHistorySheetProps = {
  blogId: string;
};

export default function BlogHistorySheet({ blogId }: BlogHistorySheetProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState<BlogV2HistoryTimelineItem[]>([]);
  const [versions, setVersions] = useState<BlogV2VersionSummary[]>([]);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blogs/v2/${blogId}/history`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to load history");
      }
      setTimeline(data.timeline ?? []);
      setVersions(data.versions ?? []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load history",
      );
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      void loadHistory();
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => handleOpenChange(true)}>
        <History className="h-4 w-4 mr-1.5" />
        History
      </Button>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Blog history</SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            {loading ? (
              <p className="text-sm text-neutral-500 py-8 text-center">
                Loading history…
              </p>
            ) : (
              <BlogHistoryTimeline
                blogId={blogId}
                timeline={timeline}
                versions={versions}
                onRestored={loadHistory}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
