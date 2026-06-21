# Performance Review

Senior-engineer audit of the r/alevel Next.js codebase (App Router, Mongoose/MongoDB, Clerk auth). Findings are ordered by severity within each category.

**Stack:** Next.js App Router · MongoDB/Mongoose · Clerk · Upstash Redis (rate limiting only) · Cloudflare R2 · Cloudinary

---

## Summary

| Severity | Count |
|----------|-------|
| High     | 2     |
| Medium   | 4     |
| Low      | 5     |

---

## 1. Auth & Session

### Issue 1.3 — Duplicate DB read on profile API

**Description:** `POST /api/user` calls `getAuthSession()` (which already queries `UserData`) and then runs a second `UserData.findOne({ email })` for the full profile payload.

**Severity:** Medium

**Why it matters:** Every profile load pays for two identical DB lookups.

**Files involved:**
- `app/api/user/route.js` (lines 72, 98)
- `lib/getAuthSession.ts`
- `app/(others)/profile/page.tsx` (client fetch via `useEffect`)

**Suggested fix:** Extend `getAuthSession` or add a `getUserProfile(email)` helper that returns full profile in one query. Better: server-render profile data and pass as props to a thin client form.

---

## 2. Database Queries

### Issue 2.4 — Level page loads entire subjects collection

**Description:** The board/level page runs `Subject.find()` with no filter on `board` or `level`, then deduplicates in JavaScript.

**Severity:** Medium

**Why it matters:** Every curriculum navigation hit loads all subjects regardless of the URL params.

**Files involved:**
- `app/(others)/[board]/[level]/page.tsx` (lines 15–18)

**Suggested fix:** Query with `{ board, level }` filter. Add a compound index on the Subject model if not present.

---

### Issue 2.7 — Two-step contributor search in resource submissions

**Description:** When searching submissions by name, the route first queries `Contributor` with unanchored regex, then queries `ResourceSubmission` with `.populate()`.

**Severity:** Medium

**Why it matters:** Two round-trips per search; unanchored regex can trigger collection scans.

**Files involved:**
- `app/api/admin/resource-submissions/route.ts` (lines 50–72)

**Suggested fix:** Single aggregation with `$lookup` + `$match`. Anchor regex (`^term`) or use Atlas Search / text index on contributor name fields.

---

## 3. Sequential Async Operations

### Issue 3.2 — Redundant sequential DB writes in resource submit

**Description:** Contributor is saved twice (`contributor.save()` at lines 143 and 161). Submission document is created before uploads complete, leaving orphaned records on upload failure.

**Severity:** Medium

**Why it matters:** Extra writes add latency; partial failures require manual cleanup.

**Files involved:**
- `app/api/resources/submit/route.ts` (lines 131–161)

**Suggested fix:** Single contributor update. Create submission only after uploads succeed, or use a `status: "pending"` field with a cleanup job.

---

### Issue 3.3 — Sequential topic queries on topic page

**Description:** Topic page runs `Topic.findOne()` then `Topic.find()` for chapter topics sequentially after a single `connectDB()`.

**Severity:** Medium

**Why it matters:** Waterfall latency equals sum of both query times.

**Files involved:**
- `app/(others)/[board]/[level]/[subject]/[subjectCode]/[chapter]/[topic]/page.tsx` (lines 42–74)

**Suggested fix:** `Promise.all([findOne(...), find({ chapterId }).sort(...)])`, or fetch all chapter topics once and pick current in memory.

---

### Issue 3.4 — Sequential form + auth on apply page

**Description:** Apply form page runs `connectDB()` → `Form.findOne()` → `getAuthSession()` sequentially even though form lookup and auth are independent after DB connect.

**Severity:** Low

**Why it matters:** Adds unnecessary latency on every apply page visit.

**Files involved:**
- `app/(others)/apply/[slug]/page.tsx` (lines 16–19)

**Suggested fix:** After `connectDB()`, run `Promise.all([Form.findOne(...), getAuthSession()])`.

---

### Issue 3.5 — Independent queries not parallelized in form create

**Description:** Form creation checks slug uniqueness and fetches latest form index sequentially.

**Severity:** Low

**Why it matters:** Minor added latency on write path.

**Files involved:**
- `app/api/forms/create/route.ts` (lines 101–107)

**Suggested fix:** `Promise.all([Form.findOne({ slug }), Form.findOne({ formType }).sort(...)])`.

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

### Issue 5.4 — Global KaTeX CSS in `(others)` layout

**Description:** `katex/dist/katex.min.css` is imported in the `(others)` layout, loading on every route in the group.

**Severity:** Medium

**Why it matters:** KaTeX CSS is unnecessary on certificates, apply, team, and other non-math routes.

**Files involved:**
- `app/(others)/layout.tsx` (line 1)

**Suggested fix:** Import KaTeX CSS only in markdown/math components or specific quiz/content routes.

---

### Issue 5.5 — All Poppins font weights loaded in multiple layouts

**Description:** Root and nested layouts load Poppins with weights 100–900. Nested layouts re-declare fonts already set in root.

**Severity:** Low

**Why it matters:** ~9 font files downloaded; duplicate font setup in nested layouts.

**Files involved:**
- `app/layout.tsx` (lines 9–11)
- `app/(others)/layout.tsx` (lines 6–8)
- `app/(home)/layout.tsx` (lines 6–8)

**Suggested fix:** Load only `["400", "500", "600", "700"]` in root layout. Remove duplicate font declarations from nested layouts.

---

### Issue 5.6 — `import * as Icons from "lucide-react"` on server pages

**Description:** Apply and forms listing pages import the entire lucide-react namespace.

**Severity:** Low

**Why it matters:** Can prevent tree-shaking and inflate the server bundle.

**Files involved:**
- `app/(others)/apply/page.tsx` (line 213)

**Suggested fix:** Import only the icons used (`Shield`, `PenLine`, etc.) by name.

---

## 6. Duplicate Code

### Issue 6.4 — Inline `connectDB()` copies bypass shared connection cache

**Description:** Several curriculum pages define local `connectDB()` using `mongoose.connection.readyState` instead of the global cached connection in `lib/mongodb.tsx`.

**Severity:** Medium

**Why it matters:** Race-prone under serverless concurrency; inconsistent connection handling. Flashcards page queries without calling connect at all.

**Files involved:**
- `app/(others)/[board]/[level]/[subject]/[subjectCode]/page.tsx` (lines 14–17)
- `app/(others)/[board]/[level]/[subject]/[subjectCode]/glossary/page.tsx` (lines 16–19)
- `app/(others)/[board]/[level]/[subject]/[subjectCode]/[chapter]/[topic]/page.tsx` (lines 14–17)
- `app/(others)/[board]/[level]/[subject]/[subjectCode]/[chapter]/flashcards/page.tsx` (queries without connect)

**Suggested fix:** Replace all with `import connectDB from "@/lib/mongodb"`.

---

## 7. Bad Abstractions

### Issue 7.1 — Client admin pages re-fetch data the server already has access to

**Description:** Admin CRUD pages are `"use client"` components that fetch from API routes on mount instead of receiving server-fetched initial data.

**Severity:** Medium

**Why it matters:** Empty shell → loading spinner → client fetch → re-render. Blogs and access now receive server session props; other admin pages still fetch on mount.

**Files involved:**
- `app/(admin)/admin/blogs/page.tsx`
- `app/(admin)/admin/access/page.tsx`
- `app/(admin)/admin/info/page.tsx`
- `app/(admin)/admin/graphic/page.tsx`
- `app/(admin)/admin/scheduling/page.tsx`

**Suggested fix:** Follow the QOTD pattern (`app/(admin)/admin/qotd/page.tsx`): server-fetch `initialData`, pass to client component. Mutations stay client-side.

---

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

### Issue 7.5 — Separate Mongo client for QOTD

**Description:** QOTD actions maintain their own `MongoClient` + `global._mongoClientPromiseQotd` parallel to `lib/mongodb.tsx`.

**Severity:** Low

**Why it matters:** Two connection pools if both are active; confusing for operators.

**Files involved:**
- `app/(admin)/admin/qotd/actions.ts`
- `lib/mongodb.tsx`

**Suggested fix:** Unify on shared connection unless QOTD uses a separate cluster/URI by design.

---

## 8. Scalability Limitations

### Issue 8.4 — Admin API routes have no rate limiting

**Description:** Public routes use `enforceRateLimit`; admin routes do not.

**Severity:** Low

**Why it matters:** Authenticated abuse (scraping all submissions/certs) is unthrottled.

**Files involved:**
- All `app/api/admin/**` routes

**Suggested fix:** Add per-user rate limits on expensive list/export endpoints.

---

### Issue 8.5 — `connectDB()` before auth on forbidden requests

**Description:** Many admin routes call `connectDB()` before `getAuthSession()` and role checks.

**Severity:** Low

**Why it matters:** On 403 responses, work is already done opening DB and running auth DB lookup. Connection is cached, but `getAuthSession` still hits MongoDB.

**Files involved:**
- `app/api/admin/helper/route.ts` (lines 25–26)
- `app/api/admin/access/search/route.ts` (lines 9–10)
- Pattern repeated across admin routes

**Suggested fix:** Auth + role check first; call `connectDB()` only after authorization passes.

---

### Issue 8.6 — Unused duplicate Mongo connection module

**Description:** `lib/mongoClient.ts` exists but is unused while `lib/mongodb.tsx` is used everywhere.

**Severity:** Low

**Why it matters:** Confusing for contributors; risk of introducing a second connection pool.

**Files involved:**
- `lib/mongoClient.ts`
- `lib/mongodb.tsx`

**Suggested fix:** Delete `lib/mongoClient.ts` or consolidate on one pattern.

---

## 9. Positive Patterns (Keep & Extend)

These patterns are worth replicating elsewhere:

| Pattern | Location |
|---------|----------|
| Mongoose global connection cache with `bufferCommands: false` | `lib/mongodb.tsx` |
| Middleware `auth.protect()` on `/admin` + `/api/admin` | `proxy.ts` |
| Centralized admin section role rules | `lib/adminAccess.ts`, `app/(admin)/admin/layout.tsx` |
| Shared `requireRoles` helper for API authorization | `lib/requireRoles.ts` |
| Parallel R2 uploads via `Promise.all` | `app/api/forms/[slug]/submit/route.ts`, `app/api/resources/submit/route.ts` |
| Field projection + `.lean()` on blog list | `lib/data/blogs.ts`, `app/api/blogs/route.tsx` |
| Canonical paginated blog list helper | `lib/data/blogs.ts` (`getPaginatedBlogList`) |
| Shared pagination helpers (`page`/`limit`, default 50) | `lib/pagination.ts`, `components/ui/list-pagination.tsx` |
| Paginated list endpoints (public + admin) | `app/api/certificates`, `app/api/blogs`, `app/api/admin/*` |
| Limited search results (limit 5) | `app/api/admin/access/search/route.ts` |
| ISR + `generateStaticParams` for resources | `app/(others)/resources/[slug]/page.tsx` |
| `unstable_cache` data layer + tag invalidation | `lib/data-cache.ts`, `lib/data/blogs.ts`, `lib/data/resources.ts`, `lib/data/curriculum.ts`, `lib/data/team.ts`, `lib/data/certificates.ts` |
| ISR + `generateStaticParams` for curriculum + blogs | `app/(others)/[board]/.../page.tsx`, `app/(others)/blogs/[slug]/page.tsx` |
| Server-fetch + client props (QOTD, profile, MCQ quiz, team) | `app/(admin)/admin/qotd/page.tsx`, `app/(others)/profile/page.tsx`, `app/(others)/team/page.tsx`, `app/(others)/[board]/.../topic-mcq-questions/[set]/page.tsx` |
| Redis rate limiting on public APIs | `lib/rateLimit.ts` |
| Form submit validation (file size, honeypot, rate limit) | `app/api/forms/[slug]/submit/route.ts` |
| Shared site Navigation + ContactUs (`variant` prop) | `components/site/Navigation.tsx`, `components/site/ContactUs.tsx` |
| Compound indexes on content models | `models/Topic.ts`, `models/MCQ.ts`, `models/Glossary.ts` |
| Slug unique indexes + roles index on lookup models | `models/blogsData.tsx`, `models/resources2Data.tsx`, `models/userData.tsx` |

---

## Recommended Fix Order

Issues below are the remaining backlog. Group items in the same batch when they touch the same files, patterns, or deploy window. Skip any item already resolved locally (e.g. team server-fetch is done — see §9).

### Phase 3 — Auth & admin infrastructure (1 PR)

Centralize authorization before refactoring admin pages that depend on it.

| Batch | Issues | Why together |
|-------|--------|--------------|
| **3B** | **8.5** Auth before `connectDB()` on admin routes · **8.4** Admin rate limiting | Same admin API routes; reorder handler flow, then add `enforceRateLimit` per-user on list/export endpoints |

---

### Phase 4 — Eliminate client-side data fetching (2–3 PRs)

Highest UX impact for admin and profile; follow the QOTD / team server-fetch pattern in §9.

| Batch | Issues | Why together |
|-------|--------|--------------|
| **4A** | **7.1** Server-fetch admin initial data (blogs, access, info, graphic, scheduling) | One pattern across `(admin)` pages: server page → `initialData` props → thin client for mutations |
| **4B** | **1.3** Profile API duplicate `UserData` read | Profile page is already server-rendered; extend `getAuthSession` / `getUserProfile` so `POST /api/user` doesn't re-query on every profile update |

---

### Phase 5 — Query efficiency on curriculum & submissions (1–2 PRs)

| Batch | Issues | Why together |
|-------|--------|--------------|
| **5A** | **2.4** Level page subject filter · **3.3** Parallel topic page queries | Curriculum navigation under `[board]/[level]/…`; both are read-path waterfalls |
| **5B** | **3.2** Resource submit double-save / orphan records · **2.7** Contributor search aggregation | Both in resource-submission flow; fix write ordering and search in the same area |

---

### Phase 6 — Minor parallelization & connection hygiene (1 PR)

| Batch | Issues | Why together |
|-------|--------|--------------|
| **6A** | **3.4** Apply page `Promise.all` · **3.5** Form create `Promise.all` | Small independent-query fixes; same `Promise.all` pattern, low risk |
| **6B** | **6.4** Replace inline `connectDB()` · **8.6** Delete `lib/mongoClient.ts` · **7.5** Unify QOTD Mongo client | Connection-pool hygiene; verify curriculum pages already on `lib/data/*` before editing |

---

### Phase 7 — Frontend bundle & static delivery (1–2 PRs)

| Batch | Issues | Why together |
|-------|--------|--------------|
| **7A** | **5.4** Scope KaTeX CSS · **5.5** Trim Poppins weights · **5.6** Named lucide imports | All layout/page import changes; measure `(others)` route bundle after |
| **7B** | **5.3** Split Navigation mobile overlay · **4.7** `/_next/static` cache headers | Shell + `next.config.mjs` headers; improves repeat-visit load, not first paint |

---

### Phase 8 — Caching layer (1 PR, after database indexes and lean read paths are in place)

| Batch | Issues | Why together |
|-------|--------|--------------|
| **8A** | **4.6** Redis query/auth caching | Redis infra already exists for rate limiting; lean read paths and slug/roles indexes are in place so cached payloads are correct and cheap to serialize |

---

### Suggested PR sequence (summary)

```
3B  →  4A  →  4B  →  5A  →  5B  →  6A + 6B  →  7A  →  7B  →  8A
```

**Highest impact next:** **3B** (auth-before-DB + admin rate limiting) then **4A** (admin server-fetch) — removes the empty-shell → spinner → client fetch pattern across the admin surface.

**Defer until data layer is stable:** **4.6** Redis caching — indexes and lean read paths are now in place; remaining 7.3 clone cleanup can land independently.

---

*Generated: June 2025. Re-run this audit after major auth, caching, or schema changes.*
