# Developer onboarding

Welcome! These pages get you from a fresh laptop to running the r/alevel website locally, signed in, with admin access, on **Windows or macOS**. Where a step differs between the two, the page has a **Windows** and a **macOS** section.

You'll run everything against **your own** local databases and **your own** free/test accounts. You'll never need production keys or the production database.

## Do these in order (day one, about 2 hours)

| # | Page | Time |
| --- | --- | --- |
| 01 | [Prerequisites](01-prerequisites.md): Git, Node, pnpm, Docker, VS Code | 30–60 min |
| 02 | [Clone and install](02-clone-and-install.md) | 10 min |
| 03 | [Local databases](03-local-databases.md): start them and load the seed data | 15 min |
| 04 | [Environment variables](04-environment-variables.md): create your `.env.local` | 5 min |
| 05 | [Clerk](05-clerk-setup.md): your own sign-in app | 15 min |
| 06 | [Run the website](06-run-the-website.md) | 10 min |
| 07 | [Admin access](07-admin-access.md): give yourself roles locally, and how page access works | 10 min |

Then read these two before you start your first task:

- [09 · Project tour](09-project-tour.md): how the code is laid out
- [10 · Team rules](10-team-rules.md): branches, PRs, reviews, secrets

## Later, only when a task needs it

[08 · Optional services](08-optional-services/) has one short page per service: Cloudinary, Stripe, Resend, PostHog, Discord bot, Gemini, R2, Google Drive.

The env vars are grouped into **tiers**:

- **Tier 1** is everything in pages 01–07. You need it on day one.
- **Tier 2** services (Cloudinary uploads, Stripe, email, analytics, Discord, Gemini): you create your own free/test account when a task needs it.
- **Tier 3** (R2, Google Drive, QOTD): ask the owner first.

The site runs fine without Tier 2 and 3. Those features just show a clear error or quietly switch off.

## When you get stuck

1. Check [11 · Troubleshooting](11-troubleshooting.md).
2. If you've been stuck for **more than 45 minutes**, ask the owner. That's expected, not a failure.
3. If a step here was wrong or unclear, fix this page in a PR. That's a great first PR, and changes to `dev-onboarding/` never deploy anything.

## Three rules that matter most

- **Never touch production.** No production database, no production keys. Every script refuses to run against anything except your local databases.
- **Never commit or paste secrets.** The repo is public.
- **Never push to `main`.** Every change goes through a branch and a pull request.

The rest is in [10 · Team rules](10-team-rules.md). (`plan.md` in this folder is the owner's internal checklist. You don't need it.)
