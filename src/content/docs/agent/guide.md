---
title: Agent Guide
description: Install and run the Crontinel agent daemon for remote command execution
---

The Crontinel agent is a lightweight daemon that runs on your server, connects to `app.crontinel.com`, and polls for remote commands. It enables cloud-triggered cron execution — schedule a command from the dashboard and the agent runs it on your server.

:::caution[Command allowlist required]
By default the agent refuses to run **any** command. You must explicitly configure an allowlist of permitted commands before the agent will execute anything triggered from the dashboard — see [Command Allowlisting](#command-allowlisting) below. This is deliberate: the dashboard can schedule an arbitrary command, so the agent won't run it unless you've told it that command is expected.
:::

## How It Works

1. The agent registers with Crontinel Cloud using your API key and app ID
2. It polls `app.crontinel.com/api/v1/agents/{id}/commands` every 5 seconds
3. When a trigger is scheduled from the dashboard, the agent checks the command against your configured allowlist
4. If allowed, it executes the command and reports the result (success/failure, output, duration) back to the cloud; if not allowed, it reports a rejection and does **not** run it
5. A heartbeat is sent every 60 seconds to keep the connection alive

## Laravel Agent

The Laravel package (`crontinel/laravel`) includes a built-in agent command.

### Prerequisites

- `crontinel/laravel` installed via Composer
- `CRONTINEL_API_KEY` and `CRONTINEL_APP_ID` set in `.env`

### Start the Agent

```bash
php artisan crontinel:agent
```

### Production Setup

Generate a systemd unit file:

```bash
php artisan crontinel:agent --systemd
```

Or a supervisor config:

```bash
php artisan crontinel:agent --supervisor
```

## Node.js Agent

The Node package (`@crontinel/node`) includes a CLI agent.

### Prerequisites

- `@crontinel/node` installed via npm
- `CRONTINEL_API_KEY` and `CRONTINEL_APP_ID` environment variables set

### Start the Agent

```bash
npx crontinel agent
```

Or with environment variables inline:

```bash
CRONTINEL_API_KEY=your-key CRONTINEL_APP_ID=your-app npx crontinel agent
```

## Python Agent

The Python package includes an agent CLI (requires PyPI installation when available).

### Prerequisites

- `crontinel` package installed
- `CRONTINEL_API_KEY` and `CRONTINEL_APP_ID` environment variables set

### Start the Agent

```bash
crontinel agent
```

## Command Allowlisting

The agent will only execute commands that match an entry in your allowlist. An unconfigured or empty allowlist means **no commands are permitted** — this is the default, fail-closed behavior.

Patterns support exact string matches and `*` as a wildcard (e.g. `php artisan queue:*` allows any `queue:` subcommand).

**Laravel** — publish the config (`php artisan vendor:publish --tag=crontinel-config`) and set `allowed_commands` in the `agent` block of `config/crontinel.php`:

```php
'agent' => [
    // ...
    'allowed_commands' => [
        'php artisan queue:restart',
        'php artisan horizon:terminate',
        'php artisan queue:*',
    ],
],
```

**Node.js and Python** — set the `CRONTINEL_AGENT_ALLOWED_COMMANDS` environment variable to a comma-separated list of patterns:

```bash
CRONTINEL_AGENT_ALLOWED_COMMANDS="php artisan queue:restart,php artisan horizon:terminate,queue:*" npx crontinel agent
```

The Node.js and Python agents also accept an equivalent `allowedCommands` / `allowed_commands` option when constructing the agent programmatically.

A rejected command is reported back to the dashboard as failed with the reason "Command rejected: not in allowlist," so you can see rejections in your trigger history and adjust the allowlist as needed.

## Systemd Service (All Runtimes)

Create `/etc/systemd/system/crontinel-agent.service`:

```ini
[Unit]
Description=Crontinel Agent Daemon
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/your/app
Environment=CRONTINEL_API_KEY=your-api-key
Environment=CRONTINEL_APP_ID=your-app-slug
ExecStart=/usr/bin/php artisan crontinel:agent
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable crontinel-agent
sudo systemctl start crontinel-agent
```

## Supervisor Config (All Runtimes)

Create `/etc/supervisor/conf.d/crontinel-agent.conf`:

```ini
[program:crontinel-agent]
command=php artisan crontinel:agent
directory=/path/to/your/app
user=www-data
autostart=true
autorestart=true
startretries=3
stderr_logfile=/var/log/crontinel-agent.err.log
stdout_logfile=/var/log/crontinel-agent.out.log
```

Reload and start:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start crontinel-agent
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `CRONTINEL_API_KEY` | Yes | — | Your API key from app.crontinel.com/settings |
| `CRONTINEL_APP_ID` | Yes | — | Your app slug from the app settings page |
| `CRONTINEL_API_URL` | No | `https://app.crontinel.com` | API base URL (change only for self-hosted) |
| `CRONTINEL_AGENT_ALLOWED_COMMANDS` | Node/Python only | — (fail-closed) | Comma-separated allowlist patterns. Laravel uses `allowed_commands` in `config/crontinel.php` instead — see [Command Allowlisting](#command-allowlisting) |

## Testing

1. Add the command you want to test to your [allowlist](#command-allowlisting) — untested commands are rejected by default
2. Go to your app detail page
3. Click "Schedule Trigger"
4. Enter the same command (e.g., `php artisan inspire`)
5. Set it to run "Now"
6. Watch the agent execute it and report back

## Troubleshooting

**Agent won't start**
- Verify `CRONTINEL_API_KEY` and `CRONTINEL_APP_ID` are set
- Check network connectivity to `app.crontinel.com`

**Agent starts but no commands received**
- Verify the app ID matches your app in the dashboard
- Check that triggers are being dispatched (Dashboard → Triggers)

**Agent crashes repeatedly**
- Enable logging: set `CRONTINEL_AGENT_LOG=/var/log/crontinel-agent.log`
- Ensure the agent user has permission to execute the scheduled commands

**Commands are rejected / never execute**
- Check the trigger's result on the dashboard for "Command rejected: not in allowlist"
- Verify the command matches an entry in your [allowlist](#command-allowlisting) exactly, or via a `*` pattern
- Remember the default allowlist is empty — nothing runs until you configure one
