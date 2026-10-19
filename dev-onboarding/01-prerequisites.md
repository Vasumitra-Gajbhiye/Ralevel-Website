# 01 · Prerequisites

Install these once. Time: 30–60 minutes, mostly waiting for downloads.

## 1. GitHub account

1. Sign in at [github.com](https://github.com) (or create an account).
2. Turn on **two-factor authentication**: Settings → Password and authentication.
3. Send the owner your GitHub **username**. You'll get an invite to the repo with Write access. Accept it from the email or from [github.com/notifications](https://github.com/notifications).

The repo is public, so you can do pages 01–07 before the invite arrives. You only need the invite to push.

## 2. Git

### macOS

```bash
xcode-select --install
```

If it says the tools are already installed, you're done.

### Windows

1. Install [Git for Windows](https://git-scm.com/download/win). The default options are fine.
2. In PowerShell:

   ```powershell
   git config --global core.autocrlf false
   git config --global core.longpaths true
   ```

3. Turn on long paths in Windows. Some files in this project have very deep paths. Open **PowerShell as Administrator** (Start → type PowerShell → right-click → Run as administrator):

   ```powershell
   New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name LongPathsEnabled -Value 1 -PropertyType DWORD -Force
   ```

   Restart your computer afterwards.

### Both

Tell Git who you are (use the email on your GitHub account):

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

## 3. Node.js 22.23.1 (with fnm)

The project needs exactly this Node version. [fnm](https://github.com/Schniz/fnm) installs it and switches to it automatically inside the project.

### macOS

Install [Homebrew](https://brew.sh) if you don't have it, then:

```bash
brew install fnm
echo 'eval "$(fnm env --use-on-cd --shell zsh)"' >> ~/.zshrc
```

Open a **new** terminal, then:

```bash
fnm install 22.23.1
node --version
```

### Windows

```powershell
winget install Schniz.fnm
```

Add fnm to your PowerShell profile:

```powershell
if (!(Test-Path $PROFILE)) { New-Item -Path $PROFILE -Force }
Add-Content $PROFILE 'fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression'
```

Open a **new** PowerShell window, then:

```powershell
fnm install 22.23.1
node --version
```

If PowerShell says "running scripts is disabled on this system", run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then open a new window.

## 4. pnpm (with Corepack)

This project uses **pnpm**, never npm or yarn. Corepack comes with Node and picks the exact pnpm version the project asks for (9.15.0):

```bash
corepack enable
```

On Windows, if this fails with `EPERM`, run it once in an Administrator PowerShell. Don't install pnpm with `npm install -g`. You'll check the version after cloning, in page 02.

## 5. Docker

Docker runs your local databases.

### macOS

Install [OrbStack](https://orbstack.dev) (lighter, recommended) or [Docker Desktop](https://www.docker.com/products/docker-desktop/). Open it once so it's running.

### Windows

1. In an **Administrator** PowerShell, run `wsl --install`, then restart.
2. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/). Keep "Use WSL 2 based engine" ticked (it's the default).
3. Start Docker Desktop and wait until it says it's running.

### Check (both)

```bash
docker run --rm hello-world
```

## 6. VS Code and extensions

Install [VS Code](https://code.visualstudio.com), then these extensions (search for them in the Extensions panel, or run these commands):

```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension unifiedjs.vscode-mdx
```

Optional: [MongoDB Compass](https://www.mongodb.com/products/tools/compass), a GUI for looking at your local database (page 03).

✅ **You should now see:**

- `git --version` prints a version
- `node --version` prints `v22.23.1`
- `docker run --rm hello-world` prints "Hello from Docker!"
- the owner has your GitHub username
