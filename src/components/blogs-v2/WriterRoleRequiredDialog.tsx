"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type WriterRoleRequiredDialogProps = {
  open: boolean;
};

export default function WriterRoleRequiredDialog({
  open,
}: WriterRoleRequiredDialogProps) {
  const router = useRouter();
  const { user } = useUser();
  const [granting, setGranting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function grantWriterRole() {
    setGranting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/writer-access/self", {
        method: "POST",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to add writer role");
      }
      await user?.reload();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add writer role",
      );
    } finally {
      setGranting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md [&>button.absolute]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Writer role required</DialogTitle>
          <DialogDescription>
            You need the writer role to create and manage blogs. Add it to your
            account to continue using the blog CMS.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            className="w-full"
            onClick={grantWriterRole}
            disabled={granting}
          >
            {granting ? "Adding role…" : "Add writer role to me"}
          </Button>
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/admin">Back to admin</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
