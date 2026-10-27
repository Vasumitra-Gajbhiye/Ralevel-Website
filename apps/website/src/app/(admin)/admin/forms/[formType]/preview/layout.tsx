import { guardSection } from "@/lib/admin-access/page-guard";

// The preview page is a client component, so it's guarded here instead.
export default async function FormPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const denied = await guardSection("forms");
  return denied ?? children;
}
