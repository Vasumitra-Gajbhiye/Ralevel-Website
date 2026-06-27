"use client";

import AuthorAvatar from "@/components/blogs-v2/AuthorAvatar";
import WriterProfileAvatarField from "@/components/blogs-v2/WriterProfileAvatarField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { WriterProfile } from "@/lib/data/admin/writerProfile";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type WriterProfileRowProps = {
  profile: WriterProfile;
  editable?: boolean;
  apiPath?: string;
};

export default function WriterProfileRow({
  profile,
  editable = false,
  apiPath,
}: WriterProfileRowProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatar, setAvatar] = useState(profile.avatar ?? "");

  useEffect(() => {
    setName(profile.name);
    setBio(profile.bio ?? "");
    setAvatar(profile.avatar ?? "");
  }, [profile]);

  const patchUrl =
    apiPath ??
    (profile.userId
      ? `/api/admin/writer-profile/${profile.userId}`
      : "/api/admin/writer-profile");

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(patchUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, avatar }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to save profile");
      }

      setEditing(false);
      toast.success("Profile saved");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save profile",
      );
    } finally {
      setSaving(false);
    }
  }

  const followers = profile.followerCount;
  const followerLabel = `${followers} ${followers === 1 ? "follower" : "followers"}`;

  if (editing && editable) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="shrink-0">
            <AuthorAvatar
              author={name}
              src={avatar}
              useUiAvatarsFallback={false}
              className="h-20 w-20"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-500">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-neutral-500">Bio</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A short bio about you…"
                rows={4}
              />
            </div>

            <WriterProfileAvatarField
              userId={profile.userId}
              value={avatar}
              onChange={setAvatar}
            />

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save profile"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setName(profile.name);
                  setBio(profile.bio ?? "");
                  setAvatar(profile.avatar ?? "");
                  setEditing(false);
                }}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="flex gap-4">
        <AuthorAvatar
          author={profile.name}
          src={profile.avatar}
          useUiAvatarsFallback={false}
          className="h-20 w-20"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-black">{profile.name}</h2>
              <p className="mt-0.5 text-sm text-neutral-500">{followerLabel}</p>
            </div>

            {editable && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={() => setEditing(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>

          {profile.bio?.trim() && (
            <p className="mt-4 text-base leading-relaxed text-neutral-600">
              {profile.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
