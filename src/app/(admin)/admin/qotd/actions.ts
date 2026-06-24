"use server";

import { ObjectId } from "mongodb";
import { getNativeMongoClient } from "@/lib/mongodb";
import { revalidatePath } from "next/cache";

export type ModUser = { id: string; tag: string };

async function getQotdCollection() {
  const client = await getNativeMongoClient(process.env.QOTD_MONGODB_URI!);
  const db = client.db(process.env.QOTD_DATABASE_NAME);
  return db.collection(process.env.QOTD_COLLECTION_NAME!);
}

export async function getModOrder(): Promise<ModUser[]> {
  try {
    const collection = await getQotdCollection();

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
    const collection = await getQotdCollection();

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
