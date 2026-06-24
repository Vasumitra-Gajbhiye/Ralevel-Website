"use client";

import { ListPagination } from "@/components/ui/list-pagination";
import type { ResourceAccessUser } from "@/lib/data/admin/resource-access";
import type { PaginationMeta } from "@/lib/pagination";
import {
  isAdmin,
  RESOURCE_TEAM_ROLES,
  type ResourceTeamRole,
} from "@/lib/roles";
import type { AuthSession } from "@/types/auth";
import { Shield, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const RESOURCE_ROLE_LABELS: Record<ResourceTeamRole, string> = {
  resource_dep_head: "Resource Dep. Head",
  resource_staff: "Resource Staff",
};

const RESOURCE_ROLE_META: Record<
  ResourceTeamRole,
  { color: string; icon: React.ElementType }
> = {
  resource_dep_head: {
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Shield,
  },
  resource_staff: {
    color: "bg-teal-100 text-teal-800 border-teal-200",
    icon: UserCog,
  },
};

type Suggestion = {
  email: string;
  name?: string;
};

function ResourceRoleBadge({
  role,
  disabled,
  onChange,
  assignableRoles,
}: {
  role: ResourceTeamRole;
  disabled?: boolean;
  onChange?: (role: ResourceTeamRole) => void;
  assignableRoles: ResourceTeamRole[];
}) {
  const meta = RESOURCE_ROLE_META[role];
  const Icon = meta.icon;

  return (
    <div
      className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium
        ${meta.color}
        ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <Icon className="w-3.5 h-3.5" />
      {RESOURCE_ROLE_LABELS[role]}

      {!disabled && onChange && (
        <select
          value={role}
          onChange={(e) => onChange(e.target.value as ResourceTeamRole)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        >
          {assignableRoles.map((value) => (
            <option key={value} value={value}>
              {RESOURCE_ROLE_LABELS[value]}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default function ResourceAccessClient({
  session,
  initialUsers,
  pagination,
}: {
  session: AuthSession | null;
  initialUsers: ResourceAccessUser[];
  pagination: PaginationMeta;
}) {
  const router = useRouter();
  const actorIsAdmin = isAdmin(session?.userData?.roles);
  const assignableRoles: ResourceTeamRole[] = actorIsAdmin
    ? [...RESOURCE_TEAM_ROLES]
    : ["resource_staff"];

  const [users, setUsers] = useState(initialUsers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ResourceTeamRole>(
    assignableRoles[0] ?? "resource_staff"
  );
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
      const res = await fetch(
        `/api/admin/resource-access/search?q=${encodeURIComponent(value)}`
      );
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

    await fetch("/api/admin/resource-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    setEmail("");
    setRole(assignableRoles[0] ?? "resource_staff");
    setSuggestions([]);
    router.refresh();
    setSaving(false);
  }

  async function updateRole(email: string, role: ResourceTeamRole) {
    await fetch("/api/admin/resource-access", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    router.refresh();
  }

  async function revoke(email: string) {
    await fetch("/api/admin/resource-access", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    router.refresh();
  }

  function canRevokeUser(targetRole: ResourceTeamRole | null) {
    if (!targetRole) return false;
    if (!actorIsAdmin && targetRole === "resource_dep_head") return false;
    return true;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Resource Dept.</h1>
      <p className="text-sm text-gray-500 mb-6">
        Manage Resource CMS access for department heads and staff
      </p>

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
            onChange={(e) => setRole(e.target.value as ResourceTeamRole)}
            className="border rounded px-3 py-2 text-sm bg-white"
          >
            {assignableRoles.map((value) => (
              <option key={value} value={value}>
                {RESOURCE_ROLE_LABELS[value]}
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
            No resource access granted yet
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
                const resourceRole = u.resourceRole;
                const revokeAllowed =
                  !isSelf && canRevokeUser(resourceRole);

                return (
                  <div
                    key={u.email}
                    className="grid grid-cols-[1fr_220px_100px] gap-4 px-4 py-3 items-center"
                  >
                    <div className="text-sm text-gray-900 truncate">
                      {u.email}
                    </div>

                    <div>
                      {resourceRole ? (
                        <ResourceRoleBadge
                          role={resourceRole}
                          disabled={isSelf || !actorIsAdmin}
                          onChange={
                            actorIsAdmin
                              ? (newRole) => updateRole(u.email, newRole)
                              : undefined
                          }
                          assignableRoles={assignableRoles}
                        />
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>

                    <div className="text-right">
                      <button
                        onClick={() => {
                          if (isSelf) {
                            setConfirmDelete({
                              email: u.email,
                              reason: "self",
                            });
                          } else if (!revokeAllowed) {
                            setConfirmDelete({
                              email: u.email,
                              reason: "dep_head",
                            });
                          } else {
                            setConfirmDelete({
                              email: u.email,
                              reason: "normal",
                            });
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
        onPageChange={(nextPage) =>
          router.push(`/admin/resource?page=${nextPage}`)
        }
      />

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-lg">
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

            {confirmDelete.reason === "dep_head" && (
              <>
                <h3 className="text-lg font-semibold mb-2">
                  Action not allowed
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Only owner or admin can revoke Resource Dep. Head access.
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
                  Remove resource access?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  This will revoke resource roles for{" "}
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
