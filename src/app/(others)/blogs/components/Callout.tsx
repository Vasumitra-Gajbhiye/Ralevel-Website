import React from "react";

export default function Callout({
  type = "info",
  children,
}: {
  type?: "info" | "warn" | "success";
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    info: "bg-sky-50 border-sky-200 text-sky-900",
    warn: "bg-amber-50 border-amber-200 text-amber-900",
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
  };

  return (
    <div
      className={`my-6 px-5 py-4 border rounded-xl leading-relaxed ${styles[type]}`}
    >
      {children}
    </div>
  );
}
