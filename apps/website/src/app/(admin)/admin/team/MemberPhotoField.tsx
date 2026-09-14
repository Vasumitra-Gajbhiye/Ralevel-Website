"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  isExternalImageUrl,
  resolveTeamImage,
} from "@/lib/resolveTeamImage";
import { Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";

type MemberPhotoFieldProps = {
  memberKey: string;
  value: string;
  name: string;
  onChange: (value: string) => void;
};

function defaultTabForImage(value: string): "url" | "upload" {
  if (!value) return "upload";
  if (value.startsWith("/team_avatars/")) return "upload";
  if (isExternalImageUrl(value)) return "url";
  return "upload";
}

export default function MemberPhotoField({
  memberKey,
  value,
  name,
  onChange,
}: MemberPhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<"url" | "upload">(() =>
    defaultTabForImage(value),
  );

  const previewSrc = resolveTeamImage(value, name);

  async function handleFileSelect(file: File | null) {
    if (!file) return;

    if (!PHOTO_ACCEPT.split(",").includes(file.type)) {
      toast.error("File must be JPEG, PNG, or WebP");
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("memberKey", memberKey);

      const res = await fetch("/api/admin/team/upload-photo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Upload failed");
      }

      onChange(data.path as string);
      setTab("upload");
      toast.success("Photo uploaded");
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

  function handleRemove() {
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs text-neutral-500">Photo</Label>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "url" | "upload")}
        className="w-full"
      >
        <TabsList className="h-8 bg-neutral-100">
          <TabsTrigger value="upload" className="h-6 px-3 text-xs">
            Upload
          </TabsTrigger>
          <TabsTrigger value="url" className="h-6 px-3 text-xs">
            URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="mt-2 space-y-2">
          <Input
            value={isExternalImageUrl(value) || !value ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="h-8 text-sm"
          />
        </TabsContent>

        <TabsContent value="upload" className="mt-2">
          {uploading ? (
            <div className="flex items-center gap-2 py-3 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading…
            </div>
          ) : value && tab === "upload" && !isExternalImageUrl(value) ? (
            <div className="flex items-start gap-3">
              <img
                src={previewSrc}
                alt="Photo preview"
                className="h-16 w-16 shrink-0 rounded-full border border-neutral-200 bg-neutral-50 object-cover"
              />
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

      {tab === "url" && value && isExternalImageUrl(value) && (
        <img
          src={previewSrc}
          alt="Photo preview"
          className="h-16 w-16 rounded-full border border-neutral-200 bg-neutral-50 object-cover"
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept={PHOTO_ACCEPT}
        className="hidden"
        onChange={(event) => {
          void handleFileSelect(event.target.files?.[0] ?? null);
        }}
      />
    </div>
  );
}
