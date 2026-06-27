import connectDB from "@/lib/mongodb";
import BlogV2 from "@/models/blogV2";
import { randomBytes } from "crypto";

let migrationPromise: Promise<void> | null = null;

export async function ensureBlogV2Migrated(): Promise<void> {
  if (migrationPromise) return migrationPromise;

  migrationPromise = (async () => {
    await connectDB();

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
  })();

  return migrationPromise;
}
