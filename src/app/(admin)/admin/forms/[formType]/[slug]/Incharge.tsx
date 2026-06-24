"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthSession } from "@/hooks/useAuthSession";
import { MAX_INCHARGE_NICKNAMES } from "@/lib/forms/incharge.shared";
import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type InchargeCandidate = {
  nickname: string;
  email: string;
  discordUserId: string;
  name?: string;
};

type InchargeMemberView = {
  nickname: string;
  email: string;
  discordUserId: string;
};

type Props = {
  formSlug: string;
  initialNicknames: string[];
  initialMembers: InchargeMemberView[];
};

export default function Incharge({
  formSlug,
  initialNicknames,
  initialMembers,
}: Props) {
  const { session, loading: sessionLoading } = useAuthSession();
  const [nicknames, setNicknames] = useState<string[]>(initialNicknames);
  const [members, setMembers] = useState<InchargeMemberView[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState<InchargeCandidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const isAdmin =
    session?.userData?.roles?.includes("admin") ||
    session?.userData?.roles?.includes("owner");

  const canAdd =
    isAdmin &&
    !isSaving &&
    search.trim().length > 0 &&
    !nicknames.includes(search.trim().toLowerCase()) &&
    nicknames.length < MAX_INCHARGE_NICKNAMES;

  useEffect(() => {
    if (!isAdmin) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const q = search.trim();
      const res = await fetch(
        `/api/admin/access/incharge-candidates${q ? `?q=${encodeURIComponent(q)}` : ""}`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as InchargeCandidate[];
      setCandidates(data);
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, isAdmin]);

  async function persistNicknames(nextNicknames: string[]) {
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/forms/${formSlug}/incharge`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nicknames: nextNicknames }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to update incharge.");
        return false;
      }

      const saved = data.nicknames as string[];
      setNicknames(saved);

      const memberRes = await fetch(`/api/admin/access/incharge-candidates`);
      if (memberRes.ok) {
        const allCandidates = (await memberRes.json()) as InchargeCandidate[];
        setMembers(
          allCandidates.filter((candidate) =>
            saved.includes(candidate.nickname),
          ),
        );
      }

      return true;
    } catch {
      setError("Failed to update incharge.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAdd(nickname: string) {
    const normalized = nickname.trim().toLowerCase();
    if (!normalized || nicknames.includes(normalized)) return;

    const success = await persistNicknames([...nicknames, normalized]);
    if (success) {
      setSearch("");
      setCandidates([]);
    }
  }

  async function handleRemove(nickname: string) {
    if (!isAdmin || isSaving) return;
    await persistNicknames(nicknames.filter((n) => n !== nickname));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-medium">Incharge</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Staff nicknames responsible for reviewing applications on this intake.
          They receive Discord pings on new submissions and reminder pings if
          they have not voted within 7 days.
        </p>
        {!sessionLoading && !isAdmin && (
          <p className="text-sm text-muted-foreground">
            Only admins can add or remove incharge members.
          </p>
        )}
      </div>

      <div className="rounded-lg border bg-card">
        {members.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No incharge configured. Notifications will be sent without user
            pings.
          </p>
        ) : (
          <ul className="divide-y">
            {members.map((member) => (
              <li
                key={member.nickname}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{member.nickname}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.email} · {member.discordUserId}
                  </p>
                </div>
                {isAdmin && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => void handleRemove(member.nickname)}
                    disabled={isSaving}
                    aria-label={`Remove ${member.nickname}`}
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
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[240px] space-y-2 relative">
              <label htmlFor="incharge-search" className="text-sm font-medium">
                Add incharge by nickname
              </label>
              <Input
                id="incharge-search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setError(null);
                }}
                disabled={
                  isSaving || nicknames.length >= MAX_INCHARGE_NICKNAMES
                }
                placeholder="Search staff nickname"
              />

              {candidates.length > 0 && search.trim() && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
                  {candidates
                    .filter(
                      (candidate) => !nicknames.includes(candidate.nickname),
                    )
                    .map((candidate) => (
                      <button
                        key={candidate.nickname}
                        type="button"
                        onClick={() => void handleAdd(candidate.nickname)}
                        className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-muted"
                      >
                        <span className="font-medium">{candidate.nickname}</span>
                        <span className="text-xs text-muted-foreground">
                          {candidate.email}
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {search.trim() &&
            candidates.some(
              (candidate) =>
                candidate.nickname === search.trim().toLowerCase(),
            ) && (
              <Button
                type="button"
                variant={canAdd ? "default" : "secondary"}
                disabled={!canAdd}
                onClick={() => void handleAdd(search)}
              >
                {isSaving ? "Adding..." : "Add incharge"}
              </Button>
            )}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
