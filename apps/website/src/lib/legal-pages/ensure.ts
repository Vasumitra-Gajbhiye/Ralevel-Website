import { LEGAL_PAGE_CATALOG } from "@/lib/legal-pages";
import { markdownToBlocks } from "@/lib/legal-pages/markdownToBlocks";
import { LEGAL_PAGE_SEEDS } from "@/lib/legal-pages/seeds";
import connectDB from "@/lib/mongodb";
import LegalPage from "@/models/legalPage";

let ensurePromise: Promise<void> | null = null;

async function seedMissingLegalPages(): Promise<void> {
  await connectDB();

  await LegalPage.bulkWrite(
    LEGAL_PAGE_CATALOG.map((page) => ({
      updateOne: {
        filter: { slug: page.slug },
        update: {
          $setOnInsert: {
            slug: page.slug,
            title: page.title,
            content: markdownToBlocks(LEGAL_PAGE_SEEDS[page.slug]),
            lastPublishedAt: page.originalPublishedAt,
            draft: null,
          },
        },
        upsert: true,
      },
    })),
    { ordered: false },
  );
}

export async function ensureLegalPages(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = seedMissingLegalPages().catch((error) => {
      ensurePromise = null;
      throw error;
    });
  }
  await ensurePromise;
}
