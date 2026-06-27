"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Settings2 } from "lucide-react";
import type { BlogMetadata } from "./blogMetadata";

type BlogEditorDetailsPopoverProps = {
  metadata: BlogMetadata;
  onMetadataChange: (metadata: BlogMetadata) => void;
};

export default function BlogEditorDetailsPopover({
  metadata,
  onMetadataChange,
}: BlogEditorDetailsPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-neutral-500">
          <Settings2 className="h-4 w-4" />
          Details
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500">Author</Label>
          <Input
            value={metadata.author ?? ""}
            onChange={(e) =>
              onMetadataChange({ ...metadata, author: e.target.value })
            }
            placeholder="Author name"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500">Date</Label>
          <Input
            type="date"
            value={metadata.date ?? ""}
            onChange={(e) =>
              onMetadataChange({ ...metadata, date: e.target.value })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500">Read time (minutes)</Label>
          <Input
            type="number"
            min={1}
            max={999}
            value={metadata.readTimeMinutes ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              onMetadataChange({
                ...metadata,
                readTimeMinutes: raw ? Number(raw) : undefined,
              });
            }}
            placeholder="e.g. 7"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500">Tags</Label>
          <Input
            value={metadata.tag ?? ""}
            onChange={(e) =>
              onMetadataChange({ ...metadata, tag: e.target.value })
            }
            placeholder="A-levels, Biology"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
