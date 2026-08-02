"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignInButton } from "@clerk/nextjs";
import { Chrome } from "lucide-react";

export default function BanAppealLoginCard() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-24">
      <Card className="w-full max-w-lg border-muted/60 p-2 shadow-xl">
        <CardHeader className="space-y-4 pt-6 text-center">
          <CardTitle className="text-3xl font-semibold tracking-tight">
            Ban Appeal
          </CardTitle>
          <CardDescription>
            Sign in with Google or email to submit a ban appeal. Warning and
            timeout appeals use{" "}
            <a href="/discord-appeal-form" className="underline">
              Discord sign-in
            </a>
            .
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 pb-8 pt-2">
          <SignInButton mode="redirect" forceRedirectUrl="/ban-appeal">
            <Button
              className="flex w-full items-center justify-center gap-2 py-6 text-base"
              size="lg"
            >
              <Chrome className="h-4 w-4" />
              Continue with Google
            </Button>
          </SignInButton>

          <p className="px-4 text-center text-sm leading-relaxed text-muted-foreground">
            Your account email is used to notify you of the appeal decision.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
