import "server-only";

import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripeServer(): Stripe {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  if (!stripe) {
    stripe = new Stripe(apiKey);
  }

  return stripe;
}
