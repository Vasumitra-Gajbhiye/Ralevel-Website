# 05 · Clerk (sign-in)

The website uses [Clerk](https://clerk.com) for sign-in. You'll create **your own** free Clerk app and set it up to match production. You never use the real r/alevel Clerk app.

Time: about 15 minutes. This is the same on Windows and macOS (it's all in the browser).

## 1. Create the app

1. Sign in at [dashboard.clerk.com](https://dashboard.clerk.com).
2. Click **Create application**.
3. Name it `ralevel-dev-<yourname>`.
4. Under sign-in options, turn on **Email**, **Google** and **Discord**. Leave everything else off.
5. Click **Create application**.

You get a **Development** instance. That's the only one you need. Don't create a Production instance.

## 2. Match the production settings

Go to **Configure → User & authentication**.

**Email tab**

- **Sign-up with email**: on
  - **Require email address**: on
  - **Verify at sign-up**: on, with **Email verification code** ticked and **Email verification link** unticked
- **Sign-in with email**: on
  - **Email verification code**: on
  - **Email verification link**: off

**Password tab**

- Turn password **on** so it's required at sign-up. Leave the strength rules at their defaults.

**User model tab**

- **First and last name**: on, but **not** required.

**Leave off:** Phone, Username, Passkeys, Biometric, Multi-factor, Organizations, Billing.

**SSO connections**

- **Google** and **Discord** should show as enabled. In development Clerk uses its own shared credentials, so you don't need to set anything up with Google or Discord.

**Protect**

- Leave **bot protection** on (the default).

## 3. Copy your keys into `.env.local`

Open **API keys** in the left sidebar, choose **Next.js**, and copy the two keys into `apps/website/.env.local`, which you created in [04 · Environment variables](04-environment-variables.md):

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Already in .env.example, don't change these
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

- Both keys must start with `pk_test_` / `sk_test_`. If you ever see `pk_live_` or `sk_live_`, that's production. Don't use it, and tell the owner.
- `CLERK_SECRET_KEY` is a secret. Never commit it, and never paste it in chat, an issue, a PR or a screenshot.

## Things you don't need

- **Webhooks.** Production uses a Clerk webhook, but locally the site creates your user record the first time you sign in.
- **Paths, domains, customization.** The site uses its own `/sign-in` and `/sign-up` pages and styles them in code (`src/lib/clerkAppearance.ts`).
- **A custom session token.** The comment at the top of `src/lib/getAuthSession.ts` mentions one, but production doesn't use it. Leave **Sessions → Customize session token** as `{}`.

## Tips

- **Test sign-ups without a real inbox:** use an email like `yourname+clerk_test@example.com`. The verification code is always `424242`.
- **Pick a strong password.** Clerk rejects passwords that have shown up in data breaches, even in development.
- **You'll start as a normal user.** [07 · Admin access](07-admin-access.md) shows how to give yourself admin roles locally.

✅ **You should now see** your `ralevel-dev-<yourname>` app in the Clerk dashboard, with Email, Password, Google and Discord enabled, and both `pk_test_` / `sk_test_` keys in `apps/website/.env.local`. You'll test the sign-in in [06 · Run the website](06-run-the-website.md).
