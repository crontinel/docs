---
title: Configuration Reference
description: Complete reference for all Crontinel configuration options, environment variables, and self-hosting setup
---

This page documents every configuration option available in Crontinel. Most options are set in `config/crontinel.php` (published via `php artisan crontinel:install`). Some, particularly database, Redis, and mail, are standard Laravel env vars in your `.env` file.

## Quick reference — all environment variables

| Variable | Default | Description |
|---|---|---|
| `CRONTINEL_PATH` | `crontinel` | URL path for the dashboard |
| `CRONTINEL_HORIZON` | `true` | Enable Horizon integration |
| `CRONTINEL_HORIZON_CONNECTION` | `horizon` | Redis connection name for Horizon |
| `CRONTINEL_ALERT_CHANNEL` | `null` | Alert channel: `slack`, `mail`, or `webhook` |
| `CRONTINEL_SLACK_WEBHOOK` | `null` | Slack incoming webhook URL |
| `CRONTINEL_ALERT_EMAIL` | `null` | Email alert recipient |
| `CRONTINEL_WEBHOOK_URL` | `null` | Custom webhook endpoint URL |
| `CRONTINEL_WEBHOOK_SECRET` | `null` | HMAC secret for webhook signature verification |
| `CRONTINEL_API_KEY` | `null` | SaaS API key (optional) |
| `CRONTINEL_API_URL` | `https://app.crontinel.com` | SaaS endpoint URL |
| `ADMIN_EMAILS` | `null` | Comma-separated admin emails for Horizon gate access |

---

## Dashboard

### `path`

Dashboard URL path. Default: `crontinel`

```php
'path' => env('CRONTINEL_PATH', 'crontinel'),
```

Controls where the dashboard is mounted. If set to `monitoring`, the dashboard lives at `yourdomain.com/monitoring`.

### `middleware`

Middleware applied to all dashboard routes. Default: `['web', 'auth']`

```php
'middleware' => ['web', 'auth'],
```

You almost certainly want `'web'` and `'auth'` here. Add a Gate check or role middleware to restrict access:

```php
'middleware' => ['web', 'auth', 'can:viewCrontinel'],
```

---

## Horizon monitoring

Crontinel reads Horizon's Redis keys directly — the same data source the Horizon dashboard uses.

### `horizon.enabled`

Enable or disable Horizon monitoring. Default: `true`

```php
'horizon' => [
    'enabled' => env('CRONTINEL_HORIZON', true),
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

### Threshold lookup order (SaaS)

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

Crontinel prunes old records automatically via `crontinel:prune`. Run it daily with the scheduler:

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
CRONTINEL_WEBHOOK_SECRET=your-random-secret-here
```

```php
'webhook' => [
    'url' => env('CRONTINEL_WEBHOOK_URL'),
],
```

Sends a JSON POST to your endpoint:

```json
{
  "app": "my-app",
  "alert_key": "queue:default:depth",
  "message": "Queue 'default' depth is 1500 (threshold: 1000)",
  "state": "firing",
  "fired_at": "2026-04-07T08:00:00Z"
}
```

**Verify webhook signatures** using the `X-Crontinel-Signature` header (HMAC-SHA256). See the [Security doc](/security) for the verification code.

### Alert deduplication

The same alert condition won't re-fire for 5 minutes. If a queue stays above threshold for an hour, you get one alert at the start — not one every poll cycle.

### Auto-resolution

When the condition clears, Crontinel sends a "resolved" notification with `"state": "resolved"`. You get clear start and end signals for every incident.

### Future channels (roadmap)

- **PagerDuty** — IT alert routing and incident management. Planned.
- **SMS** — Direct text message alerts. Planned.
- **OpsGenie** — IT alert routing and on-call management. Planned.

---

## Notification routing rules

You can route alerts differently based on the alert type, monitor name, or severity. Configure routing in `config/crontinel.php`:

```php
'notification_routing' => [
    // Route queue depth alerts to Slack
    [
        'condition' => ['type' => 'queue_depth'],
        'channel' => 'slack',
        'slack_webhook' => env('CRONTINEL_SLACK_WEBHOOK'),
    ],

    // Route failed cron jobs to email
    [
        'condition' => ['type' => 'cron_failed'],
        'channel' => 'mail',
        'mail_to' => env('CRONTINEL_ALERT_EMAIL'),
    ],

    // Route Horizon supervisor down to webhook
    [
        'condition' => ['type' => 'horizon_supervisor_down'],
        'channel' => 'webhook',
        'webhook_url' => env('CRONTINEL_WEBHOOK_URL'),
    ],
],
```

Without explicit routing rules, Crontinel uses the default `alerts.channel` for all alerts.

---

## SaaS connection (optional)

If you're using the hosted dashboard at app.crontinel.com, set your API key here. Leave null to use the local dashboard only.

### `saas_key`

```php
'saas_key' => env('CRONTINEL_API_KEY'),
```

### `saas_url`

```php
'saas_url' => env('CRONTINEL_API_URL', 'https://app.crontinel.com'),
```

When `saas_key` is null, no data is sent to the SaaS. When set, Crontinel reports cron run summaries (command name, exit code, duration, timestamp) to the dashboard.

---

## Database (self-hosting)

Crontinel uses PostgreSQL. Standard Laravel database env vars:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=crontinel
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_SSLMODE=require
```

For local development with Docker/Valet, `DB_HOST=127.0.0.1` is typical. On Railway or other PaaS, use the provided host/port/credentials.

---

## Redis

Crontinel and Horizon both use Redis. Standard Laravel Redis env vars:

```env
REDIS_CLIENT=phpredis      # or 'predis'
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

`REDIS_CLIENT` should match your PHP Redis extension (`phpredis` requires the PHP Redis extension; `predis` is the pure-PHP client). The connection name used by Horizon is configured separately in `horizon.connection`.

If you use a different Redis connection for Horizon, ensure that connection is defined in `config/database.php` under `redis`:

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

return [

    'path' => env('CRONTINEL_PATH', 'crontinel'),

    'middleware' => ['web', 'auth'],

    'horizon' => [
        'enabled' => env('CRONTINEL_HORIZON', true),
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
        ],
    ],

    'notification_routing' => [
        // Add routing rules here
    ],

    'saas_key' => env('CRONTINEL_API_KEY'),
    'saas_url' => env('CRONTINEL_API_URL', 'https://app.crontinel.com'),

];
```

Run `php artisan config:clear` after changing the config file in production.
