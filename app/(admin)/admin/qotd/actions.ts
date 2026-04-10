"use server";

import { MongoClient, ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

// Cached client connection for Serverless environments
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromiseQotd) {
  client = new MongoClient(process.env.QOTD_MONGODB_URI!);
  global._mongoClientPromiseQotd = client.connect();
}
clientPromise = global._mongoClientPromiseQotd;

export type ModUser = { id: string; tag: string };

export async function getModOrder(): Promise<ModUser[]> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.QOTD_DATABASE_NAME);
    const collection = db.collection(process.env.QOTD_COLLECTION_NAME!);

    const document = await collection.findOne({
      _id: new ObjectId(process.env.QOTD_TARGET_DOCUMENT_ID!),
    });

    if (!document || !document.modOrder) return [];

    // Return clean data to the client
    return document.modOrder.map((mod: any) => ({
      id: mod.id,
      tag: mod.tag,
    }));
  } catch (error) {
    console.error("Failed to fetch mod order:", error);
    return [];
  }
}

export async function saveModOrder(newModOrder: ModUser[]) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.QOTD_DATABASE_NAME);
    const collection = db.collection(process.env.QOTD_COLLECTION_NAME!);

    await collection.updateOne(
      { _id: new ObjectId(process.env.QOTD_TARGET_DOCUMENT_ID!) },
      { $set: { modOrder: newModOrder, updatedAt: new Date() } }
    );

    revalidatePath("/qotd");
    return { success: true };
  } catch (error) {
    console.error("Failed to save mod order:", error);
    return { success: false, error: "Failed to save" };
  }
}
