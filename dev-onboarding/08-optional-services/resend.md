# Resend (email)

**Tier 2.** Without it, emails aren't sent. Instead, a line like `[email] RESEND_API_KEY is not set, skipped "…" to …` appears in the terminal, which is usually all you need. Set Resend up when you're working on an email itself and want to see it in an inbox.

The site sends:

- a confirmation when someone submits an application form
- the accept/reject email when an admin decides on an application
- a confirmation when someone submits a ban appeal

## Set up

1. Create a free account at [resend.com](https://resend.com).
2. Open **API Keys**, create a key with **Sending access**, and add it to `apps/website/.env.local`:

   ```bash
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL=onboarding@resend.dev
   ```

3. Restart `pnpm dev`.

## The catch: who you can email

A new Resend account can only send **from** `onboarding@resend.dev` and only **to the email address you signed up to Resend with**. That's why `RESEND_FROM_EMAIL` is `onboarding@resend.dev` locally.

Emails go to the signed-in user's address. A `+clerk_test@example.com` account won't receive anything, so to test:

1. Sign up on your local site (your own Clerk app) with the **same email you used for Resend**.
2. Do the thing that sends the email, for example submit an application form.

✅ **You should now see** the email in your inbox and listed under **Emails** in the Resend dashboard.
