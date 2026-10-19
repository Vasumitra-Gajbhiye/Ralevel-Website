# Stripe (test mode)

**Tier 2.** You need this for the `/minecraft-funding` checkout. Use **test mode only**. It needs no business details and no real money moves.

## Set up

1. Create an account at [stripe.com](https://stripe.com). You can skip "activate payments": test mode works without it.
2. Make sure the dashboard shows **Test mode** (the toggle at the top).
3. Open **Developers → API keys** and copy the two **test** keys into `apps/website/.env.local`:

   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

   If a key starts with `sk_live_` / `pk_live_`, it's the wrong one.

## Webhooks (with the Stripe CLI)

After a payment, Stripe calls `/api/webhook`, which records the donation. Stripe can't reach your laptop directly, so the Stripe CLI forwards the calls.

1. Install the CLI:
   - **macOS:** `brew install stripe/stripe-cli/stripe`
   - **Windows:** `scoop install stripe`, or download the `.zip` from [Stripe CLI releases](https://github.com/stripe/stripe-cli/releases) and put `stripe.exe` somewhere on your PATH
2. Log in, then start forwarding (keep this running in its own terminal):

   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/webhook
   ```

3. It prints a signing secret starting with `whsec_`. Put it in `.env.local` and restart `pnpm dev`:

   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Test a payment

1. Sign in and go to `/minecraft-funding`, then pick an amount.
2. On the Stripe page, use card `4242 4242 4242 4242`, any future date, any CVC and any postcode.

✅ **You should now see** the payment succeed and bring you back to `/success`, `checkout.session.completed` in the `stripe listen` terminal with a `200` response, and the amount raised on `/minecraft-funding` go up.
