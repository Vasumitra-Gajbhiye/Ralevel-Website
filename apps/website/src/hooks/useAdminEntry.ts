"use client";

import { canAccessAdminPanel, isStaff, type Role } from "@/lib/roles";
import { useEffect, useState } from "react";

// Admin page access lives in the database, so the roles in Clerk metadata only
// give a first guess. Ask the server once per page load and user.
let lookup: { key: string; result: Promise<boolean | null> } | null = null;

function fetchCanAccessAdmin(key: string): Promise<boolean | null> {
  if (lookup?.key !== key) {
    lookup = {
      key,
      result: fetch("/api/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) =>
          typeof data?.canAccessAdmin === "boolean" ? data.canAccessAdmin : null,
        )
        .catch(() => null),
    };
  }
  return lookup.result;
}

/** Whether to show the Admin link. Non-staff never trigger a request. */
export function useAdminEntry(
  userId: string | undefined,
  roles: Role[],
): boolean {
  const staff = Boolean(userId) && isStaff(roles);
  const key = staff ? `${userId}:${roles.join(",")}` : "";
  const [answer, setAnswer] = useState<{ key: string; value: boolean } | null>(
    null,
  );

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetchCanAccessAdmin(key).then((value) => {
      if (!cancelled && value !== null) setAnswer({ key, value });
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  if (!staff) return false;
  return answer?.key === key ? answer.value : canAccessAdminPanel(roles);
}
