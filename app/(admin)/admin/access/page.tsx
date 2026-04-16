"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Role } from "@/lib/roles";
import { roleRank } from "@/lib/roles";
import { useSession } from "next-auth/react";
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
  writer: "Writer",
  bot_dev: "Bot Developer",
  former_staff: "Former Staff",
  informative_team: "Community Team",
  helper: "Helper",
  mod_dep_head: "MOD Dep. Head",
  helper_dep_head: "HLP Dep. Head",
  graphic_dep_head: "GFX Dep. Head",
  info_dep_head: "COMM Dep. Head",
};

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
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value} disabled={value === "owner"}>
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

  function toggle(role: Role) {
    if (!onChange) return;

    if (roles.includes(role)) {
      if (roles.length === 1) return; // prevent zero-role state
      onChange(roles.filter((r) => r !== role));
    } else {
      onChange([...roles, role]);
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
          {Object.entries(ROLE_LABELS).map(([value, label]) => {
            if (value === "owner") return null;

            return (
              <DropdownMenuCheckboxItem
                key={value}
                checked={roles.includes(value as Role)}
                onCheckedChange={() => toggle(value as Role)}
              >
                {label}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}

export default function AccessPage() {
  const { data: session } = useSession();

  const [users, setUsers] = useState<AccessUser[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("writer");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{
    email: string;
    reason: "owner" | "self" | "normal";
  } | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  /* ---------------- LOAD ACCESS LIST ---------------- */
  async function load() {
    try {
      const res = await fetch("/api/admin/access");
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (e) {
      console.log("Error ", e);
    }
  }

  useEffect(() => {
    load();
  }, []);

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
        `/api/admin/access/search?q=${encodeURIComponent(value)}`
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
    if (!email.trim()) return;

    setSaving(true);

    await fetch("/api/admin/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        roles: [role], // ✅ THIS FIXES THE ERROR
      }),
    });

    setEmail("");
    setRole("writer");
    setSuggestions([]);
    await load();
    setSaving(false);
  }
  async function updateRoles(email: string, roles: Role[]) {
    try {
      await fetch("/api/admin/access", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          roles, // ✅ USE THE PARAMETER
        }),
      });
    } catch (e) {
      console.log(e);
    }

    await load();
  }

  async function revoke(email: string) {
    await fetch("/api/admin/access", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    await load();
  }

  /* ================= UI ================= */

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Access</h1>
      <p className="text-sm text-gray-500 mb-6">Share admin or writer access</p>

      {/* Share box */}
      <div className="relative border rounded-xl p-4 bg-white mb-8 flex gap-3 items-end">
        <div className="flex-1 relative">
          <label className="text-xs text-gray-500">Email</label>
          <input
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="user@example.com"
            className="w-full border rounded px-3 py-2 text-sm"
          />

          {/* Suggestions */}
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
            className="border rounded px-3 py-2 text-sm bg-white"
          >
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value} disabled={value === "owner"}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={addAccess}
          disabled={saving}
          className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          + Share
        </button>
      </div>

      {/* Access list */}
      <div className="border rounded-xl bg-white overflow-hidden">
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Loading…</div>
        ) : users.length === 0 ? (
          <div className="p-6 text-sm text-gray-500 text-center">
            No access granted yet
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-[1fr_220px_100px] gap-4 px-4 py-3 bg-gray-50 text-gray-600 text-sm font-medium">
              <div>Email</div>
              <div>Role</div>
              <div className="text-right">Action</div>
            </div>

            {/* Rows */}
            <div className="divide-y">
              {users.map((u) => {
                const isSelf = u.email === session?.user?.email;
                const isOwner = u.roles.includes("owner");

                return (
                  <div
                    key={u.email}
                    className="grid grid-cols-[1fr_220px_100px] gap-4 px-4 py-3 items-center"
                  >
                    {/* Email */}
                    <div className="text-sm text-gray-900 truncate">
                      {u.email}
                    </div>

                    {/* Role */}
                    <div>
                      <RoleMultiBadge
                        roles={u.roles}
                        disabled={isOwner || isSelf}
                        onChange={(newRoles) => updateRoles(u.email, newRoles)}
                      />
                    </div>

                    {/* Action */}
                    <div className="text-right">
                      <button
                        onClick={() => {
                          if (isOwner) {
                            setConfirmDelete({
                              email: u.email,
                              reason: "owner",
                            });
                          } else if (isSelf) {
                            setConfirmDelete({
                              email: u.email,
                              reason: "self",
                            });
                          } else {
                            setConfirmDelete({
                              email: u.email,
                              reason: "normal",
                            });
                          }
                        }}
                        className={`text-xs ${
                          isOwner || isSelf
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-red-600 hover:underline"
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

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-lg">
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

            {confirmDelete.reason === "normal" && (
              <>
                <h3 className="text-lg font-semibold mb-2">Remove access?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This will revoke access for{" "}
                  <span className="font-medium">{confirmDelete.email}</span>.
                  This action cannot be undone.
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
