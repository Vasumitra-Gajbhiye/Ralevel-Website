import connectDB from "@/lib/mongodb";
import BlogV2 from "@/models/blogV2";
import { randomBytes } from "crypto";
import { hasLiveContent } from "./content";
import { backfillPublishedBlogVersion } from "./versions";

let migrationPromise: Promise<void> | null = null;

async function ensureBlogV2SlugIndex(): Promise<void> {
  const collection = BlogV2.collection;
  const indexes = await collection.indexes();
  const slugIndex = indexes.find((index) => index.name === "slug_1");

  const needsRecreate =
    !slugIndex ||
    !slugIndex.unique ||
    slugIndex.sparse !== true;

  if (needsRecreate) {
    if (slugIndex) {
      await collection.dropIndex("slug_1");
    }
    await collection.createIndex(
      { slug: 1 },
      { unique: true, sparse: true, name: "slug_1" },
    );
  }
}

export async function ensureBlogV2Migrated(): Promise<void> {
  if (migrationPromise) return migrationPromise;

  migrationPromise = (async () => {
    await connectDB();

    await ensureBlogV2SlugIndex();

    // Drafts should omit slug entirely; sparse index ignores missing fields.
    await BlogV2.updateMany(
      {
        status: { $in: ["draft", "in_review", "changes_requested"] },
        $or: [{ slug: null }, { slug: "" }],
      },
      { $unset: { slug: "" } },
    );

    const legacyBlogs = await BlogV2.find({
      $or: [{ status: { $exists: false } }, { previewToken: { $exists: false } }],
    })
      .select("_id slug createdAt status previewToken")
      .lean();

    if (legacyBlogs.length === 0) return;

    const bulk = BlogV2.collection.initializeUnorderedBulkOp();

    for (const blog of legacyBlogs) {
      const updates: Record<string, unknown> = {};

      if (!blog.status) {
        updates.status = blog.slug ? "published" : "draft";
      }
      if (!blog.previewToken) {
        updates.previewToken = randomBytes(24).toString("hex");
      }
      if (!blog.status && blog.slug) {
        updates.publishedAt = blog.createdAt ?? new Date();
      }

      if (Object.keys(updates).length > 0) {
        bulk.find({ _id: blog._id }).updateOne({ $set: updates });
      }
    }

    if (bulk.batches.length > 0) {
      await bulk.execute();
    }

    const publishedBlogs = await BlogV2.find({ status: "published" });
    for (const blog of publishedBlogs) {
      if (!hasLiveContent(blog)) continue;
      await backfillPublishedBlogVersion(blog);
    }
  })();

  return migrationPromise;
}
