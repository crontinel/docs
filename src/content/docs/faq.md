---
title: FAQ
description: Frequently asked questions about Crontinel.
---

## What does the free plan include?

The free plan covers up to 5 monitored cron jobs with email alerts and the local `/crontinel` dashboard. You get the same core monitoring, just with a cap on the number of jobs.

## What does Pro add?

Pro removes the job limit and adds Slack/Discord notifications, team members, and longer data retention on app.crontinel.com. Check the pricing page for the current plan details.

## Can I use Crontinel without the SaaS?

Yes. The open-source package works entirely standalone. The local dashboard at `/crontinel` runs in your own app with no external calls required. Just set `'saas' => ['enabled' => false]` in `config/crontinel.php` and you have a fully self-hosted monitoring setup.

## What data does the package send to app.crontinel.com?

When SaaS mode is enabled, each ping includes the command name, exit code, run duration, and the run timestamp. That is the full payload.

## Is my cron output or logs sent to the SaaS?

No. Command output, log messages, and exception traces are never sent to app.crontinel.com by default. All of that stays on your server.

## Does Crontinel work with Laravel Octane?

Yes. The package is compatible with Laravel Octane. Monitoring hooks attach to the scheduler, which runs in its own process outside the Octane worker lifecycle.

## Do I need Horizon?

No. Horizon is optional. If you are not using it, set `'horizon' => ['enabled' => false]` in `config/crontinel.php` to hide the Horizon panel from the dashboard.

## Which queue drivers are supported?

Any queue driver that Laravel supports will work, including database, Redis, SQS, and Beanstalkd. The package dispatches standard Laravel jobs with no driver-specific code.

## What happens to alerts if app.crontinel.com goes down?

SaaS alert delivery pauses until the service recovers. Your local `/crontinel` dashboard continues to record runs and display status regardless of SaaS availability. Pings that fail are retried on the next scheduled run.

## How often does the package ping the SaaS?

A ping fires after every scheduled command execution. There is no separate polling interval; the package hooks into the scheduler's `after` callback.

## Will I get spammed with repeated alerts?

No. Alert deduplication prevents the same alert from re-firing for 5 minutes. If a job keeps failing on a one-minute schedule, you receive one alert, then silence until the cooldown expires.

## Which versions of Laravel are supported?

Laravel 10 and above. The package relies on scheduler APIs introduced in Laravel 10.

## Which PHP versions are supported?

PHP 8.1 and above. This matches the minimum required by Laravel 10+.

## How do I remove Crontinel from my app?

Run `composer remove crontinel/crontinel`, delete the migration file from `database/migrations`, and remove `config/crontinel.php`. Standard Laravel package removal steps.

## Is the package or dashboard open source?

The core `crontinel/crontinel` package is open source under the MIT license. The SaaS dashboard at app.crontinel.com is proprietary.

## What is the MCP server?

Crontinel ships an MCP server that exposes your monitoring data to AI assistants. Tools like Claude Code can read job status, recent failures, and alert history directly through the MCP protocol.
