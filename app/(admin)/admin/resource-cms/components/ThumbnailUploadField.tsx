"use client";

import {
  MAX_THUMBNAIL_SIZE_BYTES,
  THUMBNAIL_ACCEPT,
} from "../constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cldImage } from "@/lib/cloudinary";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

type ThumbnailUploadFieldProps = {
  label: string;
  existingPath?: string;
  pendingFile: File | null;
  onPendingFileChange: (file: File | null) => void;
  onClearExisting: () => void;
  clearedExisting: boolean;
};

export default function ThumbnailUploadField({
  label,
  existingPath,
  pendingFile,
  onPendingFileChange,
  onClearExisting,
  clearedExisting,
}: ThumbnailUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const showExisting = existingPath && !clearedExisting && !pendingFile;
  const displaySrc = pendingFile
    ? previewUrl
    : showExisting
      ? cldImage(existingPath)
      : null;

  function handleFileChange(file: File | null) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (!file) {
      onPendingFileChange(null);
      return;
    }

    if (!THUMBNAIL_ACCEPT.split(",").includes(file.type)) {
      return;
    }

    if (file.size > MAX_THUMBNAIL_SIZE_BYTES) {
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    onPendingFileChange(file);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    handleFileChange(file);
  }

  function handleRemove() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onPendingFileChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    if (existingPath && !clearedExisting) {
      onClearExisting();
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {displaySrc ? (
        <div className="flex items-start gap-3">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
            <Image
              src={displaySrc}
              alt="Thumbnail preview"
              fill
              className="object-cover"
              unoptimized={Boolean(pendingFile)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500 transition hover:border-slate-400 hover:bg-slate-100"
        >
          <Upload className="h-5 w-5" />
          <span>Choose image</span>
          <span className="text-xs">JPEG, PNG, or WebP up to 5MB</span>
        </button>
      )}

      <p className="text-xs text-slate-500">
        Optional. Falls back to default on live page if omitted.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={THUMBNAIL_ACCEPT}
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}

export async function uploadThumbnail(
  file: File,
  section: "books" | "youtubeChannel" | "youtubePlaylist",
  slug: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("section", section);
  formData.append("slug", slug);

  const res = await fetch("/api/admin/resource-cms/upload-thumbnail", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Failed to upload thumbnail");
  }

  return data.path as string;
}
