import { getAdminLegalPage } from "@/lib/data/admin/legalPages";
import { isLegalPageSlug, joinLegalSlug } from "@/lib/legal-pages";
import { notFound } from "next/navigation";
import LegalEditorClient from "./LegalEditorClient";

export default async function AdminLegalEditorPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug: segments } = await params;
  const slug = joinLegalSlug(segments);
  if (!isLegalPageSlug(slug)) notFound();

  const page = await getAdminLegalPage(slug);
  if (!page) notFound();

  return <LegalEditorClient key={page.slug} page={page} />;
}
