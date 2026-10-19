# 02 · Clone and install

Time: about 10 minutes.

## 1. Pick a folder

- **macOS:** `~/code` is fine.
- **Windows:** use a **short path near the drive root**, like `C:\code`. Deep folders plus `node_modules` can go over Windows' path length limit. Don't use a OneDrive- or Dropbox-synced folder either: syncing thousands of `node_modules` files makes everything slow and breaks installs.

## 2. Clone

### macOS

```bash
mkdir -p ~/code && cd ~/code
git clone https://github.com/Vasumitra-Gajbhiye/Ralevel-Website.git
cd Ralevel-Website
```

### Windows (PowerShell)

```powershell
mkdir C:\code -Force; cd C:\code
git clone https://github.com/Vasumitra-Gajbhiye/Ralevel-Website.git
cd Ralevel-Website
```

From now on, every command in these docs runs from this folder (the **repo root**) unless a page says otherwise.

## 3. Check Node and pnpm

```bash
fnm use
node --version
pnpm --version
```

- `fnm use` reads `.nvmrc` and switches to Node 22.23.1. If it offers to install it, say yes.
- `pnpm --version` should print `9.15.0`. The first time, Corepack may ask to download pnpm. Answer `Y`.

## 4. Install dependencies

```bash
pnpm install
```

The first install takes a few minutes. Warnings about Python or `node-gyp` (for `bufferutil` / `utf-8-validate`) are harmless.

Then check that everything compiles:

```bash
pnpm typecheck
```

## If something goes wrong

| Problem | Fix |
| --- | --- |
| Wrong Node version, or `Unsupported engine` | Run `fnm use` in the repo root, then try again. |
| `pnpm: command not found` | Run `corepack enable`, then open a new terminal. |
| **Windows:** `Filename too long` while cloning or installing | Do the long-paths steps in [01](01-prerequisites.md#windows), restart, delete the folder and clone again. |
| Errors mentioning `sharp` | Usually the wrong Node version or an interrupted install. Delete `node_modules` (macOS: `rm -rf node_modules`; Windows: `Remove-Item -Recurse -Force node_modules`), then run `pnpm install` again. |

More in [11 · Troubleshooting](11-troubleshooting.md).

✅ **You should now see** `pnpm install` finish without errors and `pnpm typecheck` end with `Done` for both `apps/website` and `apps/bot`.
