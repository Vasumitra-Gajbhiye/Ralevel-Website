# 06 · Run the website

Time: about 10 minutes. Before you start, you need:

- the databases running and seeded ([03](03-local-databases.md))
- `apps/website/.env.local` with your Clerk keys ([04](04-environment-variables.md), [05](05-clerk-setup.md))

## 1. Start it

From the repo root:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The **first** load of each page is slow (often 20–60 seconds), because Next.js compiles a page the first time you open it. After that it's quick. To stop the server, press `Ctrl+C` in the terminal.

## 2. Sign up

1. Click **Sign in**, then **Sign up**.
2. Use a test email like `yourname+clerk_test@example.com` and a strong password. Clerk rejects passwords that have appeared in data breaches.
3. When it asks for a verification code, enter `424242`. No real email is sent for `+clerk_test` addresses.

Signing in with Google works too. The first time you sign in, the site creates your user record in your local database.

## 3. Click through

Signed out:

- `/`: the homepage, with images
- `/learn`: pick a board, level and subject, then open a topic
- `/resources`, `/blogs` (open a post), `/scholarships`, `/team`, `/certificates`

Signed in:

- `/profile`: your profile

`/admin` and `/tasks` need roles. Set them up next, in [07 · Admin access](07-admin-access.md).

## Normal messages in the terminal

These are expected and fine:

- `[redis] … disabled`: Redis is off locally
- `[email] RESEND_API_KEY is not set, skipped "…"`: emails are logged instead of sent
- warnings about deprecated packages or outdated browser data

Anything with `Error` in red that breaks a page is not normal. See [11 · Troubleshooting](11-troubleshooting.md).

## The Discord bot (optional)

You don't need the bot unless you're working on Discord features. To run it, use a second terminal and `pnpm dev:bot`. Set it up first with [discord-bot](08-optional-services/discord-bot.md).

✅ **You should now see** the homepage at http://localhost:3000 with its images, be signed in with your test account, and see your account on `/profile`.
