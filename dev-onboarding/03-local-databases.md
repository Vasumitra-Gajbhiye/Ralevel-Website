# 03 · Local databases

Time: about 15 minutes. Docker must be running (page 01).

## The three databases

| Database | Where it runs | What it's for |
| --- | --- | --- |
| `ralevel_dev` | Docker on your machine, port **27027** | Everything you do with `pnpm dev`. Your data stays when you stop Docker. |
| `ralevel_test` | Docker on your machine, port **27028** | Tests. It's **wiped** every time its container restarts. |
| production | the live server | Only the live site uses it. You never connect to it, and nobody will give you access. |

Every database script checks the connection string first and **refuses to run** against anything except these two local databases. `pnpm db:up` also starts Redis on port **6389**, but it's off by default (`REDIS_ENABLED=false`).

The ports aren't the usual 27017 / 6379 on purpose, so they don't clash with other projects on your machine.

## 1. Start the databases

From the repo root:

```bash
pnpm db:up
```

This waits until both databases are ready. To stop them, run `pnpm db:down`. Your dev data is kept.

## 2. Load the seed data

The owner will send you a **private link** to a file named like `ralevel-seed-2026-10-05.archive.gz`. It's a copy of the site's public content: topics, MCQs, blogs, scholarships, forms and so on. It contains **no personal data**. Don't share it, and never commit it.

1. Make a folder called `seed` in the repo root and put the file in it. (`seed/` is gitignored.)
2. Restore it into your dev database. This uses the newest file in `seed/`:

   ```bash
   pnpm db:restore
   ```

3. Add fake people (users, form submissions, appeals, comments, all `@example.com`), so the admin pages have something to show:

   ```bash
   pnpm db:seed-fake
   ```

4. *(Optional)* Add demo data for the `/tasks` workspace:

   ```bash
   pnpm db:seed-tasks
   ```

   After you've signed up in [06](06-run-the-website.md), you can run it again with `--me <your email>` so some tasks are assigned to you.

## Starting over

To throw away everything in `ralevel_dev` and load the seed again:

```bash
pnpm db:reset
pnpm db:seed-fake
```

This deletes anything you created yourself, including your own user record. You'll sign in again, and you'll need to re-run `pnpm dev:grant-role` from [07](07-admin-access.md).

To fill the **test** database, add `--test`: `pnpm db:restore --test`.

## Look at the data (optional)

In MongoDB Compass, connect to:

- dev: `mongodb://127.0.0.1:27027`
- test: `mongodb://127.0.0.1:27028`

Always use `127.0.0.1`, not `localhost`. On Windows, `localhost` can resolve to an address the databases don't listen on.

✅ **You should now see** `pnpm db:restore` and `pnpm db:seed-fake` finish without errors. In Compass, the `ralevel_dev` database has collections like `topics`, `mcqs`, `blogv2`, `scholarships` and `userdatas`.
