import CertData from "@/models/certsData";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log("✅ Connected to DB");

  const docs = await CertData.find();

  let updated = 0;
  let failed = 0;

  for (const doc of docs) {
    try {
      let update: any = {};

      // ✅ Convert issueDate if string
      if (typeof doc.issueDate === "string") {
        const parsed = new Date(doc.issueDate);

        if (!isNaN(parsed.getTime())) {
          update.issueDate = parsed;
        } else {
          console.warn(`⚠️ Invalid date: ${doc.issueDate}`);
          failed++;
          continue;
        }
      }

      // ✅ Add createdAt if missing
      if (!doc.createdAt) {
        update.createdAt = update.issueDate || new Date();
      }

      // ✅ Only update if needed
      if (Object.keys(update).length > 0) {
        await CertData.updateOne({ _id: doc._id }, { $set: update });
        updated++;
      }
    } catch (err) {
      console.error(`❌ Error for ${doc._id}`, err);
      failed++;
    }
  }

  console.log("🎉 Done");
  console.log("Updated:", updated);
  console.log("Failed:", failed);

  process.exit(0);
}

migrate();
