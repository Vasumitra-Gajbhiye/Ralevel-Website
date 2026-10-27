"use server";

import { ObjectId } from "mongodb";
import { getAdminSectionRoles } from "@/lib/adminAccess";
import { getAuthSession } from "@/lib/getAuthSession";
import { getNativeMongoClient } from "@/lib/mongodb";
import { hasRequiredRole } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ModUser = { id: string; tag: string };

const modOrderSchema = z
  .array(
    z.object({
      id: z.string().trim().max(64),
      tag: z.string().trim().max(100),
    }),
  )
  .max(200);

/** Server actions are public POST endpoints, so check the QOTD page roles here. */
async function canManageQotd() {
  const session = await getAuthSession();
  return hasRequiredRole(
    session?.userData?.roles,
    getAdminSectionRoles("/admin/qotd") ?? undefined,
  );
}

async function getQotdCollection() {
  const client = await getNativeMongoClient(process.env.QOTD_MONGODB_URI!);
  const db = client.db(process.env.QOTD_DATABASE_NAME);
  return db.collection(process.env.QOTD_COLLECTION_NAME!);
}

export async function getModOrder(): Promise<ModUser[]> {
  if (!(await canManageQotd())) return [];

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
  if (!(await canManageQotd())) {
    return { success: false, error: "Forbidden" };
  }

  const parsed = modOrderSchema.safeParse(newModOrder);
  if (!parsed.success) {
    return { success: false, error: "Invalid mod order" };
  }

  try {
    const collection = await getQotdCollection();

    await collection.updateOne(
      { _id: new ObjectId(process.env.QOTD_TARGET_DOCUMENT_ID!) },
      { $set: { modOrder: parsed.data, updatedAt: new Date() } }
    );

    revalidatePath("/qotd");
    return { success: true };
  } catch (error) {
    console.error("Failed to save mod order:", error);
    return { success: false, error: "Failed to save" };
  }
}
