"use client";

import WriterRoleRequiredDialog from "@/components/blogs-v2/WriterRoleRequiredDialog";

type WriterRoleGateProps = {
  needsWriterRole: boolean;
  children: React.ReactNode;
};

export default function WriterRoleGate({
  needsWriterRole,
  children,
}: WriterRoleGateProps) {
  if (needsWriterRole) {
    return (
      <>
        <WriterRoleRequiredDialog open />
        <div className="pointer-events-none select-none opacity-40 blur-sm">
          {children}
        </div>
      </>
    );
  }

  return <>{children}</>;
}
