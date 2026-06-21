"use client";

import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Chrome } from "lucide-react";

export default function LoginRequiredCard() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-24">
      <Card className="w-full max-w-lg shadow-xl border-muted/60 p-2">
        <CardHeader className="text-center space-y-4 pt-6">
          <CardTitle className="text-3xl font-semibold tracking-tight">
            Login Required
          </CardTitle>
          <CardDescription>
            You must be logged in to submit this form. Sign in with your Google
            account to continue.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 pb-8 pt-2">
          <SignInButton mode="redirect" forceRedirectUrl="/apply">
            <Button
              className="w-full flex items-center justify-center gap-2 py-6 text-base"
              size="lg"
            >
              <Chrome className="h-4 w-4" />
              Continue with Google
            </Button>
          </SignInButton>

          <p className="text-sm text-muted-foreground text-center leading-relaxed px-4">
            Your Google account is used only to identify your submission.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
