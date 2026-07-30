"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  buildBlogSocialShareUrl,
  type BlogSharePlatform,
} from "@/lib/blogs-v2/share";
import { cn } from "@/lib/utils";
import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { FaFacebook, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { toast } from "sonner";

type BlogSharePopoverProps = {
  shareUrl: string;
  shareLive: boolean;
  title?: string;
  triggerClassName?: string;
};

const SOCIAL_LINKS: {
  id: BlogSharePlatform;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "x", label: "X", icon: <FaXTwitter className="h-4 w-4" /> },
  { id: "facebook", label: "Facebook", icon: <FaFacebook className="h-4 w-4" /> },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: <FaLinkedin className="h-4 w-4" />,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: <FaWhatsapp className="h-4 w-4" />,
  },
];

export default function BlogSharePopover({
  shareUrl,
  shareLive,
  title,
  triggerClassName,
}: BlogSharePopoverProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(
        shareLive ? "Link copied" : "Preview link copied (not live yet)",
      );
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  }

  function handleSocialClick(platform: BlogSharePlatform) {
    if (!shareLive) {
      toast.message("Sharing is available after this post is published");
      return;
    }

    const href = buildBlogSocialShareUrl(platform, shareUrl, title);
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-9 px-2 text-neutral-600 hover:text-neutral-900",
            triggerClassName,
          )}
          aria-label="Share post"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-3">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-neutral-900">Share</p>
            {!shareLive && (
              <p className="mt-0.5 text-xs text-neutral-500">
                Preview only — link goes live after publishing
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSocialClick(item.id)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900",
                  !shareLive && "opacity-70",
                )}
                aria-label={`Share on ${item.label}`}
                title={item.label}
              >
                {item.icon}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={shareUrl}
              className="h-8 text-xs text-neutral-600"
              aria-label="Post link"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 shrink-0 px-2.5"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
