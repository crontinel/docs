---
title: Configuration Reference
description: All config/crontinel.php options
---

After running `php artisan crontinel:install`, a config file is published to `config/crontinel.php`. Below is the full file with all defaults, followed by a breakdown of each section.

## Full config file

```php
<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Dashboard Path
    |--------------------------------------------------------------------------
    |
    | The URL path where the Crontinel dashboard will be served.
    | e.g. yourdomain.com/crontinel
    |
    */

    'path' => env('CRONTINEL_PATH', 'crontinel'),

    /*
    |--------------------------------------------------------------------------
    | Middleware
    |--------------------------------------------------------------------------
    |
    | Middleware applied to all Crontinel dashboard routes. You'll almost
    | certainly want 'web' and 'auth' here, but add whatever your app needs.
    |
    */

    'middleware' => ['web', 'auth'],

    /*
    |--------------------------------------------------------------------------
    | Horizon Integration
    |--------------------------------------------------------------------------
    */

    'horizon' => [
        'enabled' => env('CRONTINEL_HORIZON', true),
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
        'depth_alert_threshold' => 1000,
        'wait_time_alert_seconds' => 300,
    ],

    /*
    |--------------------------------------------------------------------------
    | Cron / Scheduled Task Monitoring
    |--------------------------------------------------------------------------
    */

    'cron' => [
        'enabled' => true,
        'late_alert_after_seconds' => 120,
        'retain_days' => 30,
    ],

    /*
    |--------------------------------------------------------------------------
    | Alert Channels
    |--------------------------------------------------------------------------
    |
    | Supported channels: "slack", "mail", "webhook", null
    |
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
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | SaaS Connection (Optional)
    |--------------------------------------------------------------------------
    |
    | If you're using the hosted dashboard at app.crontinel.com, set your
    | API key here. Leave null to use the local dashboard only.
    |
    */

    'saas_key' => env('CRONTINEL_API_KEY'),
    'saas_url' => env('CRONTINEL_API_URL', 'https://app.crontinel.com'),

];
```

## `path`

Dashboard URL path. Default: `crontinel`

```php
'path' => env('CRONTINEL_PATH', 'crontinel'),
```

This controls where the dashboard is mounted. If you set it to `monitoring`, the dashboard lives at `yourdomain.com/monitoring`.

## `middleware`

Middleware applied to the dashboard routes. Default: `['web', 'auth']`

```php
'middleware' => ['web', 'auth'],
```

If your app uses a custom auth guard or an admin middleware, add it here. Crontinel doesn't ship its own authorization gate, so you're responsible for locking this down.

## `horizon`

Controls Horizon integration. If you don't use Horizon, set `enabled` to `false` and Crontinel won't try to connect.

```php
'horizon' => [
    'enabled' => env('CRONTINEL_HORIZON', true),
    'supervisor_alert_after_seconds' => 60,    // how long before a dead supervisor fires an alert
    'failed_jobs_per_minute_threshold' => 5,   // alert when failed rate exceeds this
    'connection' => env('CRONTINEL_HORIZON_CONNECTION', 'horizon'), // Redis connection used by Horizon
],
```

`connection` should match the connection name in your `config/horizon.php`. Most apps leave this as `horizon`. The connection name can be customized via the `CRONTINEL_HORIZON_CONNECTION` environment variable.

## `queues`

```php
'queues' => [
    'enabled' => true,
    'watch' => [],                     // specific queue names; empty = auto-discover
    'depth_alert_threshold' => 1000,   // alert when a queue exceeds this depth
    'wait_time_alert_seconds' => 300,  // alert when oldest job is older than this
],
```

When `watch` is an empty array, Crontinel auto-discovers all active queues. If you only care about specific ones, list them explicitly: `['default', 'emails', 'exports']`.

## `cron`

```php
'cron' => [
    'enabled' => true,
    'late_alert_after_seconds' => 120, // mark run as late after this many seconds
    'retain_days' => 30,               // how long to keep cron run history
],
```

`late_alert_after_seconds` is the grace period. If a scheduled task doesn't check in within this window after its expected run time, it's marked late and triggers an alert. Bump this higher if you have tasks that legitimately take a few minutes to start.

`retain_days` controls how long run history is kept in your database. Crontinel prunes old records automatically via `crontinel:prune`.

## `alerts`

Crontinel supports three alert channels: `slack`, `mail`, and `webhook`. Set the channel via `CRONTINEL_ALERT_CHANNEL` in your `.env`.

> **Note:** PagerDuty is planned for a future release. The `pagerduty` channel and `CRONTINEL_PAGERDUTY_ROUTING_KEY` env var are documented ahead of implementation.

```php
'alerts' => [
    'channel' => env('CRONTINEL_ALERT_CHANNEL'), // 'slack', 'mail', or 'webhook'

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
```

**Slack** sends a formatted message to an incoming webhook URL. Create one in your Slack workspace under Apps > Incoming Webhooks.

**Mail** uses your app's default mail driver. The `to` address receives all alerts.

**Webhook** sends a JSON POST to any URL you provide. Useful for connecting to custom internal tools, Zapier, or any HTTP endpoint that accepts JSON payloads.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `CRONTINEL_PATH` | `crontinel` | Dashboard URL path |
| `CRONTINEL_HORIZON` | `true` | Enable Horizon integration |
| `CRONTINEL_HORIZON_CONNECTION` | `horizon` | Redis connection name for Horizon |
| `CRONTINEL_ALERT_CHANNEL` | `null` | Alert channel: `slack`, `mail`, or `webhook` |
| `CRONTINEL_SLACK_WEBHOOK` | `null` | Slack incoming webhook URL |
| `CRONTINEL_ALERT_EMAIL` | `null` | Email alert recipient |
| `CRONTINEL_WEBHOOK_URL` | `null` | Custom webhook endpoint URL |
| `CRONTINEL_API_KEY` | `null` | SaaS API key (optional) |
| `CRONTINEL_API_URL` | `https://app.crontinel.com` | SaaS endpoint URL |
