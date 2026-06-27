"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  isExternalImageUrl,
  resolveBlogHeroImage,
} from "@/lib/blogHeroImage";
import { Pencil } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import BlogHeroImageField from "./BlogHeroImageField";

type BlogEditorHeroProps = {
  blogId: string;
  image: string;
  onImageChange: (value: string) => void;
};

export default function BlogEditorHero({
  blogId,
  image,
  onImageChange,
}: BlogEditorHeroProps) {
  const [open, setOpen] = useState(false);
  const heroSrc = image.trim() ? resolveBlogHeroImage(image) : null;

  return (
    <>
      <div className="group relative mt-8">
        {heroSrc ? (
          <div className="rounded-2xl overflow-hidden shadow-md">
            <Image
              src={heroSrc}
              alt="Blog hero"
              width={1200}
              height={600}
              unoptimized={isExternalImageUrl(heroSrc)}
              className="object-cover w-full aspect-[2/1]"
              priority
            />
          </div>
        ) : (
          <div
            className="w-full aspect-[2/1] rounded-2xl bg-neutral-200"
            aria-hidden
          />
        )}

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="absolute top-3 right-3 h-8 gap-1.5 bg-white/90 shadow-sm"
          onClick={() => setOpen(true)}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hero image</DialogTitle>
          </DialogHeader>
          <BlogHeroImageField
            blogId={blogId}
            value={image}
            onChange={(value) => {
              onImageChange(value);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
