"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  hasBlogHeroImage,
  isExternalImageUrl,
  resolveBlogHeroImage,
} from "@/lib/blogHeroImage";
import { Pencil } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import BlogHeroImageField from "./BlogHeroImageField";
import BlogHeroPlaceholder from "./BlogHeroPlaceholder";

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
  const heroSrc = hasBlogHeroImage(image) ? resolveBlogHeroImage(image) : null;

  return (
    <>
      <div className="group relative mt-8">
        <div className="rounded-2xl overflow-hidden shadow-md aspect-[2/1] w-full">
          {heroSrc ? (
            <Image
              src={heroSrc}
              alt="Blog hero"
              width={1200}
              height={600}
              unoptimized={isExternalImageUrl(heroSrc)}
              className="object-cover h-full w-full"
              priority
            />
          ) : (
            <BlogHeroPlaceholder />
          )}
        </div>

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
