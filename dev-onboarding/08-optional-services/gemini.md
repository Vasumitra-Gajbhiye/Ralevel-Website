# Gemini (theory-answer marking)

**Tier 2.** The theory practice pages send a student's answer to Google's Gemini model for marking (`/api/theory-eval`). Without a key, that route returns a "not configured" error. Everything else works.

## Set up

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey), sign in with a Google account, and create an API key. The free tier is plenty for development.
2. Add it to `apps/website/.env.local`:

   ```bash
   GEMINI_API_KEY=...
   ```

3. Restart `pnpm dev`.

The route is rate-limited per user and per IP when Redis is on. Locally Redis is off, so be gentle with the free quota.

✅ **You should now see** a marked result, with a score and feedback, when you submit an answer on a theory practice question while signed in.
