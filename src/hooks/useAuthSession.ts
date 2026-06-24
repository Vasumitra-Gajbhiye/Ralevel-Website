"use client";

import type { AuthSession } from "@/types/auth";
import { useEffect, useState } from "react";

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) {
          if (!cancelled) setSession(null);
          return;
        }

        const data = await res.json();
        if (!cancelled) {
          setSession({
            userId: data.userData?.id ?? "",
            user: data.user,
            userData: data.userData,
          });
        }
      } catch {
        if (!cancelled) setSession(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { session, loading };
}
