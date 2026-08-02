"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SignInButton, useClerk, useUser } from "@clerk/nextjs";
import { Check, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import BanAppealClient from "./BanAppealClient";
import type { DiscordIdentity } from "./types";

export type { DiscordIdentity } from "./types";

type BanAppealPageClientProps = {
  rulesContent: string[];
  initialDiscord: DiscordIdentity | null;
  authError?: string;
};

const APPEAL_PURPLE = "#674AB3";

function discordAvatarUrl(identity: DiscordIdentity): string | null {
  if (!identity.discordAvatar) return null;
  return `https://cdn.discordapp.com/avatars/${identity.discordUserId}/${identity.discordAvatar}.png`;
}

function StatusCircle({ connected }: { connected: boolean }) {
  return (
    <span
      className={cn(
        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2",
        connected
          ? "border-transparent text-white"
          : "border-muted-foreground/40 bg-transparent",
      )}
      style={connected ? { backgroundColor: APPEAL_PURPLE } : undefined}
      aria-hidden
    >
      {connected ? <Check className="h-4 w-4" /> : null}
    </span>
  );
}

function BanAppealAuthGate({
  discord,
  authError,
  onContinue,
  onDiscordChange,
}: {
  discord: DiscordIdentity | null;
  authError?: string;
  onContinue: (discord: DiscordIdentity) => void;
  onDiscordChange: (discord: DiscordIdentity | null) => void;
}) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [disconnectingGoogle, setDisconnectingGoogle] = useState(false);
  const [disconnectingDiscord, setDisconnectingDiscord] = useState(false);

  useEffect(() => {
    if (authError === "oauth_denied") {
      toast.error("Discord authorization was cancelled.");
    } else if (authError === "form_banned") {
      toast.error("You are banned from accessing this form.");
    } else if (authError === "oauth_failed" || authError === "oauth_invalid") {
      toast.error("Discord sign-in failed. Please try again.");
    } else if (authError === "oauth_state") {
      toast.error("Discord sign-in expired. Please try again.");
    } else if (authError === "oauth_not_configured") {
      toast.error("Discord sign-in is not configured.");
    }
  }, [authError]);

  const googleConnected = Boolean(isLoaded && isSignedIn && user);
  const googleEmail =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    null;
  const googleName = user?.fullName ?? user?.firstName ?? null;
  const bothConnected = googleConnected && Boolean(discord);

  async function handleDisconnectGoogle() {
    setDisconnectingGoogle(true);
    try {
      await signOut({ redirectUrl: "/ban-appeal" });
    } catch {
      toast.error("Failed to sign out. Please try again.");
      setDisconnectingGoogle(false);
    }
  }

  async function handleDisconnectDiscord() {
    setDisconnectingDiscord(true);
    try {
      const res = await fetch("/api/discord-appeal/session", {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Failed to disconnect Discord. Please try again.");
        return;
      }
      onDiscordChange(null);
      toast.success("Disconnected from Discord.");
    } catch {
      toast.error("Failed to disconnect Discord. Please try again.");
    } finally {
      setDisconnectingDiscord(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-24">
      <Card className="w-full max-w-lg border-muted/60 p-2 shadow-xl">
        <CardHeader className="space-y-3 pt-6 text-center">
          <CardTitle className="text-3xl font-semibold tracking-tight">
            Ban Appeal
          </CardTitle>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Verify both accounts to continue. Connect with Google for decision
            emails, and Discord using the{" "}
            <span className="font-medium text-foreground">banned account</span>.
          </p>
        </CardHeader>

        <CardContent className="space-y-4 pb-8 pt-2">
          <div className="rounded-xl border px-4 py-4">
            <div className="flex items-start gap-3">
              <StatusCircle connected={googleConnected} />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">Google</p>
                  {googleConnected ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={disconnectingGoogle}
                      onClick={handleDisconnectGoogle}
                    >
                      {disconnectingGoogle ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Disconnect"
                      )}
                    </Button>
                  ) : null}
                </div>
                {googleConnected ? (
                  <div className="space-y-0.5">
                    {googleName ? (
                      <p className="truncate text-sm font-medium">
                        {googleName}
                      </p>
                    ) : null}
                    <p className="truncate text-sm text-muted-foreground">
                      {googleEmail}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Decision emails go here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Used for decision emails
                    </p>
                    <SignInButton mode="redirect" forceRedirectUrl="/ban-appeal">
                      <Button
                        type="button"
                        className="flex w-full items-center justify-center gap-2"
                        size="lg"
                      >
                        Connect with Google
                      </Button>
                    </SignInButton>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border px-4 py-4">
            <div className="flex items-start gap-3">
              <StatusCircle connected={Boolean(discord)} />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">Discord</p>
                  {discord ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={disconnectingDiscord}
                      onClick={handleDisconnectDiscord}
                    >
                      {disconnectingDiscord ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Disconnect"
                      )}
                    </Button>
                  ) : null}
                </div>
                {discord ? (
                  <div className="flex items-start gap-3">
                    {discordAvatarUrl(discord) ? (
                      <img
                        src={discordAvatarUrl(discord)!}
                        alt={discord.discordUsername}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: APPEAL_PURPLE }}
                      >
                        {discord.discordUsername.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-medium">
                        @{discord.discordUsername}
                      </p>
                      <p className="break-all font-mono text-xs text-muted-foreground">
                        {discord.discordUserId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Must be the banned account
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Must be the banned account
                    </p>
                    <Button
                      asChild
                      size="lg"
                      className="w-full"
                      variant="outline"
                    >
                      <a href="/api/discord-appeal/auth?returnTo=/ban-appeal">
                        Connect with Discord
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full text-white shadow hover:opacity-90"
            style={{ backgroundColor: APPEAL_PURPLE }}
            disabled={!bothConnected}
            onClick={() => {
              if (discord && bothConnected) onContinue(discord);
            }}
          >
            Continue to appeal
          </Button>

          <p className="px-2 text-center text-xs leading-relaxed text-muted-foreground">
            Warning and timeout appeals use{" "}
            <a href="/discord-appeal-form" className="underline">
              Discord sign-in only
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BanAppealPageClient({
  rulesContent,
  initialDiscord,
  authError,
}: BanAppealPageClientProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [discord, setDiscord] = useState<DiscordIdentity | null>(
    initialDiscord,
  );
  const [showForm, setShowForm] = useState(false);

  const handleContinue = useCallback((identity: DiscordIdentity) => {
    setDiscord(identity);
    setShowForm(true);
  }, []);

  const handleDiscordChange = useCallback((identity: DiscordIdentity | null) => {
    setDiscord(identity);
    if (!identity) setShowForm(false);
  }, []);

  const handleDiscordDisconnected = useCallback(() => {
    setDiscord(null);
    setShowForm(false);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    null;
  const name = user?.fullName ?? user?.firstName ?? null;

  if (!showForm || !discord || !isSignedIn || !email) {
    return (
      <BanAppealAuthGate
        discord={discord}
        authError={authError}
        onContinue={handleContinue}
        onDiscordChange={handleDiscordChange}
      />
    );
  }

  return (
    <BanAppealClient
      rulesContent={rulesContent}
      userEmail={email}
      userName={name}
      discord={discord}
      onDiscordDisconnected={handleDiscordDisconnected}
    />
  );
}
