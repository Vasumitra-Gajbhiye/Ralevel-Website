import { getLegalPageBySlug } from "@/lib/data/legalPages";
import { isLegalPageSlug, joinLegalSlug } from "@/lib/legal-pages";
import { notFound } from "next/navigation";
import LegalDocument from "../LegalDocument";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug: segments } = await params;
  const slug = joinLegalSlug(segments);
  const page = await getLegalPageBySlug(slug);
  if (!page) return {};

  return {
    title: `${page.title} | r/alevel`,
  };
}

export default async function LegalCatchAllPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug: segments } = await params;
  const slug = joinLegalSlug(segments);
  if (!isLegalPageSlug(slug)) notFound();

  const page = await getLegalPageBySlug(slug);
  if (!page) notFound();

  return (
    <LegalDocument
      title={page.title}
      lastPublishedLabel={page.lastPublishedLabel}
      lastPublishedDateTime={page.lastPublishedDateTime}
      content={page.content}
    />
  );
}
