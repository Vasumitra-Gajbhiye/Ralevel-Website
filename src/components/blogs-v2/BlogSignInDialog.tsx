"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SignInButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

type BlogSignInDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
};

export default function BlogSignInDialog({
  open,
  onOpenChange,
  title = "Sign in to continue",
  description = "Create a free account or sign in to participate.",
}: BlogSignInDialogProps) {
  const pathname = usePathname();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <SignInButton mode="redirect" forceRedirectUrl={pathname}>
            <Button className="w-full">Sign in</Button>
          </SignInButton>
          <DialogClose asChild>
            <Button variant="ghost" className="w-full">
              Get back to reading
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
