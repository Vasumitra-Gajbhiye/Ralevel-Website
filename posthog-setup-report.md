<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into your r/alevel Next.js App Router project. Here is a summary of all changes made:

**Initialization:** PostHog is initialized via `instrumentation-client.ts` (the recommended approach for Next.js 15.3+). The client-side SDK captures exceptions automatically, runs in debug mode in development, and proxies all analytics traffic through `/ingest` to avoid ad-blockers. A server-side PostHog client is exposed via `lib/posthog-server.ts` for use in API routes and auth callbacks.

**Reverse proxy:** `next.config.mjs` was updated with `/ingest` rewrites pointing to `eu.i.posthog.com`, keeping all PostHog traffic same-origin (no CSP changes required).

**User identification:** When a user signs in via Google OAuth, the `signIn` callback in `lib/auth.ts` calls `posthog.identify()` server-side with their email as the distinct ID, plus a `user_signed_in` event marking whether they are new or returning. Resource contributors are also identified server-side via their email when they submit resources.

**Error tracking:** `posthog.captureException()` is called in the catch blocks of both the form submission handler (`forms/[slug]/pageClient.tsx`) and the resource submission handler (`forms/resource/pageClient.tsx`), plus automatic unhandled exception capture is enabled globally via `instrumentation-client.ts`.

## Events

| Event | Description | File |
|---|---|---|
| `blog_post_clicked` | User clicks a featured or listed blog post from the blogs listing | `app/(others)/blogs/BlogsClient.tsx` |
| `blog_show_all_clicked` | User clicks "View All" / "Show Less" on the blog list | `app/(others)/blogs/BlogsClient.tsx` |
| `blog_post_viewed` | User views an individual blog post (top of reading funnel) | `app/(others)/blogs/[slug]/BlogPostLayout.tsx` |
| `form_submitted` | User successfully submits an application form (client-side) | `app/(others)/forms/[slug]/pageClient.tsx` |
| `resource_submitted` | User successfully submits community resources (client-side) | `app/(others)/forms/resource/pageClient.tsx` |
| `resource_link_clicked` | User clicks a resource link (notes or past papers) | `app/(others)/resources/[slug]/ResourceClient.tsx` |
| `glossary_term_searched` | User selects a term from the glossary search | `app/(others)/[board]/[level]/[subject]/[subjectCode]/glossary/components/GlossarySearch.tsx` |
| `form_submitted` | Server-side: form submission created in DB | `app/api/forms/[slug]/submit/route.ts` |
| `resource_submitted` | Server-side: resource submission created in DB | `app/api/resources/submit/route.ts` |
| `user_signed_in` | Server-side: user signs in via Google OAuth | `lib/auth.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics:** https://eu.posthog.com/project/160328/dashboard/625371
- **Form Submissions Over Time:** https://eu.posthog.com/project/160328/insights/rPVK5GkJ
- **Resource Submissions Over Time:** https://eu.posthog.com/project/160328/insights/sDQE3ff2
- **Blog Engagement Funnel** (clicked → viewed): https://eu.posthog.com/project/160328/insights/WGT9rFv6
- **Resource Link Clicks by Type:** https://eu.posthog.com/project/160328/insights/3XkAXwsT
- **New & Returning User Sign-Ins:** https://eu.posthog.com/project/160328/insights/mImq3Un3

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
