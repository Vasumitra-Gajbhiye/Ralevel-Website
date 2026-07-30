# r/alevel monorepo

Public website + Discord gateway bot in one repository.

| Package | Path | Coolify Dockerfile |
|---------|------|--------------------|
| `@ralevel/website` | `apps/website` | [`Dockerfile.website`](./Dockerfile.website) |
| `@ralevel/bot` | `apps/bot` | [`Dockerfile.bot`](./Dockerfile.bot) |
| `@ralevel/db` / `@ralevel/shared` | `packages/*` | used by the bot |
| `@r-alevel/discord-bot` | `packages/discord-notify` | REST helpers for website form/appeal notifications |

Deploy guide: [`docs/COOLIFY.md`](./docs/COOLIFY.md)

## Local development

```bash
pnpm install
docker compose up -d redis

# Website (apps/website/.env.local)
pnpm dev:website

# Gateway bot (repo-root .env — see .env.bot.example)
pnpm dev:bot
```

## Website features

Official web platform for the r/alevel student learning community: certificates, admin tools, blogs, resources, Discord form notifications, and ban appeals.
