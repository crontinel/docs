---
title: Configuration Reference
description: Environment variables and config keys for the Laravel package, the connection to the hosted app, and a self-hosted install.
---

**Not on Laravel?** None of this applies. A curl, Node, Python, Sidekiq, or GitHub Actions job needs only the app **ingest key** (for example `CRONTINEL_INGEST_KEY` in the job's environment) and `https://app.crontinel.com`. Alert channels are added in the dashboard. See [check-in recipes](/check-in/recipes/).

This page documents every configuration option for the Laravel package. Options are set in `config/crontinel.php` (published via `php artisan crontinel:install`). Some — particularly database, Redis, and mail — are standard Laravel `.env` vars.

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
| `CRONTINEL_DURABLE_REPORTING` | `reporting.durable` | `false` | Write cron reports to a local spool before sending |
| `CRONTINEL_REPORT_SPOOL_PATH` | `reporting.spool_path` | `storage/app/crontinel-spool` | Spool directory for durable reporting |
| `CRONTINEL_BACKGROUND_CORRELATION` | `cron.background_correlation` | `false` | Send start/completion pairs for `runInBackground()` tasks |
| `CRONTINEL_CAPTURE_OUTPUT` | `cron.capture_output` | `false` | Send the tail of a task's output file |
| `CRONTINEL_AGENT_ENABLED` | `agent.enabled` | `false` | Agent daemon setting (see [Agent](#agent-daemon)) |

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

Keep `'web'` and `'auth'`. The dashboard refuses guests either way, and your app needs a `login` route for `auth` to redirect to.

Any signed-in user can open the dashboard by default. To limit it, redefine the `crontinel.view` gate in a service provider's `boot` method:

```php
Gate::define('crontinel.view', fn ($user) => $user->is_admin);
```

The dashboard and status API show each command's name without its arguments.

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

This must be a Redis connection defined under `redis` in `config/database.php` (see [Redis](#redis)). If it is not defined there, Crontinel cannot read Horizon's state. Most apps leave it as `horizon`.

### `horizon.supervisor_alert_after_seconds`

How long a supervisor that Horizon is configured to run may be missing before Crontinel reports it. Default: `60`

```php
'supervisor_alert_after_seconds' => 60,
```

Crontinel compares the supervisors in `horizon.environments` for the current environment (a wildcard key such as `staging*` works) with the ones running. Horizon restarts a crashed supervisor within seconds, so one is reported only after it has been gone for this long. `crontinel:check` then names it and exits non-zero, and the hosted app opens a "Horizon supervisor not running" alert. Package v0.9.10 and later. It needs a cache store shared between checks (`file` or `redis`, not `array`), and a supervisor running on another host with the same name hides a missing one.

### `horizon.failed_jobs_per_minute_threshold`

Alert when the failed jobs-per-minute rate exceeds this. Default: `5`

```php
'failed_jobs_per_minute_threshold' => 5,
```

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

### `queues.connections`

Queues on connections other than `QUEUE_CONNECTION` (package v0.9.9 and later). Default: `[]` (only the default connection is reported)

```php
'connections' => [
    'redis_b' => ['emails'],   // watch these queues
    'sqs'     => [],           // empty list = discover them
],
```

These queues are reported as `connection:queue` (for example `redis_b:emails`), so a `default` queue on two connections does not collide. Use that name for thresholds, such as `queue_thresholds.redis_b:emails`, and expect it in alerts. A connection name that is not in `config/queue.php` is ignored. Their failed-job counts come from `failed_jobs` rows with that connection. Verified with a database queue connection; not run against SQS.

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
3. Fixed fallback: 1000. The package's `depth_alert_threshold` is not sent to the hosted app; it only applies to local alerts.

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

### `cron.background_correlation`

Send start and completion pairs for `runInBackground()` tasks. Default: `false`

```php
'background_correlation' => env('CRONTINEL_BACKGROUND_CORRELATION', false),
```

Each launch carries its own run key and start time through the child process environment to Laravel's `schedule:finish`. Rebuild the config cache and restart long-running schedulers after changing it.

### `cron.capture_output`

Send the last 10,000 characters of a task's output file. Default: `false`

```php
'capture_output' => env('CRONTINEL_CAPTURE_OUTPUT', false),
```

The task needs an output file from `sendOutputTo()`, `appendOutputTo()` or `storeOutput()`. Off by default because output may hold sensitive data.

### `cron.retain_days`

How long to keep cron run history in the database. Default: `30`

```php
'retain_days' => 30,
```

Nothing prunes old records automatically. Schedule the prune command yourself; it deletes runs older than `retain_days` (or `--days=N`):

```php
$schedule->command('crontinel:prune')->daily();
```

### What gets recorded

| Field | Description |
|---|---|
| `command` | Artisan command name |
| `ran_at` | When the run was recorded |
| `exit_code` | 0 = success, non-zero = failure |
| `duration_ms` | Execution time in milliseconds |
| `output` | Captured output (nullable) |

These rows live in the `crontinel_runs` table.

---

## Alert channels

Crontinel supports three alert channels: `slack`, `mail`, and `webhook`. Set the active channel via `CRONTINEL_ALERT_CHANNEL`.

Local alerts are evaluated only when `crontinel:check` runs. The service provider schedules `crontinel:report`, not `crontinel:check`, so add it to your scheduler:

```php
$schedule->command('crontinel:check')->everyMinute();
```

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

The same alert condition won't re-fire for 5 minutes. If a queue stays above threshold, the next `crontinel:check` after those 5 minutes sends the alert again, so an hour-long breach sends about 12 alerts.

### Auto-resolution

When the condition clears within 5 minutes of the last alert, Crontinel sends a "resolved" notification (`"resolved": true` on the webhook). The open alert is kept in your cache for 5 minutes, so a condition that clears later does not send a resolved notification.

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

### `reporting.durable` and `reporting.spool_path`

```php
'reporting' => [
    'durable' => env('CRONTINEL_DURABLE_REPORTING', false),
    'spool_path' => env('CRONTINEL_REPORT_SPOOL_PATH', storage_path('app/crontinel-spool')),
],
```

With `durable` on, cron start and completion reports are written to the spool directory first. The every-minute `crontinel:report` run drains them, and `php artisan crontinel:flush-reports` drains one batch by hand. Use a private, persistent local directory.

---

## Agent daemon

```php
'agent' => [
    'enabled' => env('CRONTINEL_AGENT_ENABLED', false),
    'poll_interval' => 5,
    'heartbeat_interval' => 60,
    'max_reconnect_delay' => 60,
    'default_command_timeout' => 300,
    'allowed_commands' => [],
],
```

Settings for `php artisan crontinel:agent`. `allowed_commands` lists the commands the agent may run, matched with `fnmatch()`. The default empty list allows no commands. `poll_interval` is how often, in seconds, it asks the hosted app for commands (v0.9.11+). See the [agent guide](/agent/guide/).

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
    /*
    |--------------------------------------------------------------------------
    | Dashboard Path
    |--------------------------------------------------------------------------
    | The URI path where the Crontinel dashboard is accessible.
    */
    'path' => env('CRONTINEL_PATH', 'crontinel'),

    /*
    |--------------------------------------------------------------------------
    | Dashboard Middleware
    |--------------------------------------------------------------------------
    */
    'middleware' => ['web', 'auth'],

    /*
    |--------------------------------------------------------------------------
    | SaaS Reporting
    |--------------------------------------------------------------------------
    | Set CRONTINEL_API_KEY to connect this app to the hosted SaaS at
    | app.crontinel.com. When set, status is reported every minute and
    | cron run events are pushed after each scheduled task completes.
    */
    'saas_key' => env('CRONTINEL_API_KEY'),
    'saas_url' => env('CRONTINEL_API_URL', 'https://app.crontinel.com'),

    // Opt-in disk-backed cron reports. Use persistent private local storage.
    'reporting' => [
        'durable' => env('CRONTINEL_DURABLE_REPORTING', false),
        'spool_path' => env('CRONTINEL_REPORT_SPOOL_PATH', storage_path('app/crontinel-spool')),
    ],

    /*
    |--------------------------------------------------------------------------
    | Horizon Integration
    |--------------------------------------------------------------------------
    | Set to false if you are not using Laravel Horizon.
    */
    'horizon' => [
        'enabled' => env('CRONTINEL_HORIZON', class_exists(Horizon::class)),
        'supervisor_alert_after_seconds' => 60,
        'failed_jobs_per_minute_threshold' => 5,
        'connection' => env('CRONTINEL_HORIZON_CONNECTION', 'horizon'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Queue Monitoring
    |--------------------------------------------------------------------------
    */
    'queues' => [
        'enabled' => true,
        'watch' => [],
        // Queues on other connections than queue.default, as ['connection' => ['queue', ...]]; an empty list finds them.
        // They are reported as "connection:queue", so alerts and thresholds for them use that name.
        'connections' => [],
        'depth_alert_threshold' => 1000,
        'wait_time_alert_seconds' => 300,
    ],

    /*
    |--------------------------------------------------------------------------
    | Cron / Scheduled Command Monitoring
    |--------------------------------------------------------------------------
    */
    'cron' => [
        'enabled' => true,
        'background_correlation' => env('CRONTINEL_BACKGROUND_CORRELATION', false),
        // Send the last 10,000 characters of a task's output file (sendOutputTo, appendOutputTo,
        // storeOutput). Off by default because output may hold sensitive data.
        'capture_output' => env('CRONTINEL_CAPTURE_OUTPUT', false),
        'late_alert_after_seconds' => 120,
        'retain_days' => 30,
    ],

    /*
    |--------------------------------------------------------------------------
    | Alert Channels
    |--------------------------------------------------------------------------
    | Supported: "mail", "slack", "webhook", null
    | Set CRONTINEL_ALERT_CHANNEL to enable alerts.
    */
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

    /*
    |--------------------------------------------------------------------------
    | Agent Daemon (php artisan crontinel:agent)
    |--------------------------------------------------------------------------
    | Settings for the remote command agent. It polls app.crontinel.com for
    | commands every poll_interval seconds and runs the allowed ones.
    */
    'agent' => [
        'enabled' => env('CRONTINEL_AGENT_ENABLED', false),
        'poll_interval' => 5,
        'heartbeat_interval' => 60,
        'max_reconnect_delay' => 60,
        'default_command_timeout' => 300,

        /*
        |----------------------------------------------------------------------
        | Allowed Commands
        |----------------------------------------------------------------------
        | Commands received from the Crontinel SaaS are only executed if they
        | match one of these patterns. Patterns are matched with fnmatch(),
        | so "*" is a wildcard and any other string must match exactly.
        |
        | IMPORTANT: the default is an empty array, which means NO commands
        | are permitted. This is a fail-closed default — you must explicitly
        | opt in to the exact commands (or patterns) you want the agent to be
        | able to run. An empty list is NOT "allow everything".
        */
        'allowed_commands' => [],
    ],
];
```

Run `php artisan config:clear` after changing the config file in production.
