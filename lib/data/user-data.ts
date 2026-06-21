import connectDB from "@/lib/mongodb";
import { redisCached } from "@/lib/redis-cache";
import UserData from "@/models/userData";
import { cache } from "react";

export const fetchUserDataByEmail = cache(async (email: string) => {
  return redisCached(
    `user:email:${email}`,
    async () => {
      await connectDB();
      return UserData.findOne({ email }).lean();
    },
    { ttlSec: 120, tags: [`user:${email}`] }
  );
});
