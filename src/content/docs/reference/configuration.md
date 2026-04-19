---
title: Configuration Reference
description: Complete reference for all Crontinel configuration options, environment variables, and self-hosting setup
---

This page documents every configuration option available in Crontinel. Options are set in `config/crontinel.php` (published via `php artisan crontinel:install`). Some — particularly database, Redis, and mail — are standard Laravel `.env` vars.

## Environment variable quick reference

| Variable | Config key | Default | Description |
|---|---|---|---|
| `CRONTINEL_PATH` | `path` | `crontinel` | URL path for the dashboard |
| `CRONTINEL_HORIZON` | `horizon.enabled` | `true` (auto) | Enable Horizon integration |
| `CRONTINEL_HORIZON_CONNECTION` | `horizon.connection` | `horizon` | Redis connection name for Horizon |
| `CRONTINEL_ALERT_CHANNEL` | `alerts.channel` | _(none)_ | Alert channel: `slack`, `mail`, or `webhook` |
| `CRONTINEL_ALERT_EMAIL` | `alerts.mail.to` | _(none)_ | Email alert recipient |
| `CRONTINEL_SLACK_WEBHOOK` | `alerts.slack.webhook_url` | _(none)_ | Slack incoming webhook URL |
| `CRONTINEL_WEBHOOK_URL` | `alerts.webhook.url` | _(none)_ | Custom webhook endpoint URL |
| `CRONTINEL_WEBHOOK_HEADERS` | `alerts.webhook.headers` | _(none)_ | JSON object of extra HTTP headers |
| `CRONTINEL_WEBHOOK_TIMEOUT` | `alerts.webhook.timeout` | `10` | Webhook request timeout in seconds |
| `CRONTINEL_API_KEY` | `saas_key` | _(none)_ | API key for the hosted dashboard |
| `CRONTINEL_API_URL` | `saas_url` | `https://app.crontinel.com` | SaaS endpoint URL |

---

## Dashboard

### `path`

Dashboard URL path. Default: `crontinel`

```php
'path' => env('CRONTINEL_PATH', 'crontinel'),
```

If set to `monitoring`, the dashboard lives at `yourdomain.com/monitoring`.

### `middleware`

Middleware applied to all dashboard routes. Default: `['web', 'auth']`

```php
'middleware' => ['web', 'auth'],
```

You almost certainly want `'web'` and `'auth'`. Add a role or ability check to restrict access:

```php
'middleware' => ['web', 'auth', 'can:viewCrontinel'],
```

---

## Horizon monitoring

Crontinel reads Horizon's Redis keys directly — the same data source the Horizon dashboard uses.

### `horizon.enabled`

Enable or disable Horizon monitoring. Default: `true` (auto-detected)

```php
'horizon' => [
    'enabled' => env('CRONTINEL_HORIZON', class_exists(Horizon::class)),
],
```

Set to `false` if you don't use Horizon. Queue and cron monitoring continue independently.

### `horizon.connection`

Redis connection name that Horizon uses. Default: `horizon`

```php
'connection' => env('CRONTINEL_HORIZON_CONNECTION', 'horizon'),
```

This must match the connection name in your `config/horizon.php`. Most apps leave it as `horizon`.

### `horizon.supervisor_alert_after_seconds`

Alert when a supervisor's heartbeat is older than this. Default: `60`

```php
'supervisor_alert_after_seconds' => 60,
```

Crontinel tracks each supervisor separately via its heartbeat Redis key. If `lastHeartbeat` is older than this threshold, the supervisor is considered down — even if the top-level `horizon:status` key still says `running`.

### `horizon.failed_jobs_per_minute_threshold`

Alert when the failed jobs-per-minute rate exceeds this. Default: `5`

```php
'failed_jobs_per_minute_threshold' => 5,
```

### Horizon gate — `ADMIN_EMAILS`

Access to the Horizon panel within Crontinel is gated by the `ADMIN_EMAILS` env var (checked via `Gate::before()` in `HorizonServiceProvider`). Set it to a comma-separated list of admin email addresses:

```env
ADMIN_EMAILS=harun@toolblip.com,ops@toolblip.com
```

Users whose logged-in email matches one of these addresses can access Horizon. If `ADMIN_EMAILS` is not set, access is denied to everyone.

---

## Queue monitoring

Crontinel supports both `redis` and `database` queue drivers.

### `queues.enabled`

Enable or disable queue monitoring. Default: `true`

```php
'queues' => [
    'enabled' => true,
],
```

### `queues.watch`

Queue names to watch. Default: `[]` (auto-discover all active queues)

```php
'watch' => [],                    // empty = auto-discover all queues
```

To watch specific queues only:

```php
'watch' => ['default', 'emails', 'notifications'],
```

### `queues.depth_alert_threshold`

Alert when a queue exceeds this many pending jobs. Default: `1000`

```php
'depth_alert_threshold' => 1000,
```

### `queues.wait_time_alert_seconds`

Alert when the oldest waiting job has been in the queue longer than this. Default: `300`

```php
'wait_time_alert_seconds' => 300,
```

### Threshold lookup order (hosted dashboard)

On the hosted dashboard, threshold lookups resolve in this order:

1. Per-queue override: `queue_thresholds.{queue_name}`
2. Per-app default: `queue_thresholds.default`
3. Global config value: `depth_alert_threshold` (default 1000)

---

## Cron / scheduler monitoring

Crontinel hooks into Laravel's `ScheduledTaskStarting`, `ScheduledTaskFinished`, and `ScheduledTaskFailed` events. No changes to your `schedule()` method are needed.

### `cron.enabled`

Enable or disable scheduler monitoring. Default: `true`

```php
'cron' => [
    'enabled' => true,
],
```

### `cron.late_alert_after_seconds`

Mark a cron run as `late` if it didn't execute within this many seconds of its expected window. Default: `120`

```php
'late_alert_after_seconds' => 120,
```

Bump this higher if you have tasks that legitimately take a few minutes to start.

### `cron.retain_days`

How long to keep cron run history in the database. Default: `30`

```php
'retain_days' => 30,
```

Crontinel prunes old records automatically. Schedule the prune command daily:

```php
$schedule->command('crontinel:prune')->daily();
```

### What gets recorded

| Field | Description |
|---|---|
| `command` | Artisan command name |
| `exit_code` | 0 = success, non-zero = failure |
| `duration_ms` | Execution time in milliseconds |
| `output` | Captured output (if enabled) |
| `started_at` | Exact start timestamp |
| `status` | `completed`, `failed`, or `late` |

---

## Alert channels

Crontinel supports three alert channels: `slack`, `mail`, and `webhook`. Set the active channel via `CRONTINEL_ALERT_CHANNEL`.

### `alerts.channel`

```php
'channel' => env('CRONTINEL_ALERT_CHANNEL'), // 'slack', 'mail', or 'webhook'
```

### Slack

```env
CRONTINEL_ALERT_CHANNEL=slack
CRONTINEL_SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

```php
'slack' => [
    'webhook_url' => env('CRONTINEL_SLACK_WEBHOOK'),
],
```

Create an [Incoming Webhook](https://api.slack.com/messaging/webhooks) in your Slack workspace. Crontinel sends a formatted message with alert details.

### Email

```env
CRONTINEL_ALERT_CHANNEL=mail
CRONTINEL_ALERT_EMAIL=ops@yourcompany.com
```

```php
'mail' => [
    'to' => env('CRONTINEL_ALERT_EMAIL'),
],
```

Uses your app's configured mail driver (set `MAIL_MAILER` in `.env`). Works with SMTP, Resend, Mailgun, or any Laravel-compatible driver.

### Webhook

```env
CRONTINEL_ALERT_CHANNEL=webhook
CRONTINEL_WEBHOOK_URL=https://your-endpoint.example.com/alerts
```

```php
'webhook' => [
    'url' => env('CRONTINEL_WEBHOOK_URL'),
    'headers' => env('CRONTINEL_WEBHOOK_HEADERS'),   // optional JSON object
    'timeout' => env('CRONTINEL_WEBHOOK_TIMEOUT', 10), // seconds
],
```

Sends a JSON POST to your endpoint:

```json
{
  "title": "Queue [default] alert",
  "message": "• Queue depth: 1500 jobs (threshold: 1000)",
  "level": "warning",
  "resolved": false,
  "fired_at": "2026-04-07T08:00:00+00:00",
  "source": "crontinel"
}
```

#### Custom headers

If your endpoint requires authentication headers, set `CRONTINEL_WEBHOOK_HEADERS` as a JSON object:

```env
CRONTINEL_WEBHOOK_HEADERS={"Authorization": "Bearer your-token", "X-Custom": "my-header"}
```

#### Request timeout

The default timeout is 10 seconds. Adjust with:

```env
CRONTINEL_WEBHOOK_TIMEOUT=30
```

### Alert deduplication

The same alert condition won't re-fire for 5 minutes. If a queue stays above threshold for an hour, you get one alert at the start — not one every poll cycle.

### Auto-resolution

When the condition clears, Crontinel sends a "resolved" notification with `"resolved": true`. You get clear start and end signals for every incident.

---

## SaaS connection (optional)

Connect this self-hosted app to the hosted dashboard at app.crontinel.com.

### `saas_key`

```php
'saas_key' => env('CRONTINEL_API_KEY'),
```

Set `CRONTINEL_API_KEY` to your dashboard API key. When set, Crontinel reports cron run summaries and status every minute.

### `saas_url`

```php
'saas_url' => env('CRONTINEL_API_URL', 'https://app.crontinel.com'),
```

Override the SaaS endpoint for self-hosted dashboard instances.

---

## Database (self-hosting)

Crontinel uses your app's existing database connection. Standard Laravel database env vars:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=crontinel
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_SSLMODE=require
```

For local development with Docker or Laravel Valet, `DB_HOST=127.0.0.1` is typical. On Railway or other PaaS, use the host/port/credentials provided by the platform.

---

## Redis

Crontinel and Horizon both use Redis. Standard Laravel Redis env vars:

```env
REDIS_CLIENT=phpredis      # or 'predis'
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

`REDIS_CLIENT` must match your PHP Redis extension — `phpredis` requires the PHP extension; `predis` is the pure-PHP client.

The connection used by Horizon is configured separately via `horizon.connection` (default: `horizon`). Ensure that connection name is defined in `config/database.php` under `redis`:

```php
'redis' => [
    'client' => env('REDIS_CLIENT', 'phpredis'),
    'connections' => [
        'horizon' => [
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_DB', '1'),
        ],
    ],
],
```

---

## Mail

Crontinel uses your app's configured mail driver for email alerts.

```env
MAIL_MAILER=smtp                    # or 'resend', 'mailgun', 'ses', etc.
MAIL_HOST=smtp.resend.com
MAIL_PORT=465
MAIL_USERNAME=resend
MAIL_PASSWORD=your-api-key
MAIL_FROM_ADDRESS="alerts@your-domain.com"
MAIL_FROM_NAME="${APP_NAME}"
```

For production, Resend is recommended:

```env
MAIL_MAILER=resend
RESEND_API_KEY=re_your-api-key
MAIL_FROM_ADDRESS="alerts@your-domain.com"
```

---

## Full config file

After `php artisan crontinel:install`, `config/crontinel.php` is published with all defaults:

```php
<?php

declare(strict_types=1);
use Laravel\Horizon\Horizon;

return [

    'path' => env('CRONTINEL_PATH', 'crontinel'),

    'middleware' => ['web', 'auth'],

    'saas_key' => env('CRONTINEL_API_KEY'),
    'saas_url' => env('CRONTINEL_API_URL', 'https://app.crontinel.com'),

    'horizon' => [
        'enabled' => env('CRONTINEL_HORIZON', class_exists(Horizon::class)),
        'supervisor_alert_after_seconds' => 60,
        'failed_jobs_per_minute_threshold' => 5,
        'connection' => env('CRONTINEL_HORIZON_CONNECTION', 'horizon'),
    ],

    'queues' => [
        'enabled' => true,
        'watch' => [],
        'depth_alert_threshold' => 1000,
        'wait_time_alert_seconds' => 300,
    ],

    'cron' => [
        'enabled' => true,
        'late_alert_after_seconds' => 120,
        'retain_days' => 30,
    ],

    'alerts' => [
        'channel' => env('CRONTINEL_ALERT_CHANNEL'),

        'mail' => [
            'to' => env('CRONTINEL_ALERT_EMAIL'),
        ],

        'slack' => [
            'webhook_url' => env('CRONTINEL_SLACK_WEBHOOK'),
        ],

        'webhook' => [
            'url' => env('CRONTINEL_WEBHOOK_URL'),
            'headers' => env('CRONTINEL_WEBHOOK_HEADERS'),
            'timeout' => env('CRONTINEL_WEBHOOK_TIMEOUT', 10),
        ],
    ],

];
```

Run `php artisan config:clear` after changing the config file in production.
