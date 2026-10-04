"use client";

import { ListPagination } from "@/components/ui/list-pagination";
import type { TeamAccessUser } from "@/lib/data/admin/team-access";
import type { PaginationMeta } from "@/lib/pagination";
import { isAdmin, type Role } from "@/lib/roles";
import type { AuthSession } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Suggestion = {
  email: string;
  name?: string;
};

export type TeamRoleMeta = { color: string; icon: React.ElementType };

export type TeamAccessClientProps<R extends Role> = {
  title: string;
  description: string;
  /** Lowercase department noun used in messages, e.g. "resource". */
  noun: string;
  apiBase: string;
  pagePath: string;
  teamRoles: readonly R[];
  depHeadRole: R;
  staffRole: R;
  labels: Record<R, string>;
  meta: Record<R, TeamRoleMeta>;
  session: AuthSession | null;
  initialUsers: TeamAccessUser<R>[];
  pagination: PaginationMeta;
};

function TeamRoleBadge<R extends Role>({
  role,
  disabled,
  onChange,
  assignableRoles,
  labels,
  meta,
}: {
  role: R;
  disabled?: boolean;
  onChange?: (role: R) => void;
  assignableRoles: R[];
  labels: Record<R, string>;
  meta: Record<R, TeamRoleMeta>;
}) {
  const roleMeta = meta[role];
  const Icon = roleMeta.icon;

  return (
    <div
      className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium
        ${roleMeta.color}
        ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <Icon className="w-3.5 h-3.5" />
      {labels[role]}

      {!disabled && onChange && (
        <select
          value={role}
          onChange={(e) => onChange(e.target.value as R)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        >
          {assignableRoles.map((value) => (
            <option key={value} value={value}>
              {labels[value]}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default function TeamAccessClient<R extends Role>({
  title,
  description,
  noun,
  apiBase,
  pagePath,
  teamRoles,
  depHeadRole,
  staffRole,
  labels,
  meta,
  session,
  initialUsers,
  pagination,
}: TeamAccessClientProps<R>) {
  const router = useRouter();
  const actorIsAdmin = isAdmin(session?.userData?.roles);
  const assignableRoles: R[] = actorIsAdmin ? [...teamRoles] : [staffRole];

  const [users, setUsers] = useState(initialUsers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<R>(assignableRoles[0] ?? staffRole);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{
    email: string;
    reason: "self" | "dep_head" | "normal";
  } | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  function handleEmailChange(value: string) {
    setEmail(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`${apiBase}/search?q=${encodeURIComponent(value)}`);
      const data = await res.json();
      setSuggestions(data);
    }, 250);
  }

  function pickSuggestion(value: string) {
    setEmail(value);
    setSuggestions([]);
  }

  async function addAccess() {
    if (!email.trim()) return;

    setSaving(true);

    await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    setEmail("");
    setRole(assignableRoles[0] ?? staffRole);
    setSuggestions([]);
    router.refresh();
    setSaving(false);
  }

  async function updateRole(email: string, role: R) {
    await fetch(apiBase, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    router.refresh();
  }

  async function revoke(email: string) {
    await fetch(apiBase, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    router.refresh();
  }

  function canRevokeUser(targetRole: R | null) {
    if (!targetRole) return false;
    if (!actorIsAdmin && targetRole === depHeadRole) return false;
    return true;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">{title}</h1>
      <p className="text-sm text-gray-500 mb-6">{description}</p>

      <div className="relative border rounded-xl p-4 bg-white mb-8 flex gap-3 items-end">
        <div className="flex-1 relative">
          <label className="text-xs text-gray-500">Email</label>
          <input
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="user@example.com"
            className="w-full border rounded px-3 py-2 text-sm"
          />

          {suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow">
              {suggestions.map((s) => (
                <button
                  key={s.email}
                  onClick={() => pickSuggestion(s.email)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <div className="font-medium">{s.email}</div>
                  {s.name && (
                    <div className="text-xs text-gray-500">{s.name}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs text-gray-500">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as R)}
            className="border rounded px-3 py-2 text-sm bg-white"
          >
            {assignableRoles.map((value) => (
              <option key={value} value={value}>
                {labels[value]}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={addAccess}
          disabled={saving}
          className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          + Grant access
        </button>
      </div>

      <div className="border rounded-xl bg-white overflow-hidden">
        {users.length === 0 ? (
          <div className="p-6 text-sm text-gray-500 text-center">
            No {noun} access granted yet
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_220px_100px] gap-4 px-4 py-3 bg-gray-50 text-gray-600 text-sm font-medium">
              <div>Email</div>
              <div>Role</div>
              <div className="text-right">Action</div>
            </div>

            <div className="divide-y">
              {users.map((u) => {
                const isSelf = u.email === session?.user?.email;
                const teamRole = u.teamRole;
                const revokeAllowed = !isSelf && canRevokeUser(teamRole);

                return (
                  <div
                    key={u.email}
                    className="grid grid-cols-[1fr_220px_100px] gap-4 px-4 py-3 items-center"
                  >
                    <div className="text-sm text-gray-900 truncate">
                      {u.email}
                    </div>

                    <div>
                      {teamRole ? (
                        <TeamRoleBadge
                          role={teamRole}
                          disabled={isSelf || !actorIsAdmin}
                          onChange={
                            actorIsAdmin
                              ? (newRole) => updateRole(u.email, newRole)
                              : undefined
                          }
                          assignableRoles={assignableRoles}
                          labels={labels}
                          meta={meta}
                        />
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>

                    <div className="text-right">
                      <button
                        onClick={() => {
                          if (isSelf) {
                            setConfirmDelete({ email: u.email, reason: "self" });
                          } else if (!revokeAllowed) {
                            setConfirmDelete({ email: u.email, reason: "dep_head" });
                          } else {
                            setConfirmDelete({ email: u.email, reason: "normal" });
                          }
                        }}
                        className={`text-xs ${
                          revokeAllowed
                            ? "text-red-600 hover:underline"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <ListPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(nextPage) => router.push(`${pagePath}?page=${nextPage}`)}
      />

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-lg">
            {confirmDelete.reason === "self" && (
              <>
                <h3 className="text-lg font-semibold mb-2">Action not allowed</h3>
                <p className="text-sm text-gray-600 mb-4">
                  You cannot remove your own access.
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
                  >
                    Got it
                  </button>
                </div>
              </>
            )}

            {confirmDelete.reason === "dep_head" && (
              <>
                <h3 className="text-lg font-semibold mb-2">Action not allowed</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Only owner or admin can revoke {labels[depHeadRole]} access.
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
                  >
                    Got it
                  </button>
                </div>
              </>
            )}

            {confirmDelete.reason === "normal" && (
              <>
                <h3 className="text-lg font-semibold mb-2">
                  Remove {noun} access?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  This will revoke {noun} roles for{" "}
                  <span className="font-medium">{confirmDelete.email}</span>.
                  Other roles will be preserved.
                </p>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      await revoke(confirmDelete.email);
                      setConfirmDelete(null);
                    }}
                    className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
