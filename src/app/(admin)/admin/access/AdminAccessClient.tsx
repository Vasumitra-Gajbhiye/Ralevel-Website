"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListPagination } from "@/components/ui/list-pagination";
import type { AdminAccessUser } from "@/lib/data/admin/access";
import type { PaginationMeta } from "@/lib/pagination";
import type { Role } from "@/lib/roles";
import {
  ACCESS_PAGE_ASSIGNABLE_ROLES,
  roleRank,
} from "@/lib/roles";
import { isSuperAdminEmail } from "@/lib/superAdmin";
import type { AuthSession } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  Archive,
  BadgeInfo,
  Bot,
  Brush,
  Crown,
  HelpingHand,
  PenLine,
  Shield,
  Star,
  User,
  UserCog,
} from "lucide-react";

function getPrimaryRole(roles: Role[]) {
  if (!roles.length) return "former_staff"; // safe fallback
  return [...roles].sort((a, b) => roleRank(a) - roleRank(b))[0];
}

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  senior_mod: "Senior Moderator",
  junior_mod: "Junior Moderator",
  trial_mod: "Trial Moderator",
  graphic_designer: "Graphic Designer",
  writer_dep_head: "Writer Dep. Head",
  senior_writer: "Senior Writer",
  writer: "Writer",
  bot_dev: "Bot Developer",
  former_staff: "Former Staff",
  informative_team: "Community Team",
  helper: "Helper",
  mod_dep_head: "MOD Dep. Head",
  helper_dep_head: "HLP Dep. Head",
  graphic_dep_head: "GFX Dep. Head",
  info_dep_head: "COMM Dep. Head",
  reddit_dep_head: "RD Dep. Head",
  resource_dep_head: "Resource Dep. Head",
  resource_staff: "Resource Staff",
};

const ASSIGNABLE_ACCESS_ROLES = ACCESS_PAGE_ASSIGNABLE_ROLES.map((value) => [
  value,
  ROLE_LABELS[value],
] as const);

export const ROLE_META: Record<
  Role | "owner",
  { color: string; icon: React.ElementType }
> = {
  owner: {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Crown,
  },
  admin: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: Shield,
  },
  mod_dep_head: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Shield,
  },
  helper_dep_head: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: Shield,
  },
  graphic_dep_head: {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Shield,
  },
  info_dep_head: {
    color: "bg-neutral-100 text-neutral-800 border-neutral-200",
    icon: Shield,
  },
  reddit_dep_head: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: Shield,
  },
  resource_dep_head: {
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Shield,
  },
  resource_staff: {
    color: "bg-teal-100 text-teal-800 border-teal-200",
    icon: UserCog,
  },
  senior_mod: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: UserCog,
  },
  junior_mod: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: User,
  },
  trial_mod: {
    color: "bg-slate-100 text-slate-700 border-slate-200",
    icon: User,
  },
  graphic_designer: {
    color: "bg-pink-100 text-pink-800 border-pink-200",
    icon: Brush,
  },
  writer_dep_head: {
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Shield,
  },
  senior_writer: {
    color: "bg-violet-100 text-violet-800 border-violet-200",
    icon: Star,
  },
  writer: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: PenLine,
  },
  bot_dev: {
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: Bot,
  },
  former_staff: {
    color: "bg-zinc-100 text-zinc-600 border-zinc-200",
    icon: Archive,
  },
  informative_team: {
    color: "bg-violet-100 text-violet-600 border-violet-200",
    icon: BadgeInfo,
  },
  helper: {
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    icon: HelpingHand,
  },
};

type AccessUser = {
  email: string;
  roles: Role[];
  nickname?: string;
  discordUserId?: string;
};

type Suggestion = {
  email: string;
  name?: string;
};

function RoleBadge({
  role,
  disabled,
  onChange,
}: {
  role: Role | "owner";
  disabled?: boolean;
  onChange?: (role: Role) => void;
}) {
  const meta = ROLE_META[role];
  const Icon = meta.icon;

  return (
    <div
      className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium
        ${meta.color}
        ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <Icon className="w-3.5 h-3.5" />
      {ROLE_LABELS[role]}

      {/* Invisible native select layered on top */}
      {!disabled && onChange && (
        <select
          value={role}
          onChange={(e) => onChange(e.target.value as Role)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        >
          {ASSIGNABLE_ACCESS_ROLES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function RoleMultiBadge({
  roles,
  disabled,
  onChange,
}: {
  roles: Role[];
  disabled?: boolean;
  onChange?: (roles: Role[]) => void;
}) {
  const primary = getPrimaryRole(roles);
  const extraCount = roles.length - 1;

  const meta = ROLE_META[primary];
  const Icon = meta.icon;

  const assignableRoles = roles.filter((role) =>
    ACCESS_PAGE_ASSIGNABLE_ROLES.includes(role),
  );

  function toggle(role: Role) {
    if (!onChange) return;

    if (assignableRoles.includes(role)) {
      const next = assignableRoles.filter((r) => r !== role);
      if (next.length === 0) return;
      onChange(next);
    } else {
      onChange([...assignableRoles, role]);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium
            ${meta.color}
            ${disabled ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}
          `}
        >
          <Icon className="w-3.5 h-3.5" />
          {ROLE_LABELS[primary]}
          {extraCount > 0 && (
            <span className="ml-1 text-xs opacity-80">+{extraCount}</span>
          )}
        </button>
      </DropdownMenuTrigger>

      {!disabled && (
        <DropdownMenuContent align="start" className="w-56">
          {ASSIGNABLE_ACCESS_ROLES.map(([value, label]) => (
            <DropdownMenuCheckboxItem
              key={value}
              checked={assignableRoles.includes(value)}
              onCheckedChange={() => toggle(value)}
            >
              {label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}

export default function AdminAccessClient({
  session,
  initialUsers,
  pagination,
}: {
  session: AuthSession | null;
  initialUsers: AdminAccessUser[];
  pagination: PaginationMeta;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<AccessUser[]>(initialUsers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("trial_mod");
  const [nickname, setNickname] = useState("");
  const [discordUserId, setDiscordUserId] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [saving, setSaving] = useState(false);
  const [identitySaveState, setIdentitySaveState] = useState<
    Record<string, "saving" | "saved">
  >({});
  const [identityDrafts, setIdentityDrafts] = useState<
    Record<string, { nickname: string; discordUserId: string }>
  >({});

  const [confirmDelete, setConfirmDelete] = useState<{
    email: string;
    reason: "super_admin" | "owner" | "self" | "demote" | "remove";
  } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  /* ---------------- AUTOCOMPLETE ---------------- */
  function handleEmailChange(value: string) {
    setEmail(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const res = await fetch(
        `/api/admin/access/search?q=${encodeURIComponent(value)}`,
      );
      const data = await res.json();
      setSuggestions(data);
    }, 250);
  }

  function pickSuggestion(email: string) {
    setEmail(email);
    setSuggestions([]);
  }

  /* ---------------- ADD ACCESS ---------------- */
  async function addAccess() {
    if (!email.trim() || !nickname.trim() || !discordUserId.trim()) return;

    setSaving(true);

    const res = await fetch("/api/admin/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        roles: [role],
        nickname,
        discordUserId,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      alert(text || "Failed to grant access");
      setSaving(false);
      return;
    }

    setEmail("");
    setRole("trial_mod");
    setNickname("");
    setDiscordUserId("");
    setSuggestions([]);
    router.refresh();
    setSaving(false);
  }

  async function saveStaffIdentity(user: AccessUser) {
    const draft = getIdentityDraft(user);

    setIdentitySaveState((prev) => ({ ...prev, [user.email]: "saving" }));

    const res = await fetch("/api/admin/access/staff-identity", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        nickname: draft.nickname,
        discordUserId: draft.discordUserId,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to update staff identity");
      setIdentitySaveState((prev) => {
        const next = { ...prev };
        delete next[user.email];
        return next;
      });
      return;
    }

    const data = await res.json();

    setUsers((prev) =>
      prev.map((u) =>
        u.email === user.email
          ? {
              ...u,
              nickname: data.nickname ?? draft.nickname,
              discordUserId: data.discordUserId ?? draft.discordUserId,
            }
          : u,
      ),
    );
    setIdentityDrafts((prev) => {
      const next = { ...prev };
      delete next[user.email];
      return next;
    });
    setIdentitySaveState((prev) => ({ ...prev, [user.email]: "saved" }));

    window.setTimeout(() => {
      setIdentitySaveState((prev) => {
        const next = { ...prev };
        delete next[user.email];
        return next;
      });
    }, 2000);
  }

  function getIdentityDraft(user: AccessUser) {
    return (
      identityDrafts[user.email] ?? {
        nickname: user.nickname ?? "",
        discordUserId: user.discordUserId ?? "",
      }
    );
  }

  function isIdentityDirty(user: AccessUser): boolean {
    const draft = getIdentityDraft(user);
    return (
      draft.nickname.trim() !== (user.nickname ?? "").trim() ||
      draft.discordUserId.trim() !== (user.discordUserId ?? "").trim()
    );
  }

  function updateIdentityDraft(
    user: AccessUser,
    field: "nickname" | "discordUserId",
    value: string,
  ) {
    setIdentitySaveState((prev) => {
      if (!prev[user.email]) return prev;
      const next = { ...prev };
      delete next[user.email];
      return next;
    });
    setIdentityDrafts((prev) => ({
      ...prev,
      [user.email]: {
        ...getIdentityDraft(user),
        [field]: value,
      },
    }));
  }
  async function updateRoles(email: string, roles: Role[]) {
    setActionError(null);
    try {
      const res = await fetch("/api/admin/access", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          roles,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        setActionError(text || "Failed to update roles");
        return;
      }
    } catch (e) {
      console.log(e);
      setActionError("Failed to update roles");
      return;
    }

    router.refresh();
  }

  async function revoke(email: string) {
    setActionError(null);
    const res = await fetch("/api/admin/access", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const text = await res.text();
      setActionError(text || "Failed to revoke access");
      return;
    }

    router.refresh();
  }

  /* ================= UI ================= */

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Access</h1>
      <p className="text-sm text-gray-500 mb-6">Share admin and staff access</p>

      {actionError && (
        <div
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {actionError}
        </div>
      )}

      {/* Share box */}
      <div className="relative border rounded-xl p-4 bg-white mb-8 space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="relative">
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
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full border rounded px-3 py-2 text-sm bg-white"
            >
              {ASSIGNABLE_ACCESS_ROLES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500">Nickname</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="server-wide nickname"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Discord user ID</label>
            <input
              value={discordUserId}
              onChange={(e) => setDiscordUserId(e.target.value)}
              placeholder="123456789012345678"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={addAccess}
            disabled={
              saving ||
              !email.trim() ||
              !nickname.trim() ||
              !discordUserId.trim()
            }
            className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            + Share
          </button>
        </div>
      </div>

      {/* Access list */}
      <div className="border rounded-xl bg-white overflow-x-auto">
        {users.length === 0 ? (
          <div className="p-6 text-sm text-gray-500 text-center">
            No access granted yet
          </div>
        ) : (
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-600">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium w-[160px]">Nickname</th>
                <th className="px-4 py-3 font-medium w-[180px]">Discord ID</th>
                <th className="px-4 py-3 font-medium w-[200px]">Role</th>
                <th className="px-4 py-3 font-medium text-right w-[120px]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => {
                const actorIsSuperAdmin = isSuperAdminEmail(
                  session?.user?.email,
                );
                const isSuperAdminTarget = isSuperAdminEmail(u.email);
                const isSelf = u.email === session?.user?.email;
                const isOwner = u.roles.includes("owner");
                const isFormerStaffOnly =
                  u.roles.length === 1 && u.roles[0] === "former_staff";
                const isProtected =
                  isSuperAdminTarget ||
                  (isOwner && !actorIsSuperAdmin) ||
                  isSelf;
                const saveState = identitySaveState[u.email];
                const showSaveButton =
                  !isProtected &&
                  (isIdentityDirty(u) ||
                    saveState === "saving" ||
                    saveState === "saved");
                const removeLabel = isFormerStaffOnly ? "Remove" : "Demote";

                return (
                  <tr key={u.email} className="align-middle">
                    <td className="px-4 py-3 text-gray-900 truncate max-w-[220px]">
                      {u.email}
                    </td>

                    <td className="px-4 py-3">
                      <input
                        value={getIdentityDraft(u).nickname}
                        onChange={(e) =>
                          updateIdentityDraft(u, "nickname", e.target.value)
                        }
                        disabled={isProtected}
                        placeholder="nickname"
                        className="w-full border rounded px-2 py-1 text-sm disabled:bg-gray-50"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <input
                        value={getIdentityDraft(u).discordUserId}
                        onChange={(e) =>
                          updateIdentityDraft(u, "discordUserId", e.target.value)
                        }
                        disabled={isProtected}
                        placeholder="Discord ID"
                        className="w-full border rounded px-2 py-1 text-sm disabled:bg-gray-50"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <RoleMultiBadge
                        roles={u.roles}
                        disabled={isProtected}
                        onChange={(newRoles) => updateRoles(u.email, newRoles)}
                      />
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {showSaveButton && (
                        <button
                          onClick={() => saveStaffIdentity(u)}
                          disabled={saveState === "saving"}
                          className={`text-xs mr-3 disabled:opacity-50 ${
                            saveState === "saved"
                              ? "text-green-600"
                              : "text-blue-600 hover:underline"
                          }`}
                        >
                          {saveState === "saving"
                            ? "Saving..."
                            : saveState === "saved"
                              ? "Saved"
                              : "Save"}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (isSuperAdminTarget) {
                            setConfirmDelete({
                              email: u.email,
                              reason: "super_admin",
                            });
                          } else if (isOwner && !actorIsSuperAdmin) {
                            setConfirmDelete({
                              email: u.email,
                              reason: "owner",
                            });
                          } else if (isSelf) {
                            setConfirmDelete({
                              email: u.email,
                              reason: "self",
                            });
                          } else if (isFormerStaffOnly) {
                            setConfirmDelete({
                              email: u.email,
                              reason: "remove",
                            });
                          } else {
                            setConfirmDelete({
                              email: u.email,
                              reason: "demote",
                            });
                          }
                        }}
                        className={`text-xs ${
                          isProtected
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-red-600 hover:underline"
                        }`}
                      >
                        {removeLabel}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <ListPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(nextPage) =>
          router.push(`/admin/access?page=${nextPage}`)
        }
      />

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-lg">
            {confirmDelete.reason === "super_admin" && (
              <>
                <h3 className="text-lg font-semibold mb-2">
                  Action not allowed
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  The super admin account cannot be modified or removed.
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

            {confirmDelete.reason === "owner" && (
              <>
                <h3 className="text-lg font-semibold mb-2">
                  Action not allowed
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  The <strong>owner</strong> access cannot be removed. Ownership
                  must be transferred manually.
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

            {confirmDelete.reason === "self" && (
              <>
                <h3 className="text-lg font-semibold mb-2">
                  Action not allowed
                </h3>
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

            {confirmDelete.reason === "demote" && (
              <>
                <h3 className="text-lg font-semibold mb-2">
                  Demote to Former Staff?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  This will revoke active staff access for{" "}
                  <span className="font-medium">{confirmDelete.email}</span> and
                  mark them as Former Staff. You can remove them entirely later.
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
                    Demote
                  </button>
                </div>
              </>
            )}

            {confirmDelete.reason === "remove" && (
              <>
                <h3 className="text-lg font-semibold mb-2">Remove access?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This will fully revoke access for{" "}
                  <span className="font-medium">{confirmDelete.email}</span> and
                  remove them from this list.
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
