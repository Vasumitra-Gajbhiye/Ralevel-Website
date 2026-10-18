import { loadStripe } from "@stripe/stripe-js";

let stripePromise: any;
const getStripe = () => {
  // Optional locally: without a publishable key, Stripe.js isn't loaded.
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) return null;
  try {
    if (!stripePromise) {
      stripePromise = loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
      );
    }
    return stripePromise;
  } catch (err) {
    console.log("Error loading Stripe:", err);
  }
};

export default getStripe;
