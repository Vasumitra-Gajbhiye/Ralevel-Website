# Redis caching

This app uses Redis for rate limiting and cache-aside data caching (user data, blogs, certificates, team).

## Local development

1. Start Redis:

```bash
docker compose up -d redis
```

2. Add to `.env.local`:

```env
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true
```

3. Run the app:

```bash
npm run dev
```

## Coolify (production VPS)

Redis runs as a **separate Coolify service** on the same network as the Next.js app — not as `localhost` from inside the app container.

### Setup

1. In Coolify, add a **Redis** service to your project (one-click template or `redis:7-alpine`).
2. Note the internal connection URL (hostname is usually the service name, e.g. `redis://default:YOUR_PASSWORD@redis:6379`).
3. In your Next.js app environment variables, set:
   - `REDIS_URL` — internal Redis URL from Coolify
   - `REDIS_ENABLED=true`
4. Deploy Redis first, then redeploy the Next.js app.

### Graceful degradation

If `REDIS_URL` is missing or Redis is unreachable, the app falls back to MongoDB directly. Rate limiting is skipped when Redis is unavailable.

## Cache tags

| Tag | Invalidated when |
|-----|------------------|
| `blogs` | Blog create/update/delete |
| `blog:{slug}` | Specific blog changed |
| `resources` | TTL only (no admin API for resources2 yet) |
| `resource:{slug}` | TTL only |
| `resources-legacy` | Legacy resource API mutations |
| `certs` | Certificate create/update/delete |
| `cert:{certId}` | Specific certificate changed |
| `team` | Team member create/delete |
| `user:{email}` | User profile update or role change |

`revalidateDataTags()` in `lib/data-cache.ts` clears both Next.js `unstable_cache` tags and matching Redis tag sets.

## Verification

1. **Cache population:** Call each endpoint twice:
   - `GET /api/blogs`
   - `GET /api/certificates`
   - `GET /api/team`
2. **Confirm keys:** `docker compose exec redis redis-cli KEYS 'cache:*'` — expect keys like `cache:blogs:list:1:50`, `cache:certs:list:1:50`, `cache:team:list:1:50`.
3. **Invalidation:** Create/delete a blog, cert, or team member as admin — related `cache:*` keys should be removed.
4. **User cache:** After a profile or role update, the `cache:user:email:*` key for that user is cleared.
5. **Degradation:** Stop Redis (`docker compose stop redis`) — app still serves data from MongoDB.
