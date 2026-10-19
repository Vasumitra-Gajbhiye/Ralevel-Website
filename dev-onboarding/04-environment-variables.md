# 04 · Environment variables

Time: about 5 minutes.

The website reads its settings and keys from `apps/website/.env.local`. You make it from the template, `apps/website/.env.example`, which explains every variable in a comment.

## 1. Create your `.env.local`

### macOS

```bash
cp apps/website/.env.example apps/website/.env.local
```

### Windows (PowerShell)

```powershell
Copy-Item apps\website\.env.example apps\website\.env.local
```

The defaults already work for the database, site URL, images and Redis. The only Tier 1 values left blank are the two **Clerk keys**. You'll fill those in on the next page, [05 · Clerk](05-clerk-setup.md).

## 2. What's in it

| Group | Variables | Tier | What happens without it | How to set it up |
| --- | --- | --- | --- | --- |
| Database | `MONGODB_URI` | 1 | Nothing works | Default is fine ([03](03-local-databases.md)) |
| Site URL | `NEXT_PUBLIC_URL` | 1 | Links in emails/Discord point to the wrong place | Default is fine |
| Clerk | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, plus 4 URL settings | 1 | No page loads | [05](05-clerk-setup.md) |
| Images | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | 1 | Pages with images crash | Keep the default. It's the site's public image account, not a secret. |
| Redis | `REDIS_ENABLED`, `REDIS_URL` | 1 (off) | Nothing; caching and rate limits are off | `apps/website/src/docs/REDIS.md` |
| Image uploads | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | 2 | Image uploads in the admin pages fail | [cloudinary](08-optional-services/cloudinary.md) |
| Payments | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 2 | Minecraft-funding checkout fails | [stripe](08-optional-services/stripe.md) |
| Email | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | 2 | Emails are skipped and logged in your terminal instead | [resend](08-optional-services/resend.md) |
| Analytics | `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST` | 2 | Analytics are off (that's fine) | [posthog](08-optional-services/posthog.md) |
| AI marking | `GEMINI_API_KEY` | 2 | Theory-answer marking returns an error | [gemini](08-optional-services/gemini.md) |
| Discord | `DISCORD_*`, `BOT_INTERNAL_URL`, `INTERNAL_BOT_SECRET`, `CRON_SECRET` | 2 | Ban-appeal Discord login and bot notifications are off | [discord-bot](08-optional-services/discord-bot.md) |
| File uploads | `R2_*` | 3 | Form file uploads and resource submissions fail | [r2](08-optional-services/r2.md) (ask the owner first) |
| Google Drive | `GOOGLE_SERVICE_ACCOUNT_JSON`, `DRIVE_ROOT_FOLDER_ID` | 3 | Only `/api/test-drive` fails | [google-drive](08-optional-services/google-drive.md) |
| QOTD | `QOTD_*` | 3 | `/admin/qotd` shows an empty list | Ask the owner |
| Dev toggle | `TASKS_DEV_IMPERSONATION` | — | `/tasks` "view as" is off | [07](07-admin-access.md) |

**After changing `.env.local`, restart `pnpm dev`.** Next.js only reads the file at startup.

The Discord bot (`apps/bot`) has its own env file. You only need it for Discord work, and [discord-bot](08-optional-services/discord-bot.md) explains it.

## 3. Secret rules

1. **Never commit `.env` files.** They're gitignored, so never force-add them.
2. **Never paste keys anywhere:** not in code, issues, PRs, chat messages or screenshots. The repo is public.
3. **Only use your own development/test keys.** Clerk keys start with `pk_test_` / `sk_test_`; Stripe keys with `sk_test_` / `pk_test_`. You'll never be given production keys or the production database, so don't ask.
4. **If you leak something, even your own dev key,** revoke or rotate it in that service's dashboard, then tell the owner right away. Nobody gets blamed. Leaks that get hidden are the dangerous ones.
5. GitGuardian scans every PR for secrets. If it flags yours, stop and tell the owner.

✅ **You should now see** `apps/website/.env.local` in your editor, and `git status` doesn't list it (that means it's ignored, as it should be).
