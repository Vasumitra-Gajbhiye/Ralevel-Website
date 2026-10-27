# 10 · Team rules

## Branches and pull requests

1. **Never push to `main`.** GitHub blocks it for you. Every change goes through a branch and a pull request (PR).
2. **Work from an issue.** Pick an issue assigned to you, and comment on it when you start.
3. **One branch per task.** Name it `feat/…`, `fix/…`, `chore/…` or `docs/…` plus a short description: `feat/scholarship-filters`, `fix/blog-date-timezone`.
4. **Keep PRs small:** roughly under 400 changed lines, one purpose each. Two small PRs are easier to review than one big one.
5. **Before opening a PR:**
   - update your branch with the latest `main`
   - run `pnpm typecheck` and `pnpm test`
   - click through your change locally
   - for UI changes, add desktop **and** mobile screenshots to the PR
6. **PR title = commit message.** PRs are squash-merged, so the title becomes the one commit on `main`. Make it meaningful: `feat: add scholarship filters`, not `changes`.
7. **You need the owner's approval** and every review conversation resolved before merging. Never merge your own PR without approval.
8. **Merging to `main` deploys to production.** Treat every merge as shipping.

## Ask first

Ask the owner **before** you:

- touch `.github/`, the `Dockerfile`s or `docker-compose` files
- change auth, roles or page access (`proxy.ts`, `lib/roles.ts`, `lib/superAdmin.ts`, `lib/getAuthSession.ts`, `lib/adminApiAuth.ts`, `lib/admin-access/`)
- change payments (Stripe code)
- add or upgrade a dependency

## Data and secrets

1. **Only use your local databases** (`ralevel_dev`, `ralevel_test`) and **your own dev/test accounts**. You'll never be given production keys or the production database, so don't ask, and never run anything against production.
2. **Never commit `.env` files or paste keys anywhere:** code, issues, PRs, chats, screenshots. The repo is public.
3. **If you leak something, even your own dev key,** rotate it and tell the owner immediately. Nobody gets blamed.
4. **Never commit the seed archive** or any real people's data. Fake data uses `@example.com`.

## Code

1. **pnpm only.** Never use npm or yarn, because they'd create a different lockfile.
2. **Scripts must work on Windows and macOS.** No bash-only syntax in `package.json`. Write scripts in TypeScript and run them with `tsx`.
3. **Match the code around you:** naming, structure, comment style.
4. **Check roles on the server** for anything that reads or changes protected data.
5. **Minimal UI.** Reuse `components/ui/*`, and keep pages simple to navigate (see [09](09-project-tour.md#ui-conventions)).
6. **AI tools are fine.** Read and understand everything before you commit it. You're responsible for your PR, whoever typed it.

## Getting help

- **Stuck for more than 45 minutes? Ask.** That's expected, not a failure.
- Found something wrong in these docs? Fix it in a PR.
