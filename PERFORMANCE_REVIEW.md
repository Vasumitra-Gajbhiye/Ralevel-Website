# Performance Review

Senior-engineer audit of the r/alevel Next.js codebase (App Router, Mongoose/MongoDB, Clerk auth). Findings are ordered by severity within each category.

**Stack:** Next.js App Router · MongoDB/Mongoose · Clerk · Redis (rate limiting + cache-aside) · Cloudflare R2 · Cloudinary

---

## Summary

| Severity | Count |
|----------|-------|
| High     | 0     |
| Medium   | 1     |
| Low      | 1     |

---

## 6. Bad Abstractions

### Issue 7.2 — Team page is client-side with HTTP loopback

**Description:** Team page is `"use client"` and fetches via `getAllTeam()` which HTTP-calls the app's own API from the browser.

**Severity:** Medium

**Why it matters:** Worst-of-all-worlds: client-side loading state + extra network hop (browser → API → DB).

**Files involved:**
- `app/(others)/team/page.tsx` (lines 631–808)
- `controller/getAllTeam.tsx`

**Suggested fix:** Server page queries `TeamData` directly or calls controller on server; pass `initialMembers` to presentation client.

---

### Issue 7.3 — Unnecessary `JSON.parse(JSON.stringify())` deep clones

**Description:** Multiple paths deep-clone Mongoose lean results via JSON serialization.

**Severity:** Low

**Why it matters:** Extra CPU and allocation on every call; often unnecessary when data is already plain objects.

**Files involved:**
- `lib/data/certificates.ts`
- `app/(admin)/admin/certificates/actions.ts`
- `app/(admin)/admin/forms/[formType]/page.tsx`
- `app/(others)/apply/[slug]/page.tsx`
- `app/(others)/apply/resource/page.tsx`
- `app/(admin)/admin/forms/[formType]/[slug]/responses/[submissionId]/page.tsx`
- `app/(others)/[board]/[level]/[subject]/[subjectCode]/[chapter]/flashcards/[set]/page.tsx`

**Suggested fix:** Return `.lean()` results directly. Use `structuredClone` only when mutation safety is required.

---

## 7. Positive Patterns (Keep & Extend)

These patterns are worth replicating elsewhere:

| Pattern | Location |
|---------|----------|
| Mongoose global connection cache with `bufferCommands: false` + `getNativeMongoClient` | `lib/mongodb.tsx` |
| Middleware `auth.protect()` on `/admin` + `/api/admin` | `proxy.ts` |
| Centralized admin section role rules | `lib/adminAccess.ts`, `app/(admin)/admin/layout.tsx` |
| Shared `requireRoles` helper for API authorization | `lib/requireRoles.ts` |
| `authorizeAdminApi` — auth before `connectDB()` + per-user rate limits on admin list GETs | `lib/adminApiAuth.ts`, `app/api/admin/**` |
| Parallel R2 uploads via `Promise.all` | `app/api/forms/[slug]/submit/route.ts`, `app/api/resources/submit/route.ts` |
| Field projection + `.lean()` on blog list | `lib/data/blogs.ts`, `app/api/blogs/route.tsx` |
| Canonical paginated blog list helper | `lib/data/blogs.ts` (`getPaginatedBlogList`) |
| Shared pagination helpers (`page`/`limit`, default 50) | `lib/pagination.ts`, `components/ui/list-pagination.tsx` |
| Paginated list endpoints (public + admin) | `app/api/certificates`, `app/api/blogs`, `app/api/admin/*` |
| Limited search results (limit 5) | `app/api/admin/access/search/route.ts` |
| ISR + `generateStaticParams` for resources | `app/(others)/resources/[slug]/page.tsx` |
| `unstable_cache` data layer + tag invalidation | `lib/data-cache.ts`, `lib/data/blogs.ts`, `lib/data/resources.ts`, `lib/data/curriculum.ts`, `lib/data/team.ts`, `lib/data/certificates.ts` |
| Redis cache-aside with tag invalidation (user data, public lists) | `lib/redis-cache.ts`, `lib/data/user-data.ts`, `lib/data/blogs.ts`, `lib/data/certificates.ts`, `lib/data/team.ts` |
| Parallel independent queries after `connectDB()` | `app/(others)/apply/[slug]/page.tsx`, `app/api/forms/create/route.ts` |
| Curriculum data layer + shared `connectDB` on all pages | `lib/data/curriculum.ts`, flashcards page |
| Filtered level-subject list + parallel topic page queries | `lib/data/curriculum.ts` (`getSubjectsForLevel`, `getTopicPageData` with `Promise.all`) |
| ISR + `generateStaticParams` for curriculum + blogs | `app/(others)/[board]/.../page.tsx`, `app/(others)/blogs/[slug]/page.tsx` |
| Server-fetch + client props (QOTD, profile, MCQ quiz, team, admin lists) | `app/(admin)/admin/qotd/page.tsx`, `app/(admin)/admin/blogs/page.tsx`, `app/(admin)/admin/access/page.tsx`, `app/(admin)/admin/info/page.tsx`, `app/(admin)/admin/graphic/page.tsx`, `app/(admin)/admin/scheduling/page.tsx`, `app/(others)/profile/page.tsx`, `app/(others)/team/page.tsx`, `app/(others)/[board]/.../topic-mcq-questions/[set]/page.tsx` |
| Request-scoped `fetchUserDataByEmail` + `getUserProfile` (page + API) | `lib/data/user-data.ts`, `lib/data/user-profile.ts`, `app/api/user/route.js` |
| Shared admin list data helpers | `lib/data/admin/blogs.ts`, `lib/data/admin/access.ts`, `lib/data/admin/info.ts`, `lib/data/admin/graphic.ts`, `lib/data/admin/scheduling.ts` |
| Redis rate limiting on public APIs | `lib/rateLimit.ts` |
| Form submit validation (file size, honeypot, rate limit) | `app/api/forms/[slug]/submit/route.ts` |
| Shared site Navigation + ContactUs (`variant` prop) | `components/site/Navigation.tsx`, `components/site/ContactUs.tsx` |
| Navigation mobile overlay lazy-loaded via `next/dynamic` | `components/site/Navigation.tsx`, `components/site/NavigationMobileOverlay.tsx` |
| Immutable `Cache-Control` on `/_next/static` | `next.config.mjs` |
| Compound indexes on content models | `models/Topic.ts`, `models/MCQ.ts`, `models/Glossary.ts` |
| Slug unique indexes + roles index on lookup models | `models/blogsData.tsx`, `models/resources2Data.tsx`, `models/userData.tsx` |

---

## Recommended Fix Order

Issues below are the remaining backlog. Skip any item already resolved locally (e.g. team server-fetch is done — see §7).

**Highest impact next:** **7.3** (unnecessary deep clones — independent cleanup).

**Defer until data layer is stable:** Remaining 7.3 clone cleanup can land independently.

---

*Generated: June 2025. Re-run this audit after major auth, caching, or schema changes.*
