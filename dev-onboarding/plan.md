# Junior dev onboarding plan

> ⚠️ **Don't commit this file until Phase 0.2 is done.** The repo is public, and this file describes security gaps (repo secrets readable from any branch, a ruleset that allows self-merge) that are still open.

Goal: move from solo dev pushing to `main` to a team of the owner plus 2 juniors.

- Juniors work only through PRs reviewed by the owner.
- The owner can still push directly to `main`.
- Every developer, the owner included, runs **two local databases**: one for development and one for integration tests. **Production is only ever touched by the deployed app.**
- Every developer creates **their own dev/test accounts** for third-party services. Juniors never receive production keys.
- Juniors onboard themselves with the md files in `dev-onboarding/`. The GitHub how-to guide will be written separately.

Work through the tasks in order. Each one is written so it can be handed to a fresh chat on its own: "do task 0.2 from dev-onboarding/plan.md".

---

## Decisions (answered 2026-10-05)

| #   | Decision                                                                                                                                                                                                                                                              |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | `apps/website/.env.local` `MONGODB_URI` **is production**. Move to **local Docker Mongo**: OrbStack on the owner's Mac, Docker Desktop for the juniors.                                                                                                               |
| D2  | **2 juniors**, one on **Windows** and one on **macOS**. GitHub usernames not known yet, so invites wait until onboarding day. Docs must cover both OSes.                                                                                                              |
| D3  | Juniors may work on **everything**, so the docs must explain how to set up a dev version of every service.                                                                                                                                                            |
| D4  | `Relabical` has been removed. Checked: they never triggered a workflow run or pushed a commit, so no secret rotation is needed on their account.                                                                                                                      |
| D5  | Junior PRs **require review**. No extra deploy gate: the owner's approval is the gate.                                                                                                                                                                                |
| D6  | The owner keeps **direct push to** `main` (ruleset bypass stays `always`). Use PRs when practical.                                                                                                                                                                    |
| D7  | Seed data is a **private archive** of content collections only, shared by the owner. It's never committed, because team collections may contain emails or Discord IDs.                                                                                                |
| D8  | Three separate databases: `ralevel_dev` (local, development), `ralevel_test` (local, integration tests, wiped freely), **production** (deployed app only, nobody's laptop).                                                                                           |
| D9  | **Only the owner** can approve PRs (CODEOWNERS `*`).                                                                                                                                                                                                                  |
| D10 | **Each dev creates their own dev/test accounts** for every third-party service where that's possible. Something is shared only if it's safe: dev-only, scoped and capped, and owned by the owner. **Juniors never get production keys.** There's no shared `dev.env`. |

---

## Current state (as of 2026-10-05)

### GitHub

- Repo `Vasumitra-Gajbhiye/Ralevel-Website` is **public**. The only branch is `main`. The only collaborator is the owner.
- Ruleset **"Protect main branch"** (id `14766432`, default branch) already has: block deletion, block force push, require PR. But:
  - `required_approving_review_count: 0`
  - all merge methods allowed
  - stale reviews not dismissed
  - conversation resolution not required
  - no required status checks
  - Admin bypass (`RepositoryRole` 5) is `always`. **Keep it** (D6).
- Repo settings: merge, squash and rebase all allowed. `delete_branch_on_merge: false`.
- Actions secrets are all **repo-level**: `COOLIFY_API_TOKEN`, `COOLIFY_BOT_WEBHOOK_URL`, `COOLIFY_WEBSITE_WEBHOOK_URL`, `MONGODB_URI` (prod), `RESEND_API_KEY` and the `NEXT_PUBLIC_`\* values. Once juniors have Write, they could push a branch whose workflow prints them.
- Environments **Preview** and **Production** exist but aren't used by the workflows.
- `docker-build-push-website.yml` / `docker-build-push-bot.yml` run on push to `main` (paths `apps/**`, `packages/**`). They build images, push to GHCR and trigger a Coolify deploy. **Every merge or direct push to main that touches** `apps/`\*\* **or** `packages/`\*\* **deploys to production.**
- There's no CI on pull requests.

### Code / tooling

- pnpm monorepo: `apps/website` (Next 16, Clerk, Mongoose, Tailwind), `apps/bot` (Discord bot), `packages/*`. Node `22.23.1` (`.nvmrc`), pnpm `9.15.0`.
- `tsc --noEmit -p apps/website` passes with 0 errors, so it can be a required check right away.
- `pnpm lint` is broken: `next lint` was removed in Next 16, and the repo still has `eslint@8` with `eslint-config-next@14.2.3`.
- **There's no test runner and there are no tests.**
- There's no local dev infrastructure: no compose file with Mongo or Redis, and no seed or restore script. `docker-compose.website.yml` / `docker-compose.bot.yml` are for production.
- `apps/website/.env.example` only covers about half the vars the code reads. Missing: Clerk (`NEXT_PUBLIC_CLERK_*`, `CLERK_SECRET_KEY`), Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`), R2 (`R2_*`), `NEXT_PUBLIC_POSTHOG_*`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `DRIVE_ROOT_FOLDER_ID`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `QOTD_*`.
- Admin access:
  - The super admin is hardcoded to the owner's email in `apps/website/src/lib/superAdmin.ts`.
  - Roles come from Clerk session claims/metadata (`src/lib/getAuthSession.ts`, `src/lib/syncClerkUserMetadata.ts`).
  - `UserData` is created or looked up by email in `src/lib/ensureUserData.ts`.
  - Juniors have no way to get admin locally.
- Clerk needs a custom session token: `email, name, image_url, roles, userDataId` (see the comment at the top of `src/lib/getAuthSession.ts`). Each dev's own Clerk app needs this set up.
- There's a Clerk webhook route at `src/app/api/webhooks/clerk/route.ts`. The owner's current Clerk dev instance must not have a webhook pointing at production.
- Hardcoded values that block per-dev accounts:
  - The Resend sender `r/alevel <application@ralevel.com>` is hardcoded in `api/ban-appeal/submit/route.ts`, `api/forms/[slug]/submit/route.ts` and `api/forms/submissions/decision/route.ts`. A dev's own Resend account can't send from `ralevel.com`. (The bot already supports `RESEND_FROM_EMAIL`.)
  - `apps/bot/src/config.ts` hardcodes two prod Discord reviewer role IDs (`ADDITIONAL_APPEAL_REVIEWER_ROLE_IDS`).
- Fine for per-dev accounts: Stripe checkout uses inline `price_data` (no price IDs), Cloudinary and R2 are configured fully by env, and Discord channel/role IDs come from env (apart from the above).
- Code that crashes when an optional key is missing:
  - `src/app/api/forms/submissions/decision/route.ts` calls `new Resend(process.env.RESEND_API_KEY)` at module top level.
  - `src/app/api/forms/[slug]/submit/route.ts` calls `new Resend(...)` without a guard.
  - `instrumentation-client.ts` calls `posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!)` with no guard.
  - `src/app/api/checkout/route.ts` uses the leftover `NEXTAUTH_URL` for success/cancel URLs (should be `NEXT_PUBLIC_URL`).
- Already handled gracefully: the bot client (`BOT_INTERNAL_URL` missing means it's skipped), ban-appeal Resend, and Redis (`REDIS_ENABLED=false`).
- Windows hazards:
  - There's no `.gitattributes`, so CRLF line endings will show up in diffs.
  - The deep `learn/[board]/[level]/…` routes plus pnpm's `node_modules` can hit Windows path-length limits.
  - The `register-discord-appeal-commands` script uses single-quoted JSON, which fails in PowerShell/cmd.
- `.gitignore` has `scripts/` while 15 files in `apps/website/scripts/` are force-tracked. New scripts get silently ignored.
- `apps/website/src/docs/REDIS.md` is out of date: it says `npm run dev` and `docker compose up -d redis`, but no such service exists.

### Mongo collections (from `apps/website/src/models/`)

- **Content (safe to seed):** `Topic`, `MCQ`, `Glossary`, `subjectGuide`, `resourcesData`, `resources2Data`, `resourcesHomepage`, `blogsData`, `blogV2`, `blogV2Version`, `editorBlogs`, `legalPage`, `scholarship`, `university`, `Form`, `FormIndex`, `Campaign`, `scheduleItem`
- **Check before seeding (team data may hold emails or Discord IDs):** `teamData`, `staffMember`, `graphicMember`, `helperMember`, `informativeMember`, `certsData`, `Contributor`
- **Personal data (never seed, generate fake data instead):** `userData`, `FormSubmission`, `DiscordAppealSubmission`, `DiscordAppealBan`, `Donor`, `ResourceSubmission`, `scholarshipSave`, `scholarshipSubmission`, `blogV2Comment`, `blogV2CommentLike`, `blogV2Like`, `blogV2ReviewEvent`, `resourceCmsRevision`
- Seeded content holds image URLs on the **prod** Cloudinary/R2. That's fine: the images are public and only read. New uploads go to each dev's own accounts.

### Owner's local env

- `apps/website/.env.local` has the **prod** `MONGODB_URI`, the Google service-account private key, Google OAuth leftovers, and Clerk **test** keys.
- `apps/website/.env.production` has **live** Clerk keys. A local `next build` picks them up silently.
- `apps/website/.env.development` and `.env.production` contain dead `NEXT_PUBLIC_GET*` URLs. Only one is referenced, and only in commented-out code.
- The Google service-account key (project `auth-trial-476713`) was exposed in an AI chat session. **Rotate it.**

---

## Phase 0: before anyone gets access

If time is short, do at minimum **0.1**, **0.2**, **0.3 Tier 1**, **0.4 items 1–4**, and docs **01–06 + 10**.

### 0.1 Local databases: dev + test (D8)

Done 2026-10-05 except the owner-only steps at the end. Ports are **27027 / 27028 / 6389**, not the defaults, so they don't clash with other projects (the owner's Mac already has other Mongo/Redis containers on 27017/6379). Env files use `127.0.0.1`, not `localhost`, because on Windows `localhost` can resolve to `::1` and miss a port that's bound to 127.0.0.1 only.

- [x] Root `docker-compose.dev.yml` (project `ralevel-dev`, all ports bound to `127.0.0.1` only, healthchecks so `up --wait` blocks until ready):
  - `mongo-dev`: `mongo:7` on **27027**, named volume `mongo-dev-data` (persists), database `ralevel_dev`
  - `mongo-test`: `mongo:7` on **27028**, **tmpfs** (wiped on restart), database `ralevel_test`
  - `redis`: `redis:7-alpine` on **6389**, optional (`REDIS_ENABLED=false` by default)
- [x] Root scripts (`scripts/db/*.ts` via `tsx`, `spawn` without a shell, so they work in PowerShell, cmd, bash and zsh):
  - `pnpm db:up` / `pnpm db:down` (keeps the dev volume)
  - `pnpm db:restore [archive] [--test]` pipes the archive into `mongorestore` via `docker compose exec -T`. It defaults to the newest file in `seed/`.
  - `pnpm db:reset [archive] [--test]` drops the database, then restores.
- [x] **Safety guard** `scripts/db/guard.ts`:
  - `assertLocalMongoUri(uri, "dev" | "test")` only allows `mongodb://` on localhost / 127.0.0.1 / ::1 with the exact port and database (dev = 27027/`ralevel_dev`, test = 27028/`ralevel_test`). It rejects `mongodb+srv`, remote hosts and multi-host URIs.
  - Every DB script calls it before connecting.
- [x] Owner-only `pnpm db:export-seed`:
  - reads `PROD_MONGODB_URI` from `apps/website/.env.prod-access.local`, asks you to type `r_alevel`, and passes the URI to the container as an env var, never as an argument
  - copies **only** the allowlist in `scripts/db/seed-collections.ts` (actual collection names) from prod into a staging DB `ralevel_seed` inside `mongo-dev`. Prod is only read.
  - redacts every `email` field at any depth (`scripts/db/scrub.mongosh.js`). Staff emails sit in `createdBy` / `updatedBy` on scholarships, universities, resources2datas and resourceshomepages.
  - reports any other email-like strings for review
  - writes `seed/ralevel-seed-YYYY-MM-DD.archive.gz` (gitignored: `seed/`, `*.archive.gz`)
- [x] "Check before seeding" decision: `teamdatas` is on the allowlist (it's already public on the site). `staffmembers`, `helpermembers`, `graphicmembers`, `informativemembers`, `certdatas` and `contributors` are **not** seeded; `db:seed-fake` generates them.
- [x] `pnpm db:seed-fake` (`apps/website/scripts/seedFake.ts`):
  - replaces all 17 personal-data collections in `ralevel_dev` with fake people (`@example.com`)
  - links the fake rows to the seeded forms, scholarships and blogs
  - local dev DB only
- [x] Env files (gitignored):
  - `apps/website/.env.local`: `MONGODB_URI=mongodb://127.0.0.1:27027/ralevel_dev`, `REDIS_URL=redis://127.0.0.1:6389`
  - `apps/website/.env.test.local`: `MONGODB_URI=mongodb://127.0.0.1:27028/ralevel_test`
  - `apps/bot/.env`: `MONGODB_URI` now points at local `ralevel_dev` too
- [x] **Owner's** `.env.local` **switched to the local dev DB.** The prod URI (and two old commented-out ones) now lives only in `apps/website/.env.prod-access.local` (mode 600, not loaded by Next.js).
- [x] Existing scripts that write to Mongo are guarded:
  - `generate*`, `migrate-cert-dates`, `addSlugToStudyGuide`, `addTopicSlugs`, `seedScholarships`
  - by default they only run against local dev
  - with `--prod` they load `PROD_MONGODB_URI` and ask you to type `r_alevel`
- [ ] **Owner:** `pnpm db:up`, then `pnpm db:export-seed`. Review any ⚠️ lines, then run `pnpm db:reset`, `pnpm db:seed-fake` and `pnpm dev`, and click through.
- [ ] **Owner:** share the seed archive privately (D7), e.g. a Google Drive link visible only to the juniors.
- [ ] `apps/website/scripts/seedFake.ts` (and the untracked `seedScholarships.ts` + `scripts/data/`) need `git add -f` until 0.4.8 fixes `.gitignore`.

### 0.2 Lock down GitHub

Can be done with `gh api`.

- [ ] **Edit the ruleset** `14766432`**:**
  - `required_approving_review_count: 1`
  - `dismiss_stale_reviews_on_push: true`
  - `require_code_owner_review: true`
  - `required_review_thread_resolution: true`
  - `allowed_merge_methods: ["squash"]`
  - **leave the admin bypass as** `always` (D6), so the owner can push directly and merge without review
  - do **not** add `required_linear_history` (it would complicate owner direct pushes)
- [ ] **Repo settings:**
  - disable merge commits and rebase merge (squash only)
  - squash commit title = PR title
  - `delete_branch_on_merge: true`
  - "Always suggest updating PR branches"
- [ ] **Code security:** enable secret scanning and **push protection** (free for public repos).
- [ ] **Move all Actions secrets into the** `Production` **environment:**
  - set deployment branches to `main` only
  - add `environment: production` to the jobs in both `docker-build-push-*.yml` workflows
  - delete the repo-level copies
  - no required reviewers on the environment (D5)
  - result: a junior's branch or PR workflow can't read prod secrets
- [ ] Delete the unused `Preview` environment if it's a Vercel leftover.
- [ ] Add `.github/CODEOWNERS` with `* @Vasumitra-Gajbhiye` (D9).
- [ ] Add `.github/workflows/ci.yml`:
  - triggers on `pull_request` to `main`
  - matrix: `ubuntu-latest` (+ optionally `windows-latest` to catch Windows-only breakage)
  - pnpm setup, `pnpm install --frozen-lockfile`, `pnpm typecheck`
  - **no secrets**
  - give the job the name `typecheck`
- [ ] After CI has run once on a PR, add `typecheck` as a **required status check** in the ruleset. The owner bypasses it when pushing directly.
- [ ] Check whether the GHCR packages `ralevel-website/website` and `ralevel-website/bot` are public. This needs a token with `read:packages`, or check the GitHub UI. Prefer private.

### 0.3 Third-party services: each dev creates their own (D10)

There's no shared `dev.env`. Each dev builds their own `apps/website/.env.local` from `.env.example` by following the per-service docs. Tiers decide what's needed on day one.

| Tier                     | Service                                                                                             | Who owns it                                                                                                 | Notes                                                                                                                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1: day one**           | MongoDB (dev + test)                                                                                | Local Docker                                                                                                | 0.1                                                                                                                                                                                  |
| **1: day one**           | Clerk                                                                                               | **Own** free Clerk app (dev instance)                                                                       | Must set up: sign-in methods to match prod, the custom session token (`email, name, image_url, roles, userDataId`), and the sign-in/up URLs from `.env.example`. No webhook to prod. |
| 2: as needed             | Redis                                                                                               | Local Docker                                                                                                | Only to test caching or rate limits                                                                                                                                                  |
| 2: as needed             | Cloudinary                                                                                          | **Own** free account                                                                                        | Cloud name + API key/secret                                                                                                                                                          |
| 2: as needed             | Stripe                                                                                              | **Own** account, **test mode only**                                                                         | No business verification needed for test mode. Webhooks via `stripe listen`.                                                                                                         |
| 2: as needed             | Resend                                                                                              | **Own** free account                                                                                        | Send from `onboarding@resend.dev` (needs the `RESEND_FROM_EMAIL` code fix) to your own email or `delivered@resend.dev`                                                               |
| 2: as needed             | PostHog                                                                                             | **Own** free project, or leave blank                                                                        | Blank is fine once the guard fix is in                                                                                                                                               |
| 2: as needed             | Discord bot                                                                                         | **Own** test server + **own** bot application                                                               | Runs `apps/bot` locally with `BOT_INTERNAL_URL=http://localhost:8787`                                                                                                                |
| 2: as needed             | Gemini                                                                                              | **Own** free AI Studio key                                                                                  | Free tier                                                                                                                                                                            |
| 3: shared only if needed | Cloudflare R2                                                                                       | **Own** account if they can; otherwise an owner-owned `*-dev` bucket + token **scoped to that bucket only** | Cloudflare may require a payment method for R2                                                                                                                                       |
| 3: shared only if needed | OpenAI                                                                                              | Owner-owned **dev project key with a hard monthly cap**, or skip                                            | OpenAI needs prepaid credit                                                                                                                                                          |
| 3: shared only if needed | Google Drive                                                                                        | **Own** Google Cloud project + service account + folder, or skip                                            | Optional feature                                                                                                                                                                     |
| **Never**                | Prod Mongo, live Clerk, Coolify, prod Resend/Cloudinary/R2/Stripe/OpenAI, GitHub Production secrets | —                                                                                                           | —                                                                                                                                                                                    |

- [ ] Owner: in the **current** Clerk dev instance, make sure no webhook endpoint points at `ralevel.com`. The owner keeps using it personally.
- [ ] Owner: write down the exact Clerk settings a dev must copy (sign-in methods, session token JSON, redirect URLs, any appearance or settings the custom sign-in UI depends on). Use them in the Clerk doc and test them by creating a fresh Clerk app.
- [ ] Owner: set up the Tier 3 shared resources only when a junior actually needs them. Share keys via a Bitwarden Send or 1Password share link only, never Discord/WhatsApp, never the repo. Keep a list of what was shared with whom so it can be revoked.

### 0.4 Code fixes

One PR, opened by the owner.

1. [ ] Rewrite `apps/website/.env.example` and `.env.bot.example`:

- list every var the code reads, grouped by **tier** (above)
- add a one-line comment on each saying what it's for, what breaks without it, and which doc explains how to get it
- use local defaults (`mongodb://127.0.0.1:27027/ralevel_dev`, `http://localhost:3000`, `REDIS_ENABLED=false`, `REDIS_URL=redis://127.0.0.1:6389`, `BOT_INTERNAL_URL=http://localhost:8787`)
- add `apps/website/.env.test.example` for the test DB

2. [ ] Make optional services degrade instead of crash:

- Resend is created lazily and guarded in `decision/route.ts` and `[slug]/submit/route.ts`; skip the email with a `console.warn` when the key is missing
- `posthog.init` only runs when the token is set
- checkout uses `NEXT_PUBLIC_URL` instead of `NEXTAUTH_URL`
- quick scan of Cloudinary, R2, Stripe, Drive and AI routes so a missing key returns a clear error instead of crashing the page

3. [ ] **Remove hardcoded per-account values:**

- website emails use `RESEND_FROM_EMAIL` (default `r/alevel <application@ralevel.com>`, same as the bot); put it in one shared helper used by all 3 routes
- move the bot's `ADDITIONAL_APPEAL_REVIEWER_ROLE_IDS` into `DISCORD_APPEAL_REVIEWER_ROLE_IDS` and set it in prod Coolify **before** deploying

4. [ ] Add the `dev-grant-role` script: `pnpm dev:grant-role <email> <role…>`.

- Upserts the user's `UserData` roles in the local DB and syncs them to Clerk metadata, reusing `syncClerkUserMetadata`.
- **Refuses to run** unless `CLERK_SECRET_KEY` starts with `sk_test_` **and** the `MONGODB_URI` host is `localhost` / `127.0.0.1`.

5. [ ] Add `.gitattributes` with `* text=auto eol=lf`, plus binary rules for images, PDFs and fonts. Renormalize once (`git add --renormalize .`) in a single commit.
6. [ ] Add root scripts `typecheck` (website + bot `tsc --noEmit`). Either fix `lint` (ESLint 9 flat config + `eslint-config-next@16`, `"lint": "eslint ."`) or remove it for now so it doesn't confuse anyone.
7. [ ] Make the `register-discord-appeal-commands` script cross-platform (switch to `tsx`, drop the inline JSON).
8. [ ] In `.gitignore`, replace the blanket `scripts/` with specific ignores. Clean up `/Json files` and the `auth-trial-…json` entry if they're no longer needed. Seed archives are already ignored (`seed/`, `*.archive.gz`), and root `scripts/` is re-included with `!/scripts/`.
9. [ ] Fix `apps/website/src/docs/REDIS.md` (pnpm, `pnpm db:up`).
10. [ ] Add a "Getting started" section to the README that points to `dev-onboarding/README.md`.
11. [ ] _(Optional, before juniors branch or never)_ Run a one-time `prettier --write` over the repo as a single commit and add it to `.git-blame-ignore-revs`.

### 0.5 Write the `dev-onboarding/` docs

Every page ends with "✅ You should now see …". Steps that differ between Windows and macOS each get a **Windows** / **macOS** sub-section. Use no real secret values anywhere, because the repo is public.

- [ ] `README.md`: who this is for, the order to follow, a time estimate, who to ask. Tier 1 is required on day one; Tier 2 services are set up when a task needs them.
- [ ] `01-prerequisites.md`:
  - GitHub account + 2FA, then send your username to the owner
  - Git
    - Windows: Git for Windows, `git config --global core.autocrlf false`, `git config --global core.longpaths true`, enable Windows long paths
  - Node 22.23.1 (macOS: fnm or nvm; Windows: fnm or nvm-windows)
  - `corepack enable` (Windows: in an admin PowerShell), which gives pnpm 9.15.0
  - Docker (macOS: OrbStack or Docker Desktop; Windows: Docker Desktop + WSL2)
  - VS Code + extensions: ESLint, Prettier, Tailwind CSS IntelliSense, MDX
- [ ] `02-clone-and-install.md`: clone (Windows: near the drive root, e.g. `C:\code\`), `pnpm install`, common errors (wrong Node version, `sharp`, long paths)
- [ ] `03-local-databases.md`:
  - the three databases (dev / test / prod) and why you never touch prod
  - `pnpm db:up`, getting the seed archive, `pnpm db:restore`, `pnpm db:reset`, `pnpm db:seed-fake`
  - optionally connect MongoDB Compass to `mongodb://127.0.0.1:27027` (dev) and `:27028` (test)
- [ ] `04-environment-variables.md`:
  - copy `.env.example` → `apps/website/.env.local`
  - a table of every var: tier, what it does, what breaks without it, link to its service doc
  - the secret rules (never commit, never paste in chats/issues/screenshots, report leaks immediately; you'll never be given prod keys, so don't ask)
- [ ] `05-clerk-setup.md` (Tier 1): create your own Clerk app, sign-in methods, the custom session token JSON, redirect URLs, copying the keys into `.env.local`, with screenshots
- [ ] `06-run-the-website.md`:
  - `pnpm dev`, then open [http://localhost:3000](http://localhost:3000)
  - sign up in your own Clerk app (test emails `yourname+clerk_test@example.com` with code `424242` skip real email)
  - a list of pages to click through to confirm everything works
- [ ] `07-admin-access.md`: `pnpm dev:grant-role`, the roles from `src/lib/roles.ts` and what each unlocks
- [ ] `08-optional-services/` (Tier 2/3, one short file each): `cloudinary.md`, `stripe.md` (+ `stripe listen`), `resend.md`, `posthog.md`, `discord-bot.md` (own test server, bot app, channel/role IDs, running `apps/bot`), `gemini.md`, `r2.md`, `openai.md`, `google-drive.md`
- [ ] `09-project-tour.md`:
  - monorepo layout
  - route groups `(home)`, `(others)`, `(admin)`
  - `src/lib`, `src/models`, `src/app/api`
  - `proxy.ts` (Next 16's replacement for middleware)
  - Clerk auth + roles, Mongo/Mongoose, Redis cache, Cloudinary/R2
  - the bot
  - the UI convention: minimal UI, reuse `components/ui/*`
- [ ] `10-team-rules.md`: the rules below
- [ ] `11-troubleshooting.md`: fill it from whatever breaks in the 0.6 dry run (Windows and macOS)

### 0.6 Dry run

- [ ] **macOS:** fresh clone in a new folder. Create a **brand-new Clerk app**, start the local DBs, restore the seed archive, and follow the docs word for word using only Tier 1.
- [ ] **Windows:** do the same in a Windows VM, or ask the Windows junior to go first on onboarding day while the owner watches. Fix every gap and add it to troubleshooting.

---

## Phase 1: onboarding day

- [ ] Collect both GitHub usernames and send invites (**Write** role) only after Phase 0.2 is done. Then share the seed archive link.
- [ ] 15-minute architecture tour (based on `09-project-tour.md`).
- [ ] Juniors complete Tier 1 on their own (one Windows, one macOS) while the owner watches where they get stuck. Expect the Clerk setup to take the longest.
- [ ] **First PR exercise:** each junior fixes one gap they hit in the docs, opens a PR, gets the owner's review and squash-merges it. Changes under `dev-onboarding/` don't trigger a deploy (the workflows only watch `apps/`** and `packages/**`), so it's a safe first merge.
- [ ] Hand out 3–5 issues labelled `good first issue`. Juniors set up Tier 2 services only when an issue needs them.

---

## Phase 2: first two weeks

- [ ] **Integration testing setup (D8):**
  - add Vitest to `apps/website`, with `pnpm test:integration` running against `mongo-test` (`ralevel_test` on port 27028) using `.env.test.local`
  - global setup drops the test DB before each run, behind the same localhost-only guard
  - write the first tests for critical API routes (form submit, decision, scholarships)
  - in CI, use a Mongo service container and make the tests a required check
- [ ] CI: add a `next build` check with dummy env values (first check whether the build needs the DB; 6 routes use `generateStaticParams`).
- [ ] Fix lint errors and make lint a required check. Add a Prettier format check.
- [ ] Add `.github/pull_request_template.md` (what / why / how tested / screenshots / linked issue) and issue templates (bug, feature).
- [ ] Consider a Coolify staging app that deploys from a `staging` branch, as a place to try changes before prod.
- [ ] Consider moving the repo into a GitHub organization for teams, per-area CODEOWNERS and enforced 2FA.
- [ ] Turn on Dependabot (security updates at minimum).
- [ ] Rotate the Google service-account key. Clean up the owner's local `.env.development` / `.env.production` (dead URLs, live keys).
- [ ] Optional: add `AGENTS.md` / `CLAUDE.md` with rules for AI tools (pnpm only, never prod DB, minimal UI, cross-platform scripts).

---

## Internal team rules (draft for `10-team-rules.md`)

1. **Never push to** `main`**.** GitHub blocks it for you. Every change goes through a branch and a PR. (The owner can push directly; juniors can't.)
2. Branch names are `feat/…`, `fix/…`, `chore/…` or `docs/…` plus a short kebab-case description. One branch = one task.
3. Keep PRs small (roughly under 400 changed lines), with one purpose each.
4. Before opening a PR:

- pull the latest `main`
- run `pnpm typecheck` (and `pnpm test:integration` once it exists)
- click through your change locally
- add desktop and mobile screenshots for UI changes

5. **Never merge your own PR without approval.** You need the owner's approval and all review conversations resolved.
6. Squash merge only. The PR title becomes the commit message, so make it meaningful (`feat: add scholarship filters`).
7. **Merging to** `main` **deploys to production.** Treat every merge as shipping.
8. You use only your **local** databases (`ralevel_dev`, `ralevel_test`) and **your own dev/test accounts**. You'll never be given production keys or the production database, so don't ask, and never run scripts against prod.
9. Never commit `.env` files or paste keys anywhere: code, issues, PRs, chats or screenshots. The repo is public. If you leak something, even your own dev key, rotate it and tell the owner immediately. Nobody gets blamed.
10. Scripts must work on both Windows and macOS: no bash-only syntax in `package.json`; use `tsx` scripts.
11. Ask before touching `.github/`, Dockerfiles, auth/roles (`proxy.ts`, `roles.ts`, `superAdmin.ts`) or payments, and before adding or upgrading a dependency.
12. Work from an assigned issue. Comment on it when you start.
13. If you're stuck for more than 45 minutes, ask. That's expected, not a failure.
