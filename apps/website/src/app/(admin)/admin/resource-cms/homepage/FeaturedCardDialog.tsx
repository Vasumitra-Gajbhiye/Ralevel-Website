"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FeaturedCard } from "@/types/resources2";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import ThumbnailUploadField, {
  uploadThumbnail,
} from "../components/ThumbnailUploadField";

const MAX_DESCRIPTION_LENGTH = 200;

type FeaturedCardDialogProps = {
  open: boolean;
  card?: FeaturedCard;
  onOpenChange: (open: boolean) => void;
  onSave: (card: FeaturedCard) => void;
};

export default function FeaturedCardDialog({
  open,
  card,
  onOpenChange,
  onSave,
}: FeaturedCardDialogProps) {
  const [title, setTitle] = useState("");
  const [href, setHref] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [clearedExisting, setClearedExisting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(card?.title ?? "");
      setHref(card?.href ?? "");
      setDescription(card?.description ?? "");
      setBadge(card?.badge ?? "");
      setPendingFile(null);
      setClearedExisting(false);
      setIsUploading(false);
      setError(null);
    }
  }, [open, card]);

  async function handleSave() {
    const link = href.trim();
    if (!title.trim() || !link) {
      setError("Title and link are required");
      return;
    }
    if (!link.startsWith("/") && !/^https?:\/\//.test(link)) {
      setError("Link must start with / (this site) or https://");
      return;
    }

    let image = clearedExisting ? undefined : card?.image;
    if (pendingFile) {
      setIsUploading(true);
      try {
        image = await uploadThumbnail(pendingFile, "featured", "homepage");
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Failed to upload image",
        );
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    onSave({
      title: title.trim(),
      href: link,
      ...(description.trim() && { description: description.trim() }),
      ...(badge.trim() && { badge: badge.trim() }),
      ...(image && { image }),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{card ? "Edit" : "Add"} featured card</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="featured-title">Title *</Label>
            <Input
              id="featured-title"
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="featured-href">Link *</Label>
            <Input
              id="featured-href"
              value={href}
              placeholder="/resources/chemistry or https://"
              onChange={(e) => setHref(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="featured-description">Description</Label>
            <Textarea
              id="featured-description"
              value={description}
              maxLength={MAX_DESCRIPTION_LENGTH}
              rows={3}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="text-right text-xs text-slate-400">
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="featured-badge">Badge</Label>
            <Input
              id="featured-badge"
              value={badge}
              maxLength={20}
              placeholder="e.g. New"
              onChange={(e) => setBadge(e.target.value)}
            />
          </div>
          <ThumbnailUploadField
            label="Image (16:9)"
            existingPath={card?.image}
            pendingFile={pendingFile}
            onPendingFileChange={setPendingFile}
            onClearExisting={() => setClearedExisting(true)}
            clearedExisting={clearedExisting}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUploading}>
            {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
            {card ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
