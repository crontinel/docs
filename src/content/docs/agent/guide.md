---
title: Agent Guide
description: Install and run the Crontinel agent daemon for remote command execution
---

The Crontinel agent is a lightweight daemon that runs on your server, connects to `app.crontinel.com`, and polls for remote commands. It enables cloud-triggered cron execution — schedule a command from the dashboard and the agent runs it on your server.

## How It Works

1. The agent registers with Crontinel Cloud using your API key and app ID
2. It polls `app.crontinel.com/api/v1/agents/{id}/commands` every 5 seconds
3. When a trigger is scheduled from the dashboard, the agent receives the command and executes it
4. The agent reports the result (success/failure, output, duration) back to the cloud
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

## Testing

Schedule a test trigger from your dashboard:

1. Go to your app detail page
2. Click "Schedule Trigger"
3. Enter a command (e.g., `php artisan inspire`)
4. Set it to run "Now"
5. Watch the agent execute it and report back

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
