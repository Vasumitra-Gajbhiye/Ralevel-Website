"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  isValidDiscordUserId,
  MAX_DISCORD_PING_USER_IDS,
} from "@/lib/discord/validatePingUserIds";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  formSlug: string;
  initialUserIds: string[];
};

export default function DiscordPings({ formSlug, initialUserIds }: Props) {
  const [userIds, setUserIds] = useState<string[]>(initialUserIds);
  const [savedUserIds, setSavedUserIds] = useState<string[]>(initialUserIds);
  const [newUserId, setNewUserId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const hasUnsavedChanges =
    JSON.stringify(userIds) !== JSON.stringify(savedUserIds);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  function handleAdd() {
    const id = newUserId.trim();
    setError(null);

    if (!id) {
      setError("Enter a Discord user ID.");
      return;
    }

    if (!isValidDiscordUserId(id)) {
      setError("Invalid Discord user ID. It should be a 17–20 digit number.");
      return;
    }

    if (userIds.includes(id)) {
      setError("This user ID is already in the list.");
      return;
    }

    if (userIds.length >= MAX_DISCORD_PING_USER_IDS) {
      setError(`At most ${MAX_DISCORD_PING_USER_IDS} user IDs are allowed.`);
      return;
    }

    setUserIds([...userIds, id]);
    setNewUserId("");
  }

  function handleRemove(index: number) {
    setUserIds(userIds.filter((_, i) => i !== index));
    setError(null);
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/forms/${formSlug}/discord-pings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to save Discord ping settings.");
        return;
      }

      const saved = data.userIds as string[];
      setUserIds(saved);
      setSavedUserIds(saved);
    } catch {
      setError("Failed to save Discord ping settings.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-medium">Discord notification pings</h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Add Discord user IDs to ping when a new application is submitted.
            Pings are optional — if no IDs are configured, the notification is
            sent without mentioning anyone. Reminders are not included in this
            phase.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="text-sm font-medium text-amber-600">
              Unsaved changes
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        {userIds.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No user IDs configured. Notifications will be sent without pings.
          </p>
        ) : (
          <ul className="divide-y">
            {userIds.map((id, index) => (
              <li
                key={`${id}-${index}`}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <code className="text-sm">{id}</code>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(index)}
                  aria-label={`Remove user ${id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

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
                handleAdd();
              }
            }}
            placeholder="e.g. 123456789012345678"
          />
        </div>
        <Button type="button" variant="secondary" onClick={handleAdd}>
          Add user
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <p className="text-xs text-muted-foreground">
        To find a Discord user ID: enable Developer Mode in Discord settings,
        then right-click a user and choose &quot;Copy User ID&quot;.
      </p>
    </div>
  );
}
