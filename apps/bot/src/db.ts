import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var applicationsBotMongoose:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

const cached = global.applicationsBotMongoose ?? {
  conn: null,
  promise: null,
};
global.applicationsBotMongoose = cached;

export default async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI is required for the applications bot");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
