# Performance Review

Senior-engineer audit of the r/alevel Next.js codebase (App Router, Mongoose/MongoDB, Clerk auth). Findings are ordered by severity within each category.

**Stack:** Next.js App Router · MongoDB/Mongoose · Clerk · Upstash Redis (rate limiting only) · Cloudflare R2 · Cloudinary

---

## Summary

| Severity | Count |
|----------|-------|
| High     | 0     |
| Medium   | 3     |
| Low      | 2     |

---

## 4. Caching Opportunities

### Issue 4.6 — Redis used only for rate limiting

**Description:** Upstash Redis backs `lib/rateLimit.ts` but is not used for session, query-result, or auth caching.

**Severity:** Medium

**Why it matters:** Existing Redis infrastructure could cache expensive reads and auth lookups at low incremental cost.

**Files involved:**
- `lib/rateLimit.ts`

**Suggested fix:** Cache `UserData` roles by email with 60–300s TTL. Cache public list endpoints (certs, team) with tag-based invalidation.

---

### Issue 4.7 — No static asset cache headers in Next config

**Description:** `next.config.mjs` sets security headers (CSP, HSTS) but no `Cache-Control` for `/_next/static` or public assets.

**Severity:** Low

**Why it matters:** Browsers revalidate static chunks on every visit instead of treating them as immutable.

**Files involved:**
- `next.config.mjs` (headers section)

**Suggested fix:**
```js
{ source: "/_next/static/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }
```

---

## 5. Bundle Size & Large Files

### Issue 5.3 — Navigation component could be split further

**Description:** Shared site navigation is a single client component loaded on every `(home)` and `(others)` route.

**Severity:** Medium

**Why it matters:** Parsed and bundled on certificates, resources, apply, and all other `(others)` routes regardless of need.

**Files involved:**
- `components/site/Navigation.tsx`

**Suggested fix:** Split mobile overlay into a dynamically imported sub-component. Target ~200 lines in the always-loaded shell.

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
| Compound indexes on content models | `models/Topic.ts`, `models/MCQ.ts`, `models/Glossary.ts` |
| Slug unique indexes + roles index on lookup models | `models/blogsData.tsx`, `models/resources2Data.tsx`, `models/userData.tsx` |

---

## Recommended Fix Order

Issues below are the remaining backlog. Group items in the same batch when they touch the same files, patterns, or deploy window. Skip any item already resolved locally (e.g. team server-fetch is done — see §7).

### Phase 7 — Frontend bundle & static delivery (1 PR)

| Batch | Issues | Why together |
|-------|--------|--------------|
| **7B** | **5.3** Split Navigation mobile overlay · **4.7** `/_next/static` cache headers | Shell + `next.config.mjs` headers; improves repeat-visit load, not first paint |

---

### Phase 8 — Caching layer (1 PR, after database indexes and lean read paths are in place)

| Batch | Issues | Why together |
|-------|--------|--------------|
| **8A** | **4.6** Redis query/auth caching | Redis infra already exists for rate limiting; lean read paths and slug/roles indexes are in place so cached payloads are correct and cheap to serialize |

---

### Suggested PR sequence (summary)

```
7B  →  8A
```

**Highest impact next:** **7B** (split Navigation mobile overlay + `/_next/static` cache headers).

**Defer until data layer is stable:** **4.6** Redis caching — indexes and lean read paths are now in place; remaining 7.3 clone cleanup can land independently.

---

*Generated: June 2025. Re-run this audit after major auth, caching, or schema changes.*
