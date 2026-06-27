import connectDB from "@/lib/mongodb";
import { slugify } from "@/lib/slugify";
import BlogV2 from "@/models/blogV2";

export async function assignPermanentSlug(title: string): Promise<string> {
  await connectDB();

  const base = slugify(title) || "untitled";
  let candidate = base;
  let suffix = 2;

  while (await BlogV2.exists({ slug: candidate })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
