// import connectDB from "@/lib/mongodb";
// import { Campaign } from "@/models/Campaign";
// import { NextResponse } from "next/server";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// export async function POST(req: Request) {
//   const body = await req.text();
//   const signature = req.headers.get("stripe-signature") as string;

//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET!
//     );
//   } catch (err: any) {
//     return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
//   }

//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object as Stripe.Checkout.Session;
//     const amountPaid = Number(session.metadata?.amount) || 0;

//     // Connect to DB and update total raised
//     await connectDB();
//     await Campaign.findOneAndUpdate(
//       { name: "minecraft-s2" },
//       { $inc: { raised: amountPaid, noContributors: 1 } },
//       { upsert: true, new: true }
//     );
//   }

//   return new NextResponse("Webhook received", { status: 200 });
// }

import connectDB from "@/lib/mongodb";
import { Campaign } from "@/models/Campaign";
import { Donor } from "@/models/Donor"; // Import the new model
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Extract metadata you passed in from the checkout creation
    const amountPaid = Number(session.metadata?.amount) || 0;
    const userEmail =
      session.metadata?.userEmail ||
      session.customer_details?.email ||
      "Unknown";
    const tierLabel = session.metadata?.tierLabel || "Custom Contribution";

    // Fallback to session ID if payment_intent isn't immediately available
    const transactionId = (session.payment_intent as string) || session.id;

    await connectDB();

    // 1. Create the individual user donor record
    await Donor.create({
      userEmail,
      amount: amountPaid,
      tierLabel,
      transactionId,
      stripeSessionId: session.id,
    });

    // 2. Update the global campaign stats
    await Campaign.findOneAndUpdate(
      { name: "minecraft-s2" },
      { $inc: { raised: amountPaid, noContributors: 1 } },
      { upsert: true, new: true },
    );
  }

  return new NextResponse("Webhook received", { status: 200 });
}
