"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Back() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-sm text-slate-600 hover:text-cyan-600 transition"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
  );
}
