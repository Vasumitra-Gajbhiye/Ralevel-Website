# Coolify deployment (monorepo)

This repo deploys as **two Coolify applications** from the same git repository:

| Coolify app | Dockerfile | Purpose |
|-------------|------------|---------|
| Website | `/Dockerfile.website` | Public Next.js site (`apps/website`) |
| Applications bot | `/Dockerfile.bot` | Discord pings, reminders, ban-appeal interactions (`apps/bot`) |

Do **not** run both in one container. Restarting the bot must not restart the website.

Base directory for both apps: `/` (repo root). Shared Docker network so the website can reach the bot by internal hostname.

## Architecture

- **Website container**: Next.js standalone on port `3000`
- **Applications bot container**: Node HTTP on port `8787` (restart policy: always)
- **Redis**: Separate Coolify Redis service (website cache / rate limits)
- **MongoDB**: Shared Atlas DB via `MONGODB_URI` (same database for both apps)

```text
User → website:3000
Website → BOT_INTERNAL_URL (e.g. http://applications-bot:8787) for Discord side effects
Discord Interactions → bot public URL /interactions  (preferred)
Coolify cron → bot /cron/form-reminders
```

## 1. Redis

1. Add a Redis service (`redis:7-alpine` or Coolify template).
2. Use the **internal** URL (never `localhost` from containers), e.g. `redis://default:PASSWORD@redis:6379`.

## 2. Website application

| Setting | Value |
|---------|-------|
| Build pack | Dockerfile |
| Dockerfile location | `/Dockerfile.website` |
| Base directory | `/` |
| Exposed port | `3000` |
| Health check | `/` (start period ~60s) |

### Website build variables

Same as before (`MONGODB_URI`, all `NEXT_PUBLIC_*`).

### Website runtime (Discord-related)

| Variable | Required | Notes |
|----------|----------|-------|
| `BOT_INTERNAL_URL` | Yes for Discord | Internal Coolify URL to bot, e.g. `http://applications-bot:8787` |
| `INTERNAL_BOT_SECRET` | Yes for Discord | Shared with bot; sent as `x-internal-bot-secret` |
| `DISCORD_CLIENT_ID` | Warning/timeout appeals | OAuth for Discord appeal form |
| `DISCORD_CLIENT_SECRET` | Warning/timeout appeals | OAuth |
| `DISCORD_PUBLIC_KEY` | Optional | Only if still proxying interactions via website |
| `DISCORD_GUILD_ID` | Warning/timeout appeals | OAuth / config gate |
| `RESEND_API_KEY` | Ban appeals + forms | Confirmation / decision emails |
| `CRON_SECRET` | Optional | Only if cron still hits website proxy |

**Do not put `DISCORD_BOT_TOKEN` on the website** — it belongs on the bot app.

## 3. Applications bot

| Setting | Value |
|---------|-------|
| Build pack | Dockerfile |
| Dockerfile location | `/Dockerfile.bot` |
| Base directory | `/` |
| Exposed port | `8787` |
| Restart policy | **Always** |
| Health check | `/health` |

Give the bot a public hostname (e.g. `applications-bot.ralevel.com`) for Discord Interactions, or keep interactions proxied via the website until cutover.

### Bot runtime env

See [`.env.bot.example`](../../../.env.bot.example):

| Variable | Required |
|----------|----------|
| `MONGODB_URI` | Yes (same website DB) |
| `INTERNAL_BOT_SECRET` | Yes (same as website) |
| `DISCORD_NOTIFICATIONS_ENABLED` | `true` |
| `DISCORD_BOT_TOKEN` | Yes |
| `DISCORD_APPLICATIONS_CHANNEL_ID` | Yes |
| `DISCORD_JR_ADMIN_ROLE_ID` / `DISCORD_SR_ADMIN_ROLE_ID` | Reminders |
| `DISCORD_PUBLIC_KEY` | Interactions |
| `DISCORD_GUILD_ID` | Appeals |
| `DISCORD_BAN_APPEAL_CHANNEL_ID` | Appeals |
| `DISCORD_APPEAL_REVIEWER_ROLE_IDS` | Optional override |
| `RESEND_API_KEY` | Ban appeal outcome emails |
| `RESEND_FROM_EMAIL` | Optional; defaults to `r/alevel <application@ralevel.com>` |
| `NEXT_PUBLIC_URL` or `SITE_URL` | Admin links in embeds |
| `CRON_SECRET` | Reminder cron |
| `PORT` | Default `8787` |

Bot permissions: View Channel, Send Messages, Embed Links, mention roles used in reminders; Manage Messages / DM as needed for appeals.

## 4. Discord Developer Portal

Set **Interactions Endpoint URL** to the bot:

```text
https://applications-bot.ralevel.com/interactions
```

Until DNS is ready, the website still proxies `POST /api/discord/interactions` → bot `/interactions`.

## 5. Form reminder cron (6am IST)

Prefer hitting the **bot** directly:

```bash
# Schedule: 30 0 * * * UTC (= 6:00 AM IST)
curl -fsS -H "Authorization: Bearer $CRON_SECRET" \
  "https://applications-bot.ralevel.com/cron/form-reminders"
```

Compatibility: `GET https://ralevel.com/api/cron/form-reminders` still proxies to the bot when `BOT_INTERNAL_URL` is set.

## 6. Local development

```bash
pnpm install
docker compose up -d   # Redis

# Terminal 1 — website
pnpm --filter @ralevel/website dev

# Terminal 2 — applications bot
pnpm --filter @ralevel/applications-bot dev
```

Set in website env: `BOT_INTERNAL_URL=http://127.0.0.1:8787` and matching `INTERNAL_BOT_SECRET`.

## 7. Docker smoke tests

```bash
# Website
docker build -f Dockerfile.website -t ralevel-website \
  --build-arg MONGODB_URI="$MONGODB_URI" \
  --build-arg NEXT_PUBLIC_URL="https://ralevel.com" \
  .

# Bot
docker build -f Dockerfile.bot -t ralevel-applications-bot .
```

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Form submits but no Discord ping | Bot down, or missing `BOT_INTERNAL_URL` / `INTERNAL_BOT_SECRET` on website |
| Interactions fail signature | Wrong `DISCORD_PUBLIC_KEY` on bot, or Interactions URL still pointing at old host |
| Website build OOM | Need ≥ 4 GB build RAM; see builder `NODE_OPTIONS` |
| Cron no-ops | Hit bot URL; ensure `CRON_SECRET` matches |
