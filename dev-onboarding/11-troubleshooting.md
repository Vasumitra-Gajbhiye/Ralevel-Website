# 11 · Troubleshooting

Find your error message below. If it isn't here and you've been stuck for 45 minutes, ask the owner. Once it's solved, add it to this page in a PR.

## Install and setup

| Symptom | Fix |
| --- | --- |
| `node --version` isn't `v22.23.1` | In the repo root, run `fnm use`. If fnm isn't switching automatically, check the shell setup in [01](01-prerequisites.md#3-nodejs-222231-with-fnm) and open a new terminal. |
| `pnpm: command not found` | `corepack enable`, then open a new terminal. |
| `pnpm --version` isn't `9.15.0` | You may have a global pnpm from npm. Remove it (`npm uninstall -g pnpm`), then run `corepack enable`. |
| **Windows:** `Filename too long` | Long paths aren't on. Do the long-paths steps in [01](01-prerequisites.md#windows), restart, then clone again into a short folder like `C:\code`. |
| **Windows:** "running scripts is disabled on this system" | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then open a new PowerShell. |
| `sharp` errors during install or `pnpm dev` | Wrong Node version or an interrupted install. Run `fnm use`, delete `node_modules`, run `pnpm install`. |
| **Windows:** every line of a file shows as changed in `git diff` | Line endings. Check that `git config --global core.autocrlf` is `false`. The repo's `.gitattributes` keeps everything LF. |

## Databases

| Symptom | Fix |
| --- | --- |
| `pnpm db:up` says it can't connect to the Docker daemon | Docker isn't running. Start OrbStack or Docker Desktop and wait until it's ready. |
| `port is already allocated` on 27027, 27028 or 6389 | Something else is using that port. Run `docker ps` to see what, and stop it. |
| `Refusing to use this MONGODB_URI …` | A script was about to touch something that isn't your local database. Check `MONGODB_URI` in `apps/website/.env.local`: it should be `mongodb://127.0.0.1:27027/ralevel_dev`. |
| `pnpm db:restore` can't find an archive | Put the seed file in a `seed/` folder in the repo root, or pass its path: `pnpm db:restore path/to/file.archive.gz`. |
| `ECONNREFUSED 127.0.0.1:27027` | The databases aren't running. Run `pnpm db:up`. |
| The test database is empty again | That's by design. It's wiped every time its container restarts. |

## Running the site

| Symptom | Fix |
| --- | --- |
| `@clerk/nextjs: Missing publishableKey` or `Missing secretKey` | The Clerk keys in `.env.local` are empty or wrong. See [05](05-clerk-setup.md), then restart `pnpm dev`. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is missing or empty` | Copy that line from `.env.example` back into `.env.local`, then restart. |
| I changed `.env.local` and nothing happened | Restart `pnpm dev`. Env files are only read at startup. |
| A page takes 30–60 seconds the first time | Normal. Next.js compiles each page the first time you open it. |
| The sign-up code isn't arriving | Use a `+clerk_test` email (`yourname+clerk_test@example.com`) and the code `424242`. |
| Clerk says the password is too weak or has been breached | Pick a stronger, unique password. Clerk checks known breaches even in development. |
| `/admin` sends me away or says no access | You don't have a role yet. See [07](07-admin-access.md). |
| `[redis] … disabled` or `[email] … skipped` in the terminal | Expected locally. Nothing is wrong. |
| `pnpm dev` starts on port 3001 instead of 3000 | Another `pnpm dev` is still running. Stop it with `Ctrl+C` (or close that terminal), then start again. The site expects port 3000. |
