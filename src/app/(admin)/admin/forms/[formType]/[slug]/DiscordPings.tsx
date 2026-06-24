"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthSession } from "@/hooks/useAuthSession";
import {
  isValidDiscordUserId,
  MAX_DISCORD_PING_USER_IDS,
} from "@/lib/discord/validatePingUserIds";
import { Trash2 } from "lucide-react";
import { useState } from "react";

type Props = {
  formSlug: string;
  initialUserIds: string[];
};

export default function DiscordPings({ formSlug, initialUserIds }: Props) {
  const { session, loading: sessionLoading } = useAuthSession();
  const [userIds, setUserIds] = useState<string[]>(initialUserIds);
  const [newUserId, setNewUserId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const isAdmin =
    session?.userData?.roles?.includes("admin") ||
    session?.userData?.roles?.includes("owner");

  const trimmedNewUserId = newUserId.trim();
  const canAddUser =
    isAdmin &&
    !isSaving &&
    trimmedNewUserId.length > 0 &&
    isValidDiscordUserId(trimmedNewUserId) &&
    !userIds.includes(trimmedNewUserId) &&
    userIds.length < MAX_DISCORD_PING_USER_IDS;

  async function persistUserIds(nextUserIds: string[]) {
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/forms/${formSlug}/discord-pings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: nextUserIds }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to update Discord ping settings.");
        return false;
      }

      const saved = data.userIds as string[];
      setUserIds(saved);
      return true;
    } catch {
      setError("Failed to update Discord ping settings.");
      return false;
    } finally {
      setIsSaving(false);
      setRemovingId(null);
    }
  }

  async function handleAdd() {
    if (!canAddUser) return;

    const id = trimmedNewUserId;
    const success = await persistUserIds([...userIds, id]);
    if (success) {
      setNewUserId("");
    }
  }

  async function handleRemove(id: string) {
    if (!isAdmin || isSaving) return;

    setRemovingId(id);
    await persistUserIds(userIds.filter((userId) => userId !== id));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-medium">Discord notification pings</h2>
        {!sessionLoading && !isAdmin && (
          <p className="text-sm text-muted-foreground">
            Only admins can add or remove ping recipients.
          </p>
        )}
      </div>

      <div className="rounded-lg border bg-card">
        {userIds.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No user IDs configured. Notifications will be sent without pings.
          </p>
        ) : (
          <ul className="divide-y">
            {userIds.map((id) => (
              <li
                key={id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <code className="text-sm">{id}</code>
                {isAdmin && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(id)}
                    disabled={isSaving}
                    aria-label={`Remove user ${id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {isAdmin && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[240px] space-y-2">
            <label htmlFor="discord-user-id" className="text-sm font-medium">
              Discord user ID
            </label>
            <Input
              id="discord-user-id"
              value={newUserId}
              onChange={(e) => {
                setNewUserId(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleAdd();
                }
              }}
              disabled={isSaving || userIds.length >= MAX_DISCORD_PING_USER_IDS}
              placeholder="e.g. 123456789012345678"
            />
          </div>
          <Button
            type="button"
            variant={canAddUser ? "default" : "secondary"}
            onClick={() => void handleAdd()}
            disabled={!canAddUser}
          >
            {isSaving && !removingId ? "Adding..." : "Add user"}
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <p className="text-xs text-muted-foreground">
        To find a Discord user ID: enable Developer Mode in Discord settings,
        then right-click a user and choose &quot;Copy User ID&quot;.
      </p>
    </div>
  );
}
