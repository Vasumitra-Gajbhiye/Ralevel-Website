# Discord bot

**Tier 2.** You only need this for Discord work: ban appeals, application notifications, reminders, slash commands and buttons. It takes about 30 minutes the first time.

You'll make **your own** Discord test server and **your own** bot application. Never use the real r/alevel bot or server.

## How it fits together

- **Website → bot:** the website sends small HTTP requests to the bot (`BOT_INTERNAL_URL`, authenticated with `INTERNAL_BOT_SECRET`). The bot then posts messages in Discord.
- **Discord → bot:** slash commands and button clicks arrive at the bot's `/interactions` endpoint.
- **Ban-appeal login:** the website signs people in with Discord (OAuth) to find out who's appealing.

## 1. A test server

1. In Discord, create a new server (the **+** button), e.g. "ralevel-dev-yourname".
2. Turn on **Developer Mode**: User Settings → Advanced. You can now right-click anything and choose **Copy ID**.
3. Create two text channels, e.g. `#applications` and `#ban-appeals`, and two roles, e.g. `jr-admin` and `sr-admin`. Give yourself both roles.

## 2. A bot application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) → **New Application**.
2. **General Information:** copy the **Application ID** and the **Public Key**.
3. **Bot:** click **Reset Token** and copy the token. Treat it like a password.
4. **OAuth2:** copy the **Client Secret**. Under **Redirects**, add:

   ```
   http://localhost:3000/api/discord-appeal/callback
   ```

5. **Invite the bot to your server:** OAuth2 → URL Generator → scopes `bot` and `applications.commands` → bot permissions **Send Messages**, **Embed Links**, **Read Message History** and **Ban Members** (appeal approvals unban people). Open the generated URL and pick your test server.

## 3. Env files

**Website**, in `apps/website/.env.local`:

```bash
DISCORD_CLIENT_ID=<Application ID>
DISCORD_CLIENT_SECRET=<Client Secret>
DISCORD_PUBLIC_KEY=<Public Key>
DISCORD_GUILD_ID=<your server's ID>
DISCORD_BOT_TOKEN=<bot token>   # only used to register slash commands
BOT_INTERNAL_URL=http://localhost:8787
INTERNAL_BOT_SECRET=local-dev-secret
```

**Bot**: copy the template, then fill it in:

- macOS: `cp .env.bot.example apps/bot/.env`
- Windows: `Copy-Item .env.bot.example apps\bot\.env`

```bash
DISCORD_NOTIFICATIONS_ENABLED=true
DISCORD_BOT_TOKEN=<bot token>
DISCORD_PUBLIC_KEY=<Public Key>
DISCORD_GUILD_ID=<your server's ID>
DISCORD_APPLICATIONS_CHANNEL_ID=<#applications ID>
DISCORD_BAN_APPEAL_CHANNEL_ID=<#ban-appeals ID>
DISCORD_JR_ADMIN_ROLE_ID=<jr-admin ID>
DISCORD_SR_ADMIN_ROLE_ID=<sr-admin ID>
```

`INTERNAL_BOT_SECRET` must be the same in both files (the template already uses `local-dev-secret` in both).

## 4. Run it

In two terminals:

```bash
pnpm dev       # website
pnpm dev:bot   # bot, on http://localhost:8787
```

Register the slash commands in your server (run this again whenever the commands change):

```bash
pnpm --filter @ralevel/website register-discord-appeal-commands
```

## 5. Slash commands and buttons (needs a tunnel)

Discord can only send interactions to a public `https://` URL, so expose the bot with a free Cloudflare quick tunnel:

1. Install `cloudflared`. macOS: `brew install cloudflared`. Windows: `winget install Cloudflare.cloudflared`.
2. Run `cloudflared tunnel --url http://localhost:8787` and copy the `https://….trycloudflare.com` URL it prints.
3. In the Developer Portal → **General Information** → **Interactions Endpoint URL**, enter `https://….trycloudflare.com/interactions` and save. Discord checks it straight away, so the bot must be running.

The tunnel URL changes every time you restart `cloudflared`, so update the endpoint when it does. You only need the tunnel for commands and buttons. Notifications and the appeal login work without it.

✅ **You should now see:**

- submitting an application form on your local site posts a message in your `#applications` channel
- `/ping` in your server gets a reply (with the tunnel running)
