# 09 · Project tour

A map of the codebase. Read it once before your first task, then come back when you need it.

## The monorepo

```
apps/website/          the Next.js 16 site (most of your work happens here)
apps/bot/              the "applications" Discord bot, a small Node HTTP server
packages/discord/      Discord helpers shared by the website and the bot
scripts/db/            local database tooling (db:up, db:restore, guards)
dev-onboarding/        these docs
docker-compose.dev.yml your local MongoDB + Redis
Dockerfile.*, .github/ production builds and deploys (ask before touching)
```

It's a **pnpm workspace**. Run commands from the repo root (`pnpm dev`, `pnpm typecheck`, `pnpm db:up`), or target one app with `pnpm --filter @ralevel/website <script>`.

## Inside `apps/website/src`

| Folder | What's in it |
| --- | --- |
| `app/` | Pages and API routes (Next.js App Router) |
| `app/(home)/` | The homepage |
| `app/(others)/` | Public pages: `learn`, `resources`, `blogs`, `scholarships`, `apply`, `certificates`, `profile`, … |
| `app/(admin)/admin/` | The admin panel |
| `app/(tasks)/` | The `/tasks` workspace |
| `app/api/` | API routes (`route.ts` files) |
| `components/` | React components, grouped by feature. `components/ui/` holds the shared building blocks (button, dialog, select, table, …) |
| `lib/` | Server and shared logic: auth, roles, database, caching, emails, uploads, Discord |
| `models/` | Mongoose models, one per MongoDB collection |
| `proxy.ts` | Runs before every request. Next.js 16 calls this `proxy` (it used to be `middleware`). It sets up Clerk and requires sign-in for `/admin`, `/api/admin` and `/tasks`. |

The folder names in brackets, like `(others)`, are **route groups**. They organise files and share layouts, but don't appear in the URL. `app/(others)/blogs/page.tsx` is just `/blogs`.

## How sign-in and roles work

1. **Clerk** handles sign-in (`/sign-in`, `/sign-up`).
2. On the server, `getAuthSession()` (`lib/getAuthSession.ts`) gives you the signed-in user, their roles and their `UserData` id. The first time someone signs in, `ensureUserData()` creates their `UserData` record in MongoDB.
3. Roles are stored on the user's `UserData` and copied to Clerk's user metadata. The role list is in `lib/roles.ts`.
4. **Always check roles on the server** (`requireRoles`, or the role groups in `lib/roles.ts`). Hiding a button isn't access control.

## Data

- **MongoDB through Mongoose.** Call `connectDB()` from `lib/mongodb.tsx`, then use a model from `models/`.
- **Redis** (optional) caches some reads and enforces rate limits (`lib/redis*.ts`, `lib/rateLimit.ts`). Locally it's off, and everything still works without it.

## Files and images

- **Images** come from Cloudinary. Build image URLs with the helpers in `lib/cloudinary.ts`.
- **File uploads** (form attachments, resource submissions) go to Cloudflare R2 (`lib/r2.ts`, `lib/r2Upload.ts`).

## Email, payments, analytics, AI

- **Email:** `lib/emails/sendEmail.ts` (Resend). Templates are next to it.
- **Payments:** Stripe (`lib/stripe.ts`, `app/api/checkout`, `app/api/webhook`), used by `/minecraft-funding`.
- **Analytics:** PostHog (`instrumentation-client.ts`, `lib/posthog-server.ts`).
- **AI marking:** Gemini (`app/api/theory-eval`).

## The Discord bot

The website never talks to Discord directly for applications and appeals. Instead it sends a small HTTP request to the bot (`lib/discord/botClient.ts`, authenticated with `INTERNAL_BOT_SECRET`), and the bot posts to Discord and handles slash commands and buttons. If `BOT_INTERNAL_URL` isn't set, the website just skips those calls.

## How code reaches production

1. You open a PR. CI checks that the code type-checks, on Linux and Windows.
2. The owner reviews it and it's squash-merged into `main`.
3. If the merge changed `apps/website/**` or `packages/**`, GitHub Actions builds the website image and **deploys it to production**. The same goes for `apps/bot/**` or `packages/discord/**` and the bot.

So **merging is shipping**. Changes that only touch `dev-onboarding/` or other docs don't deploy.

## UI conventions

- **Keep it minimal and easy to navigate.** Fewer, clearer controls are better than dense dashboards, and details can appear when someone asks for them (expand, open a dialog).
- **Reuse `components/ui/*`** before writing a new button, dialog, select or table.
- Style with Tailwind classes, the way the surrounding code does.
- Check every UI change on a phone-sized screen too.
