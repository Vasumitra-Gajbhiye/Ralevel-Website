# 07 · Admin access

Time: about 5 minutes.

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

## Roles

| Role | What it unlocks |
| --- | --- |
| `owner` | Everything. In production only the site owner has it. |
| `admin` | The whole `/admin` panel: every editor, forms, access management |
| `writer_dep_head` | Writer editor, reviewing blog posts, managing the writer team, their department's forms |
| `senior_writer`, `writer` | Writing blogs in the writer editor |
| `resource_dep_head` | Resource editor, managing the resource team, their department's forms |
| `resource_staff` | Resource editor |
| `scholarship_dep_head` | Scholarship editor, managing the scholarship team |
| `scholarship_staff` | Scholarship editor |
| `mod_dep_head`, `helper_dep_head`, `graphic_dep_head`, `info_dep_head`, `reddit_dep_head` | The admin panel and their department's application forms |
| `informative_team` | The admin panel |
| `senior_mod`, `junior_mod`, `trial_mod`, `helper`, `graphic_designer`, `bot_dev` | Staff: `/tasks` for their department |
| `former_staff` | No staff access |

**Every staff role can use `/tasks`.** Department heads manage their department's lists there.

The exact rules live in the code:

- `apps/website/src/lib/roles.ts`: roles and role groups
- `apps/website/src/lib/tasks/departments.ts`: which roles belong to which `/tasks` department

## `/tasks` "view as" (optional)

To see `/tasks` as someone else (for example a junior mod), set this in `.env.local` and restart `pnpm dev`:

```bash
TASKS_DEV_IMPERSONATION=true
```

As an admin, you'll get a **Dev · view as** switcher in the `/tasks` sidebar. It only works locally. To get demo tasks assigned to you, run `pnpm db:seed-tasks --me yourname+clerk_test@example.com`.

✅ **You should now see** `/admin` open for your test account, and `/tasks` show the department lists.
