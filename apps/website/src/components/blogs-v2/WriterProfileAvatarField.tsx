"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  isExternalImageUrl,
  resolveWriterAvatar,
} from "@/lib/resolveWriterAvatar";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const AVATAR_ACCEPT = "image/jpeg,image/png,image/webp";

type WriterProfileAvatarFieldProps = {
  userId: string;
  value: string;
  onChange: (value: string) => void;
};

function defaultTabForImage(value: string): "url" | "upload" {
  if (!value) return "url";
  if (value.startsWith("/writer_avatars/")) return "upload";
  if (isExternalImageUrl(value) || value.startsWith("/")) return "url";
  return "upload";
}

export default function WriterProfileAvatarField({
  userId,
  value,
  onChange,
}: WriterProfileAvatarFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<"url" | "upload">(() =>
    defaultTabForImage(value),
  );

  const previewSrc = value.trim() ? resolveWriterAvatar(value) : null;

  async function handleFileSelect(file: File | null) {
    if (!file) return;

    if (!AVATAR_ACCEPT.split(",").includes(file.type)) {
      toast.error("File must be JPEG, PNG, or WebP");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);

      const res = await fetch("/api/admin/writer-profile/upload-avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Upload failed");
      }

      onChange(data.path as string);
      setTab("upload");
      toast.success("Avatar uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    void handleFileSelect(file);
  }

  function handleRemove() {
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs text-neutral-500">Avatar</Label>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "url" | "upload")}
        className="w-full"
      >
        <TabsList className="h-8 bg-neutral-100">
          <TabsTrigger value="url" className="text-xs px-3 h-6">
            URL
          </TabsTrigger>
          <TabsTrigger value="upload" className="text-xs px-3 h-6">
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="mt-2 space-y-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="h-8 text-sm"
          />
        </TabsContent>

        <TabsContent value="upload" className="mt-2">
          {uploading ? (
            <div className="flex items-center gap-2 py-3 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading…
            </div>
          ) : previewSrc && tab === "upload" ? (
            <div className="flex items-start gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-neutral-50">
                <Image
                  src={previewSrc}
                  alt="Avatar preview"
                  fill
                  className="object-cover"
                  unoptimized={isExternalImageUrl(previewSrc)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload className="h-3 w-3" />
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-neutral-500"
                  onClick={handleRemove}
                >
                  <X className="h-3 w-3" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-neutral-300 bg-neutral-50/50 px-3 py-4 text-xs text-neutral-500 transition hover:border-neutral-400 hover:bg-neutral-50"
            >
              <Upload className="h-4 w-4" />
              <span>Choose image</span>
              <span className="text-[10px] text-neutral-400">
                JPEG, PNG, or WebP up to 5MB
              </span>
            </button>
          )}
        </TabsContent>
      </Tabs>

      {previewSrc && tab === "url" && (
        <div className="relative h-16 w-16 overflow-hidden rounded-full border border-neutral-200 bg-neutral-50">
          <Image
            src={previewSrc}
            alt="Avatar preview"
            fill
            className="object-cover"
            unoptimized={isExternalImageUrl(previewSrc)}
          />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={AVATAR_ACCEPT}
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
