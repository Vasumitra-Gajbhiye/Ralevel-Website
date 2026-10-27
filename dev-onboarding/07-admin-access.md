# 07 · Admin access

Time: about 10 minutes.

Most of the interesting pages (`/admin`, `/tasks`) need roles. Locally you give yourself roles with a script. It only works on your local database and your own Clerk app, and it refuses to run against anything else.

## Give yourself admin

1. Sign up on http://localhost:3000 first ([06](06-run-the-website.md)).
2. From the repo root, using the email you signed up with:

   ```bash
   pnpm dev:grant-role yourname+clerk_test@example.com admin
   ```

3. Reload the page. `/admin` now opens.

More things you can do:

```bash
# Several roles at once (they're added to what you already have)
pnpm dev:grant-role yourname+clerk_test@example.com writer resource_staff

# Remove all roles
pnpm dev:grant-role yourname+clerk_test@example.com --clear
```

**Tip:** when you build a feature for a specific role, test it as that role, not just as admin. Run `--clear`, then grant only that role.

## How admin access works

Two things decide what someone can do in `/admin`:

1. **Roles** say who someone is, for example `writer_dep_head`. They're given out on the Access, Writers, Resource Dept. and Scholarship team pages (or with `pnpm dev:grant-role` locally).
2. **Page access** says which roles can open which admin page. Owners and admins change it at **Admin → Page access** (`/admin/permissions`), without a deploy. Anyone who can open at least one page gets into `/admin`, and the sidebar only lists their pages.

A few rules stay in the code, whatever page access says:

- Owner always has every page, and only owners and admins can open Page access.
- Blogs follows writer-team membership (writing a post needs an author), so it's managed on the Writers page.
- Inside pages: department heads only manage their own department's forms, only owners and admins can make someone a department head, and nobody can give a role at or above their own rank.

The editor shows these rules next to each page (the ⓘ icon).

### Default page access

Your local database starts with no saved page access, so every page uses these defaults.

| Role | Pages it can open by default |
| --- | --- |
| `owner`, `admin` | Every page, including Page access |
| `writer_dep_head` | Blogs, All Blogs, Writers, Form submission |
| `senior_writer`, `writer` | Blogs |
| `resource_dep_head` | Resource Dept., Form submission, Resource CMS |
| `resource_staff` | Resource CMS |
| `scholarship_dep_head` | Scholarships, Scholarship team |
| `scholarship_staff` | Scholarships |
| `mod_dep_head` | Form submission, Discord QOTD |
| `info_dep_head` | Form submission, Scheduling |
| `helper_dep_head`, `graphic_dep_head`, `reddit_dep_head` | Form submission |
| `informative_team` | Scheduling |
| `senior_mod`, `junior_mod`, `trial_mod`, `helper`, `graphic_designer`, `bot_dev` | None (they use `/tasks`) |
| `former_staff` | None, and it can't be given pages |

**Every staff role can use `/tasks`.** Department heads manage their department's lists there.

### Try the editor locally

1. As admin, open http://localhost:3000/admin/permissions.
2. Pick a role (or switch to **By page**), change something, then **Review & save**.
3. To see the result, give your test account only that role (`--clear`, then grant it) and reload `/admin`.

To go back to the defaults, use **Reset to default** on the role or page. Saved changes apply right away. On production servers they can take up to 10 seconds to reach every instance.

## Adding a new admin page

Page access is driven by one list, so a new page needs three things:

1. **Register it** in `ADMIN_SECTIONS` in `apps/website/src/lib/admin-access/sections.ts`: a key, label, one-line description, area, path prefix, sidebar link and default roles. The sidebar and the Page access editor pick it up automatically.
2. **Guard the page.** Start every `page.tsx` with:

   ```ts
   const denied = await guardSection("your-key");
   if (denied) return denied;
   ```

   A page that is a client component gets the guard in a `layout.tsx` next to it instead.
3. **Guard its server code** with the same key:
   - API routes: `authorizeAdminApi(req, { section: "your-key" })`
   - server actions: `await requireSectionAction("your-key")`
   - older routes that use `requireRoles`: `await requireSection(session, "your-key")`

Don't use role lists for page access. The tests in `apps/website/src/lib/admin-access/__tests__/` fail if a page has no guard, a page or API checks the wrong section, or an API checks a role list. Role lists are still right for rules that aren't about opening a page (for example "only writers can write blogs"). Add those routes to the allowlist in `apiGuards.test.ts`, with a comment saying why.

Run the tests with `pnpm --filter @ralevel/website test`. The Page access API also has a database test. It's skipped by default; to run it, start the databases (`pnpm db:up`), then:

```bash
RUN_DB_TESTS=1 pnpm --filter @ralevel/website exec vitest run src/lib/admin-access
```

## Where the rules live

- `apps/website/src/lib/roles.ts`: roles and role groups
- `apps/website/src/lib/admin-access/sections.ts`: admin pages and their default access
- `apps/website/src/lib/admin-access/server.ts`: reads saved page access (cached for up to 10 seconds)
- `apps/website/src/lib/tasks/departments.ts`: which roles belong to which `/tasks` department

## `/tasks` "view as" (optional)

To see `/tasks` as someone else (for example a junior mod), set this in `.env.local` and restart `pnpm dev`:

```bash
TASKS_DEV_IMPERSONATION=true
```

As an admin, you'll get a **Dev · view as** switcher in the `/tasks` sidebar. It only works locally. To get demo tasks assigned to you, run `pnpm db:seed-tasks --me yourname+clerk_test@example.com`.

✅ **You should now see** `/admin` open for your test account, **Page access** in its sidebar, and `/tasks` show the department lists.
