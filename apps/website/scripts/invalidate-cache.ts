/**
 * Invalidate Next.js data cache tags from the command line.
 *
 * Usage:
 *   npx tsx scripts/invalidate-cache.ts blogs
 *   npx tsx scripts/invalidate-cache.ts resources certs
 */
import "dotenv/config";
import { revalidateDataTags } from "../src/lib/data-cache";

async function main() {
  const tags = process.argv.slice(2);
  if (tags.length === 0) {
    console.error("Usage: npx tsx scripts/invalidate-cache.ts <tag> [tag...]");
    console.error(
      "Tags: blogs, resources, resources-legacy, certs, curriculum",
    );
    process.exit(1);
  }

  revalidateDataTags(...tags);
  console.log(`Invalidated tags: ${tags.join(", ")}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
