# Performance Review

Senior-engineer audit of the r/alevel Next.js codebase (App Router, Mongoose/MongoDB, Clerk auth). Findings are ordered by severity within each category.

**Stack:** Next.js App Router · MongoDB/Mongoose · Clerk · Upstash Redis (rate limiting only) · Cloudflare R2 · Cloudinary

---

## Summary

| Severity | Count |
|----------|-------|
| High     | 6     |
| Medium   | 15    |
| Low      | 8     |

**Top priorities:** split oversized client bundles and introduce a data caching layer (`unstable_cache` / ISR).

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

### Issue 1.5 — Middleware does not gate admin routes

**Description:** `proxy.ts` runs `clerkMiddleware()` with no route protection or role injection. All authorization is deferred to layouts and API handlers.

**Severity:** Medium

**Why it matters:** Unauthenticated requests still reach server components and may trigger partial DB work before failing. Role checks cannot be centralized at the edge.

**Files involved:**
- `proxy.ts`

**Suggested fix:** Use `clerkMiddleware` with `auth.protect()` for `/admin(.*)`. Inject roles from JWT claims to skip layout-level DB reads.

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

### Issue 2.5 — Missing `.lean()` on read-only queries

**Description:** Many read paths return full Mongoose documents instead of plain objects.

**Severity:** Medium

**Why it matters:** Mongoose documents carry change-tracking overhead and slower JSON serialization.

**Files involved:**
- `app/api/certificates/route.tsx` (line 18)
- `app/api/resources/route.tsx` (line 19)
- `app/api/resources/[id]/route.tsx`
- `app/api/blogs/[id]/route.tsx`
- `app/api/admin/blogs/[slug]/route.ts`
- `app/api/resources2/[id]/route.ts`

**Suggested fix:** Append `.lean()` to all read-only queries.

---

### Issue 2.6 — Missing indexes on frequently queried fields

**Description:** Several models lack indexes on fields used in lookups or filters.

**Severity:** Medium

**Why it matters:** Collection scans become expensive as data grows.

**Files involved:**
- `models/blogsData.tsx` — `slug` queried but not indexed (line 32)
- `models/resources2Data.tsx` — `slug` required but no unique index; used heavily in `controller/resourceController.ts`
- `models/userData.tsx` — `roles` used in `admin/access` filter, not indexed

**Suggested fix:** Add `{ slug: 1 }` unique indexes on `BlogsData` and `resources2Data`. Add index on `UserData.roles` or use a dedicated `isAdmin` flag with index.

---

### Issue 2.7 — Two-step contributor search in resource submissions

**Description:** When searching submissions by name, the route first queries `Contributor` with unanchored regex, then queries `ResourceSubmission` with `.populate()`.

**Severity:** Medium

**Why it matters:** Two round-trips per search; unanchored regex can trigger collection scans.

**Files involved:**
- `app/api/admin/resource-submissions/route.ts` (lines 50–72)

**Suggested fix:** Single aggregation with `$lookup` + `$match`. Anchor regex (`^term`) or use Atlas Search / text index on contributor name fields.

---

### Issue 2.8 — `getBlogs` sorts by non-existent `createdAt`

**Description:** `lib/db/getBlogs.ts` and `controller/blogController.ts` sort by `createdAt`, but `models/blogsData.tsx` has no `timestamps: true` and no `createdAt` field in the schema.

**Severity:** Low

**Why it matters:** Sort is ineffective; results may appear in insertion order unpredictably.

**Files involved:**
- `lib/db/getBlogs.ts` (line 7)
- `controller/blogController.ts`
- `models/blogsData.tsx`

**Suggested fix:** Add `timestamps: true` to schema or sort by `_id` / explicit `date` field. Consolidate duplicate helpers into one module.

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

### Issue 4.1 — No Next.js data cache layer

**Description:** Zero usage of `unstable_cache`, React `cache()` (except `getAuthSession`), or `revalidateTag` anywhere in the repo. Only `revalidatePath("/qotd")` in QOTD actions.

**Severity:** High

**Why it matters:** Every server render and API-backed page hits MongoDB fresh. Read-heavy curriculum and content routes cannot benefit from incremental static regeneration.

**Files involved:**
- Codebase-wide (grep confirms no matches)
- `app/(admin)/admin/qotd/actions.ts` — only cache invalidation present

**Suggested fix:** Wrap read-heavy helpers (`getBlogs`, `getResource`, `Topic.find`, team list) in `unstable_cache` with tags. Call `revalidateTag('blogs')` etc. on admin mutations.

---

### Issue 4.2 — Blog slug pages force dynamic rendering

**Description:** Blog posts use `generateStaticParams` for MDX files but also export `dynamic = "force-dynamic"`, negating static generation.

**Severity:** High

**Why it matters:** MDX content is file-based and rarely changes; forcing dynamic SSR on every request wastes compute.

**Files involved:**
- `app/(others)/blogs/[slug]/page.tsx` (lines 8–20, 94)

**Suggested fix:** Remove `export const dynamic = "force-dynamic"`. Add `export const revalidate = 3600` (or longer). Keep `dynamicParams = false`.

---

### Issue 4.3 — Blogs index has revalidate commented out

**Description:** The blogs listing page fetches from MongoDB on every request with no ISR.

**Severity:** Medium

**Why it matters:** Blog list is public and changes infrequently.

**Files involved:**
- `app/(others)/blogs/page.tsx` (lines 15–20)

**Suggested fix:** Uncomment/add `export const revalidate = 300`. Wrap `getBlogs()` in `unstable_cache`.

---

### Issue 4.4 — Curriculum routes lack ISR / static params

**Description:** Subject, chapter, topic, and glossary pages have no `revalidate` or `generateStaticParams`. Only resource slug pages use ISR (`revalidate = 864000`).

**Severity:** Medium

**Why it matters:** Curriculum content is read-heavy and mostly static. Every page view triggers cold SSR + DB.

**Files involved:**
- `app/(others)/[board]/[level]/[subject]/[subjectCode]/page.tsx`
- `app/(others)/[board]/[level]/[subject]/[subjectCode]/[chapter]/[topic]/page.tsx`
- `app/(others)/[board]/[level]/[subject]/[subjectCode]/glossary/page.tsx`
- Reference (good pattern): `app/(others)/resources/[slug]/page.tsx`

**Suggested fix:** Add `generateStaticParams` for known board/subject/chapter paths. Set `revalidate` (e.g. 86400). Tag-based invalidation on content admin changes.

---

### Issue 4.5 — HTTP loopback controllers bypass cache

**Description:** Several controllers fetch data by HTTP to the app's own API instead of querying MongoDB directly, adding an extra network hop with no cache headers.

**Severity:** Medium

**Why it matters:** Server components pay DNS + HTTP latency to hit their own API. No `next: { revalidate }` options are set.

**Files involved:**
- `controller/getAllTeam.tsx` (lines 1–4)
- `controller/getAllBlogs.tsx`
- `controller/getAllSubjects.tsx`
- `controller/getSingleBlog.tsx`
- `app/(others)/certificates/[id]/page.tsx` (lines 110–115) — server component fetches own API
- `app/(others)/team/page.tsx` — client imports `getAllTeam` in `useEffect`

**Suggested fix:** Query MongoDB directly (as `controller/resourceController.ts` and `controller/blogController.ts` do). If HTTP must remain, add `{ next: { revalidate: 60, tags: ['team'] } }`.

---

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

### Issue 5.1 — Profile page is ~5,700 lines of client code

**Description:** `app/(others)/profile/page.tsx` is a `"use client"` page with ~4,600 lines of active code plus extensive commented legacy blocks.

**Severity:** High

**Why it matters:** Massive JS bundle, slow hydration, poor Time-to-Interactive. Most of the file is form UI that could be server-rendered.

**Files involved:**
- `app/(others)/profile/page.tsx` (5,700 lines)

**Suggested fix:** Server-load user via `getAuthSession()` + single DB query. Extract form sections into smaller client components. Delete commented code. Lazy-load infrequent sections.

---

### Issue 5.2 — MCQ quiz page is ~4,278 lines with heavy imports

**Description:** Topic MCQ page imports full `mathjs`, `katex`, and `framer-motion` at the top level in a `"use client"` page.

**Severity:** High

**Why it matters:** `mathjs` alone is hundreds of KB gzipped. The entire bundle ships on every quiz visit.

**Files involved:**
- `app/(others)/[board]/[level]/[subject]/[subjectCode]/[chapter]/practice/topic-mcq-questions/[set]/page.tsx` (lines 3061–3087 active code)
- `app/(others)/[board]/[level]/[subject]/[subjectCode]/[chapter]/practice/theory-topic-questions/[set]/page.tsx` (~1,806 lines, same import pattern)

**Suggested fix:** Server-fetch questions from MongoDB; pass props to a thin client shell. Dynamic-import calculator (`next/dynamic`, `ssr: false`). Render LaTeX server-side where possible. Split quiz UI into `/components/quiz/`.

---

### Issue 5.3 — Navigation component is ~1,584 lines

**Description:** `(others)` layout navigation is a monolithic client component loaded on every route in the group.

**Severity:** Medium

**Why it matters:** Parsed and bundled on certificates, resources, apply, and all other `(others)` routes regardless of need.

**Files involved:**
- `app/(others)/layout ui/navigation.tsx` (1,584 lines)
- Also duplicated: `app/(home)/layout ui/navigation.tsx` (~1,006 lines), `app/layout ui/navigation.tsx` (~1,005 lines)

**Suggested fix:** Extract to shared `@/components/site/Navigation`. Split mobile overlay into dynamically imported sub-component. Target ~200 lines in the always-loaded shell.

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
- `app/(others)/forms/page.tsx` (line 213)

**Suggested fix:** Import only the icons used (`Shield`, `PenLine`, etc.) by name.

---

## 6. Duplicate Code

### Issue 6.1 — Triplicated navigation and contact-us components

**Description:** Three nearly identical copies of navigation (~1,000+ lines each) and contact-us (~630 lines each) exist across route groups.

**Severity:** Medium

**Why it matters:** Bugfixes and features must be applied 3×; drift risk; larger build graph.

**Files involved:**
- `app/(others)/layout ui/navigation.tsx`
- `app/(home)/layout ui/navigation.tsx`
- `app/layout ui/navigation.tsx`
- `app/(others)/layout ui/contact-us.tsx`, `app/(home)/layout ui/contact-us.tsx`, `app/layout ui/contact-us.tsx`

**Suggested fix:** Single `@/components/site/Navigation` and `@/components/site/ContactUs` imported by route-group layouts.

---

### Issue 6.2 — Apply and forms pages are near-identical

**Description:** `apply/page.tsx` and `forms/page.tsx` differ only in link prefix (`/apply/` vs `/forms/`). Redirects in `next.config.mjs` already map `/forms` → `/apply`.

**Severity:** Medium

**Why it matters:** Double maintenance; potential for divergent behavior.

**Files involved:**
- `app/(others)/apply/page.tsx`
- `app/(others)/forms/page.tsx`
- `app/(others)/apply/[slug]/pageClient.tsx` ↔ `app/(others)/forms/[slug]/pageClient.tsx`
- `next.config.mjs` (redirects)

**Suggested fix:** One shared server component; single route tree with redirect from legacy path.

---

### Issue 6.3 — Duplicate blog fetching helpers

**Description:** `lib/db/getBlogs.ts` and `controller/blogController.ts` contain identical `Blog.find({}).sort(...).lean()` logic.

**Severity:** Low

**Why it matters:** Two sources of truth; changes may be applied to one but not the other.

**Files involved:**
- `lib/db/getBlogs.ts`
- `controller/blogController.ts`

**Suggested fix:** Consolidate into one exported helper; delete the duplicate.

---

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

### Issue 6.5 — Duplicate role-check helpers in admin API routes

**Description:** Six admin API routes define their own `requireXxxAccess` functions instead of using `lib/requireRoles.ts`.

**Severity:** Low

**Why it matters:** Inconsistent authorization logic; harder to audit and update role rules.

**Files involved:**
- `app/api/admin/helper/route.ts` — `requireHelperAdmin`
- `app/api/admin/graphic/route.ts` — `requireGraphicAccess`
- `app/api/admin/info/route.ts` — `requireInformativeAccess`
- `app/api/admin/team/route.ts` — `requireTeamAdmin`
- `app/api/admin/resource-submissions/route.ts` — `requireResourceAdminAccess`
- `app/api/admin/resource-submissions/[id]/route.ts` — duplicate of above
- `lib/requireRoles.ts` (central helper, underused)

**Suggested fix:** Extend `requireRoles(session, allowedRoles)` everywhere; delete inline copies.

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
- `controller/resourceController.ts` (line 28)
- `app/(others)/blogs/page.tsx` (line 20)
- `app/(admin)/admin/forms/[formType]/[slug]/page.tsx` (lines 32–34)

**Suggested fix:** Return `.lean()` results directly. Use `structuredClone` only when mutation safety is required.

---

### Issue 7.4 — Ten identical admin section layouts

**Description:** Each admin section layout is a copy-paste wrapper calling `getAuthSession()` + `hasRequiredRole()` with different role arrays.

**Severity:** Medium

**Why it matters:** 10× auth overhead per nested navigation; maintenance burden.

**Files involved:**
- `app/(admin)/admin/{access,blogs,certificates,forms,graphic,helper,info,qotd,scheduling,team}/layout.tsx`

**Suggested fix:** Role gating in parent `admin/layout.tsx` only, or a single configurable layout component.

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

### Issue 8.2 — PostHog configured for immediate flush on every event

**Description:** PostHog client uses `flushAt: 1` and `flushInterval: 0`, flushing synchronously during requests.

**Severity:** Medium

**Why it matters:** Every `capture()` in `ensureUserData`, form submit, resource submit, and Clerk webhook adds network I/O to request latency.

**Files involved:**
- `lib/posthog-server.ts` (lines 7–10)
- Callers: `lib/ensureUserData.ts`, `app/api/forms/[slug]/submit/route.ts`, `app/api/resources/submit/route.ts`, `app/api/webhooks/clerk/route.ts`

**Suggested fix:** Use defaults (`flushAt: 20`, `flushInterval: 10000`) or call `posthog.shutdown()` at end of serverless invocation. Fire-and-forget with `void posthog.capture(...)` where acceptable.

---

### Issue 8.3 — Certificate upload has no file size limit

**Description:** Certificate upload loads the entire file into memory with no max size validation.

**Severity:** Medium

**Why it matters:** Large uploads can exhaust serverless memory and execution time.

**Files involved:**
- `app/api/upload-certificate/route.ts`

**Suggested fix:** Add max size check (consistent with form submit: 10 MB). Consider presigned R2 URLs for direct client upload.

---

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
| Parallel R2 uploads via `Promise.all` | `app/api/forms/[slug]/submit/route.ts`, `app/api/resources/submit/route.ts` |
| Field projection + `.lean()` on blog list | `app/api/blogs/route.tsx` |
| Shared pagination helpers (`page`/`limit`, default 50) | `lib/pagination.ts`, `components/ui/list-pagination.tsx` |
| Paginated list endpoints (public + admin) | `app/api/certificates`, `app/api/blogs`, `app/api/admin/*` |
| Limited search results (limit 5) | `app/api/admin/access/search/route.ts` |
| ISR + `generateStaticParams` for resources | `app/(others)/resources/[slug]/page.tsx` |
| Server-fetch + client props (QOTD) | `app/(admin)/admin/qotd/page.tsx` |
| Redis rate limiting on public APIs | `lib/rateLimit.ts` |
| Form submit validation (file size, honeypot, rate limit) | `app/api/forms/[slug]/submit/route.ts` |
| Compound indexes on content models | `models/Topic.ts`, `models/MCQ.ts`, `models/Glossary.ts` |

---

## Recommended Fix Order

| Priority | Issue | Expected impact |
|----------|-------|-----------------|
| P1 | 4.1–4.4 Data caching / ISR | Major reduction in DB load for content |
| P1 | 5.1–5.2 Split large client pages | Faster TTI on high-traffic routes |
| P2 | 4.5 Remove HTTP loopback | Eliminates self-fetch overhead |
| P2 | 6.1–6.2 Dedupe navigation/forms | Lower maintenance, smaller bundles |
| P2 | 7.1 Server-fetch admin data | Better admin UX, fewer round trips |
| P3 | 2.5 `.lean()` everywhere | Incremental query speedup |
| P3 | 8.2 PostHog flush tuning | Lower request tail latency |

---

*Generated: June 2025. Re-run this audit after major auth, caching, or schema changes.*
