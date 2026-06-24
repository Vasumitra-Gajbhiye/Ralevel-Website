import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

// export async function GET() {
//   try {
//     await connectDB();
//     return Response.json({ status: "connected" });
//   } catch (err) {
//     console.error("Healthcheck DB connection failed:", err);
//     return Response.json(
//       { error: "Service unavailable" },
//       { status: 503 }
//     );
//   }
// }

export async function GET() {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    return Response.json({ status: "connected" });
  } catch (err) {
    console.error("Healthcheck DB connection failed:", err);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
