"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserCircle } from "lucide-react";
import type { BlogMetadata } from "./blogMetadata";

type BlogEditorAuthorProfilePopoverProps = {
  metadata: BlogMetadata;
  onMetadataChange: (metadata: BlogMetadata) => void;
};

export default function BlogEditorAuthorProfilePopover({
  metadata,
  onMetadataChange,
}: BlogEditorAuthorProfilePopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-neutral-500">
          <UserCircle className="h-4 w-4" />
          Author profile
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500">Author name</Label>
          <Input
            value={metadata.author ?? ""}
            onChange={(e) =>
              onMetadataChange({ ...metadata, author: e.target.value })
            }
            placeholder="Mark Andrews"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500">Followers</Label>
          <Input
            type="number"
            min={0}
            value={metadata.authorFollowers ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              onMetadataChange({
                ...metadata,
                authorFollowers: raw ? Number(raw) : undefined,
              });
            }}
            placeholder="e.g. 135"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500">Bio</Label>
          <Textarea
            value={metadata.authorBio ?? ""}
            onChange={(e) =>
              onMetadataChange({ ...metadata, authorBio: e.target.value })
            }
            placeholder="A short bio about the author…"
            rows={4}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
