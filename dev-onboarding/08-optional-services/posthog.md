# PostHog (analytics)

**Tier 2, and optional.** With no token, analytics are simply off and nothing breaks. Only set this up if you're adding or changing analytics events.

## Set up

1. Create a free account at [posthog.com](https://posthog.com) and pick the **EU** region. The site sends browser events through `/ingest`, which forwards to PostHog's EU servers, so a US project won't receive them.
2. Create a project and copy its **project API key** (it starts with `phc_`).
3. Add it to `apps/website/.env.local`:

   ```bash
   NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_...
   NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
   ```

4. Restart `pnpm dev`.

✅ **You should now see** events (page views, `user_signed_in`) in your PostHog project's **Activity** view a minute after you click around the local site.
