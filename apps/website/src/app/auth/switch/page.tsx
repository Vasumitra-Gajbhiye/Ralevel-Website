"use client";

import { useClerk } from "@clerk/nextjs";
import { useEffect } from "react";

export default function SwitchAccountPage() {
  const { signOut } = useClerk();

  useEffect(() => {
    signOut({ redirectUrl: "/sign-in" });
  }, [signOut]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Redirecting to sign in…
    </div>
  );
}
