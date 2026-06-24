# Coolify deployment

Production deployment guide for the r/alevel Next.js app using the multi-stage `Dockerfile` and a separate Redis service.

## Architecture

- **App container**: Next.js standalone server on port `3000` (`node server.js`)
- **Redis**: Separate Coolify service on the same Docker network (see [REDIS.md](./REDIS.md))
- **MongoDB**: External (MongoDB Atlas)
- **Expected image size**: ~280–450 MB (standalone) vs ~1.5–2 GB (naive full `node_modules` approach)

## Prerequisites

- Coolify instance with Docker build support
- Git repository access
- Domain configured in Coolify (optional for first deploy)
- At least **4 GB RAM** available during build

## 1. Add Redis (if not already running)

1. In Coolify, add a **Redis** service to your project (`redis:7-alpine` or Coolify template).
2. Deploy Redis first.
3. Note the **internal** connection URL (hostname is the service name, e.g. `redis://default:PASSWORD@redis:6379`).

Do **not** use `localhost` or `127.0.0.1` for `REDIS_URL` from inside the app container.

## 2. Create the application

| Setting | Value |
|---------|-------|
| Build pack | **Dockerfile** |
| Dockerfile location | `/Dockerfile` |
| Base directory | `/` (repo root) |
| Exposed port | **3000** |
| Health check path | `/` |
| Health check start period | **60s** (first boot after build) |

## 3. Build-time environment variables

`NEXT_PUBLIC_*` variables are inlined at build time. Set these in Coolify **Build Variables** (or equivalent build-time env section):

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string — **required at build time** for SSG routes (`/resources/[slug]`, curriculum pages) that call `generateStaticParams` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk client auth |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | e.g. `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | e.g. `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | e.g. `/` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | e.g. `/` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary uploads |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | Analytics |
| `NEXT_PUBLIC_POSTHOG_HOST` | e.g. `https://eu.i.posthog.com` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe checkout |
| `NEXT_PUBLIC_URL` | Public site URL, e.g. `https://ralevel.com` |

If build-time `NEXT_PUBLIC_*` values are missing, the image may build successfully but client-side integrations (Clerk, PostHog, Stripe.js) will fail at runtime.

If `MONGODB_URI` is missing at build time, the Docker build will fail during page data collection (or earlier) because `.env` files are excluded from the image and the `Dockerfile` must declare matching `ARG` names for Coolify to pass build variables through.

**Also set `MONGODB_URI` at runtime** (see section 4) — the final image does not bake in this secret; it is only needed during the builder stage.

## 4. Runtime environment variables

Set these in Coolify **Environment Variables** (runtime only — never bake secrets into the image):

### Core

| Variable | Required | Notes |
|----------|----------|-------|
| `NODE_ENV` | Yes | `production` |
| `MONGODB_URI` | Yes | Same Atlas URI as build time (not baked into the image) |
| `NEXTAUTH_URL` | Yes | Public URL, e.g. `https://ralevel.com` (used by Stripe redirects) |

### Auth

| Variable | Required |
|----------|----------|
| `CLERK_SECRET_KEY` | Yes |

### Redis

| Variable | Required | Notes |
|----------|----------|-------|
| `REDIS_URL` | Recommended | Internal Coolify Redis URL |
| `REDIS_ENABLED` | Recommended | `true` |

App degrades gracefully if Redis is unavailable (see [REDIS.md](./REDIS.md)).

### Payments

| Variable | Required |
|----------|----------|
| `STRIPE_SECRET_KEY` | If using Stripe |
| `STRIPE_WEBHOOK_SECRET` | If using Stripe webhooks |

After deploy, point Stripe webhooks to `https://your-domain/api/webhook`.

### Storage and media

| Variable | Required |
|----------|----------|
| `CLOUDINARY_CLOUD_NAME` | If using Cloudinary |
| `CLOUDINARY_API_KEY` | If using Cloudinary |
| `CLOUDINARY_API_SECRET` | If using Cloudinary |
| `R2_ACCOUNT_ID` | If using R2 |
| `R2_ACCESS_KEY_ID` | If using R2 |
| `R2_SECRET_ACCESS_KEY` | If using R2 |
| `R2_BUCKET_NAME` | If using R2 |
| `R2_PUBLIC_URL` | If using R2 |
| `R2_FORMS_BUCKET_NAME` | If using form uploads |
| `R2_FORMS_PUBLIC_URL` | If using form uploads |

### Email, AI, and integrations

| Variable | Required |
|----------|----------|
| `RESEND_API_KEY` | If sending email |
| `GEMINI_API_KEY` | If using theory evaluation |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | If using Google Drive (full JSON as single-line string) |
| `DRIVE_ROOT_FOLDER_ID` | If using Google Drive |

### Discord application notifications

Posts to a Discord channel when a generic intake form is submitted. Runs inside the Next.js app (no separate bot container in Phase 1).

| Variable | Required | Notes |
|----------|----------|-------|
| `DISCORD_NOTIFICATIONS_ENABLED` | Yes | `true` to enable |
| `DISCORD_BOT_TOKEN` | If enabled | Bot token from [Discord Developer Portal](https://discord.com/developers/applications) |
| `DISCORD_APPLICATIONS_CHANNEL_ID` | If enabled | Snowflake ID of the target channel |
| `DISCORD_JR_ADMIN_ROLE_ID` | If using reminders | Jr admin role snowflake for day 5/7 reminder pings |
| `DISCORD_SR_ADMIN_ROLE_ID` | If using reminders | Sr admin role snowflake for day 7 reminder pings |

Bot needs **View Channel**, **Send Messages**, and **Embed Links** in that channel. For role mentions on reminder pings, the bot also needs permission to mention those roles. Notifications are fire-and-forget — a Discord failure does not fail the form submission.

### Form reminder cron (6am IST daily)

Sends escalating Discord reminders for unreviewed form applications (days 3, 5, and 7 after submission).

| Variable | Required | Notes |
|----------|----------|-------|
| `CRON_SECRET` | Yes | Bearer token for `GET /api/cron/form-reminders` |

Schedule in Coolify (or host cron) at **`30 0 * * *` UTC** (= 6:00 AM IST):

```bash
curl -fsS -H "Authorization: Bearer $CRON_SECRET" \
  "https://ralevel.com/api/cron/form-reminders"
```

### QOTD admin

| Variable | Required |
|----------|----------|
| `QOTD_MONGODB_URI` | If using QOTD admin |
| `QOTD_DATABASE_NAME` | If using QOTD admin |
| `QOTD_COLLECTION_NAME` | If using QOTD admin |
| `QOTD_TARGET_DOCUMENT_ID` | If using QOTD admin |

## 5. Resource limits

| Phase | RAM |
|-------|-----|
| Docker build | **≥ 4 GB** recommended (`NODE_OPTIONS=--max-old-space-size=3072` is set in the Dockerfile builder stage) |
| Runtime | **512 MB–1 GB** usually sufficient |

## 6. Deploy

1. Deploy Redis (if new).
2. Configure build and runtime variables.
3. Deploy the Next.js application.
4. Configure domain and TLS in Coolify reverse proxy.

## 7. Post-deploy verification

- [ ] `GET /` returns 200
- [ ] Clerk sign-in works
- [ ] `GET /api/blogs` responds
- [ ] `GET /sitemap.xml` is served (generated during build via `next-sitemap`)
- [ ] Redis cache hits on repeated `/api/blogs` calls (optional)
- [ ] Stripe webhook receives events (if applicable)

## Local Docker smoke test

```bash
# Build (pass NEXT_PUBLIC_* and MONGODB_URI as build args)
docker build -t r-alevel \
  --build-arg MONGODB_URI="$MONGODB_URI" \
  --build-arg NEXT_PUBLIC_URL="https://ralevel.com" \
  .

# Run (pass runtime secrets via --env-file)
docker run --rm -p 3000:3000 --env-file .env.production r-alevel
```

After a local `npm run build`, you can also test standalone output directly:

```bash
npm run start:standalone
```

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Build stops at "Running TypeScript" with no error | Truncated Coolify log — scroll for the real error; often OOM on a 4 GB VPS or missing `MONGODB_URI` in build variables / Dockerfile `ARG` |
| Build fails collecting page data for `/resources/[slug]` | `MONGODB_URI` not available in builder stage, or Atlas IP allowlist blocks the Hetzner VPS |
| Build OOM | Increase Coolify build memory to ≥ 4 GB; builder heap is capped at 3072 MB |
| App unreachable from proxy | Ensure `HOSTNAME=0.0.0.0` and port `3000` (set in Dockerfile) |
| Clerk/Stripe broken on client | Missing `NEXT_PUBLIC_*` at **build** time |
| Redis connection errors | `REDIS_URL` points to `localhost` instead of Coolify Redis service name |
| Google Drive errors | `GOOGLE_SERVICE_ACCOUNT_JSON` malformed; use escaped single-line JSON |
