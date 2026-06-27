import { ensureBlogV2Migrated } from "@/lib/blogs-v2/migrate";
import connectDB from "@/lib/mongodb";
import BlogV2 from "@/models/blogV2";

export async function assertPublishedBlogBySlug(slug: string) {
  await connectDB();
  await ensureBlogV2Migrated();
  return BlogV2.findOne({ slug, status: "published" }).select("_id slug").lean();
}
