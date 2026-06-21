import connectDB from "@/lib/mongodb";
import UserData from "@/models/userData";
import { cache } from "react";

export const fetchUserDataByEmail = cache(async (email: string) => {
  await connectDB();
  return UserData.findOne({ email }).lean();
});
