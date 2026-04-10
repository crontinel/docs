---
title: FAQ
description: "Common questions about Crontinel: installation, plans, data privacy, supported versions, and more."
---

## What does the free plan include?

The free plan gives you the local dashboard at `/crontinel` with full cron, queue, and Horizon monitoring, all running inside your own app. You can also connect to app.crontinel.com with basic history and a limited number of monitored jobs. Check the [pricing page](https://crontinel.com/pricing) for the current job limit, since it changes during early access. So, for small projects or solo developers, the free tier is often all you need.

## What does Pro add?

Pro removes the job limit and extends history retention on the SaaS. You also get Slack, email, PagerDuty, and webhook alert channels through the hosted dashboard, team member access, and per-app threshold overrides. The OSS package itself doesn't change between plans. Pro is about the hosted features on top of what the package already does locally.

## Can I use Crontinel without the SaaS?

Yes, the open-source package works entirely standalone. Install it, run the migrations, and you get a full monitoring dashboard at `/crontinel` (configurable via the `CRONTINEL_PATH` env variable) in your own app. No account, no API key, no external calls. Set `'api_key' => null` in `config/crontinel.php` (or just don't set `CRONTINEL_API_KEY`) and it stays fully local:

```php
// config/crontinel.php
'api_key' => env('CRONTINEL_API_KEY', null),
```

The SaaS at app.crontinel.com is optional. It adds hosted history, multi-app dashboards, team access, and managed alert routing, but none of that is required for core monitoring to work.

## What data does the package send to app.crontinel.com?

When SaaS mode is active, each scheduler event sends the command name, exit code, run duration, and the run timestamp. That's it. No environment variables, no database contents, no application code. The payload is small and intentionally narrow.

## Is my cron output or logs sent to the SaaS?

No. Command output and log messages stay on your server. The SaaS never receives stdout, stderr, exception traces, or any log data. If you want to inspect command output, you'll find it in the local dashboard's cron run detail view.

## Does Crontinel work with Laravel Octane?

Yes. The package attaches to the Laravel scheduler, which runs in its own process outside the Octane worker pool. Octane workers handle incoming HTTP requests; the scheduler runs separately via `php artisan schedule:run` on a system cron. There's no conflict, so you don't need to change anything about your Octane setup.

## Do I need Horizon?

No. Horizon is completely optional. If you're not using it, set `'enabled' => false` in the Horizon section of `config/crontinel.php` and the Horizon panel won't show up in the dashboard at all:

```php
'horizon' => [
    'enabled' => false,
],
```

Queue and cron monitoring work independently of Horizon. You only need it if you want supervisor-level health data, like detecting when a specific supervisor crashes while others stay running.

## Which queue drivers are supported?

The queue monitor works with `redis` and `database` drivers. It reads queue depths directly from Redis or queries the `jobs` and `failed_jobs` tables. If your `QUEUE_CONNECTION` is `sync`, there's nothing to monitor because jobs run inline. SQS and other drivers aren't supported for depth monitoring, though the cron monitor works regardless of queue driver.

## What happens to alerts if app.crontinel.com goes down?

Your local `/crontinel` dashboard keeps running regardless. It records every scheduler run and queue depth reading from your own database, so you don't lose monitoring data during a SaaS outage. Alert delivery via the SaaS pauses until the service recovers. Pings that fail during an outage are retried on the next scheduler tick, so you won't have gaps in your history once the service comes back. You can also run `php artisan crontinel:check` in your deploy pipeline or a separate cron: it exits 0 when everything is healthy and 1 when alerts are active, so you have a local health check that doesn't depend on the SaaS at all.

## How often does the package ping the SaaS?

A ping fires after every scheduled command execution. There's no separate polling loop. The package attaches to Laravel's `ScheduledTaskFinished` and `ScheduledTaskFailed` events, so a ping goes out each time the scheduler finishes running a command. On a one-minute scheduler interval with five commands registered, you'd get five pings per minute.

## Will I get spammed with repeated alerts?

No. Crontinel deduplicates alerts with a 5-minute cooldown window. If a queue stays above its depth threshold all morning, you get one Slack message when it first fires, then silence until the cooldown expires. The alert fires again if the condition is still active after 5 minutes. Clear signal, no noise.

When the condition clears, Crontinel sends a resolved notification. So you'll see a "firing" message and then a "resolved" message for each incident, not a stream of repeated fires.

## Which versions of Laravel are supported?

Crontinel supports Laravel 11, 12, and 13. It relies on scheduler event APIs that shipped in Laravel 11, so older versions won't work. If you're on Laravel 10 and can't upgrade yet, you'll need to wait or run the local dashboard without the scheduler event tracking.

## Which PHP versions are supported?

PHP 8.2, 8.3, and 8.4 are supported. This matches the minimum PHP version required by Laravel 11. If you're running PHP 8.1, you'll need to upgrade before installing the package.

## How do I remove Crontinel from my app?

The fix is simple. Roll back the migrations first, then remove the package:

```bash
php artisan migrate:rollback
composer remove crontinel/laravel
```

After that, delete `config/crontinel.php` and any published migration files from `database/migrations`. There's nothing left in your app after those steps.

## Is the package or dashboard open source?

The `crontinel/laravel` package is MIT licensed and fully open source. The SaaS dashboard at app.crontinel.com is proprietary. You can self-host the full backend by following the [self-hosting guide](/self-hosting/), but the source for the hosted SaaS isn't public.

## What is the MCP server?

Crontinel ships an optional `@crontinel/mcp-server` npm package that exposes your monitoring data to AI coding assistants. With it installed, Claude Code (or any MCP-compatible assistant) can answer questions like "did my cron jobs run last night?" or "what's the queue depth right now?" inline in your chat, without opening the dashboard. It proxies tool calls to `app.crontinel.com/api/mcp` using your API key. See the [MCP setup guide](/mcp/claude-code/) for configuration details.
