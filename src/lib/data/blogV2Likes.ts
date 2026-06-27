import connectDB from "@/lib/mongodb";
import BlogV2 from "@/models/blogV2";
import BlogV2Like from "@/models/blogV2Like";
import mongoose from "mongoose";

export async function hasUserLikedBlogV2(
  slug: string,
  userId: string,
): Promise<boolean> {
  await connectDB();

  const like = await BlogV2Like.findOne({
    blogSlug: slug,
    userId: new mongoose.Types.ObjectId(userId),
  }).lean();

  return Boolean(like);
}

export async function toggleBlogV2Like(
  slug: string,
  userId: string,
): Promise<{ liked: boolean; likeCount: number }> {
  await connectDB();

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const existing = await BlogV2Like.findOne({
    blogSlug: slug,
    userId: userObjectId,
  });

  if (existing) {
    await existing.deleteOne();
    const blog = await BlogV2.findOneAndUpdate(
      { slug },
      [{ $set: { likeCount: { $max: [0, { $subtract: ["$likeCount", 1] }] } } }],
      { new: true },
    ).lean<{ likeCount?: number }>();

    return { liked: false, likeCount: blog?.likeCount ?? 0 };
  }

  try {
    await BlogV2Like.create({ blogSlug: slug, userId: userObjectId });
  } catch (err) {
    if (
      err instanceof mongoose.mongo.MongoServerError &&
      err.code === 11000
    ) {
      const blog = await BlogV2.findOne({ slug }).lean<{ likeCount?: number }>();
      return { liked: true, likeCount: blog?.likeCount ?? 0 };
    }
    throw err;
  }

  const blog = await BlogV2.findOneAndUpdate(
    { slug },
    { $inc: { likeCount: 1 } },
    { new: true },
  ).lean<{ likeCount?: number }>();

  return { liked: true, likeCount: blog?.likeCount ?? 0 };
}
