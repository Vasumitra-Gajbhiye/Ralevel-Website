# r/alevel website

Next.js public site + Discord REST helpers for form notifications, reminders, and ban appeals.

| Package | Path | Deploy |
|---------|------|--------|
| `@ralevel/website` | `apps/website` | [`Dockerfile.website`](./Dockerfile.website) |
| `@r-alevel/discord-bot` | `packages/discord-notify` | Bundled into the website image (not a separate process) |

The **main Discord gateway bot** (XP, moderation, welcome, etc.) lives in a **separate repo** (`ralevel-discord-bot`). It is not part of this codebase.

Coolify: [`docs/COOLIFY.md`](./docs/COOLIFY.md)

## Local development

```bash
pnpm install
docker compose up -d redis   # optional, for website cache

# Env: apps/website/.env.local
pnpm dev:website
```
