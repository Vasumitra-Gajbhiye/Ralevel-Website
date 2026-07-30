import { loadStripe } from "@stripe/stripe-js";

let stripePromise: any;
const getStripe = () => {
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
