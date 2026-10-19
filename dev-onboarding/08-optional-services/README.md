# 08 · Optional services

Set these up **only when a task needs them**. The site runs without all of them. Each page takes about 10–20 minutes.

| Service | Tier | You need it for | Page |
| --- | --- | --- | --- |
| Cloudinary | 2 | Uploading images in the admin pages | [cloudinary.md](cloudinary.md) |
| Stripe (test mode) | 2 | The `/minecraft-funding` checkout | [stripe.md](stripe.md) |
| Resend | 2 | Actually sending emails (otherwise they're logged) | [resend.md](resend.md) |
| PostHog | 2 | Working on analytics events | [posthog.md](posthog.md) |
| Gemini | 2 | Theory-answer marking (`/theory-practice`) | [gemini.md](gemini.md) |
| Discord bot | 2 | Ban appeals, application notifications, slash commands | [discord-bot.md](discord-bot.md) |
| Cloudflare R2 | 3 | Form file uploads, resource submissions | [r2.md](r2.md) (ask the owner first) |
| Google Drive | 3 | Only `/api/test-drive` | [google-drive.md](google-drive.md) (ask the owner first) |

Rules for every service:

- **Use your own free or test account.** Never use production keys, and don't ask for them.
- Keys go in `apps/website/.env.local` (or `apps/bot/.env` for the bot), never in code or chat.
- Restart `pnpm dev` after changing env vars.
