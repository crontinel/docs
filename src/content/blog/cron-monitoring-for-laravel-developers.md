---
title: "What is Cron Monitoring and Why Laravel Developers Need It"
description: "Cron monitoring tracks your scheduled Laravel tasks so failures don't silently break your app at 3 AM. Here's what it does and how to set it up."
date: 2026-04-11
tags: ["laravel", "cron", "monitoring"]
---

If you run a Laravel application, you almost certainly have scheduled tasks. Cleanup jobs, report generation, email reminders, invoice processing — things that need to run on a cadence whether anyone is watching or not. Laravel's scheduler makes this straightforward to set up. What it doesn't make straightforward is knowing when something goes wrong.

That silence is the problem. A cron job that fails does not send a Slack message. It does not page your on-call engineer. It simply does not run, and your application slowly degrades in ways that are hard to notice until a user complains. Cron monitoring exists to solve this.

## What is Cron Monitoring?

Cron monitoring is the practice of tracking whether your scheduled tasks executed, whether they succeeded, and how long they took. It sits between your Laravel scheduler and your operations team, turning silent failures into actionable alerts.

The most basic form of cron monitoring is a heartbeat: a service that expects a ping from your scheduler on a regular schedule, and alerts you when the ping does not arrive. More sophisticated implementations track individual task outcomes, capture execution logs, measure run duration, and alert based on thresholds you define.

Without monitoring, you rely on users to discover problems. With monitoring, you discover them yourself — ideally before they affect anyone.

## How Laravel's Scheduler Works (and Where It Hides Failures)

Laravel's scheduler runs via a single cron entry that fires `schedule:run` every minute. That command looks at your `App\Console\Kernel` schedule, determines which tasks are due, and executes them.

```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    $schedule->command('invoices:process')->dailyAt('03:00');
    $schedule->command('reports:generate')->everyHour();
    $schedule->job(new SendReminderEmails)->dailyAt('09:00');
}
```

The default behavior is to run each task and discard the output. If the task succeeds, nothing is logged. If it fails with an uncaught exception, Laravel writes to `storage/logs/` — but only if the task actually started. If the cron daemon itself is not running, or if `schedule:run` crashes before reaching your task, you get no log entry at all.

This is the failure mode that catches most developers off guard. The scheduler looks healthy because it runs every minute. The individual tasks look healthy because Laravel does not complain. The app slowly stops doing the things it is supposed to do, and no one notices until the next business day.

## What Cron Monitoring Actually Tracks

A good cron monitoring setup gives you visibility into three things: task execution, task outcome, and task duration.

**Execution** — Did the task run at all? This catches the silent failures: cron daemon dead, `schedule:run` crashing, the server being rebooted mid-schedule. You want to know within minutes if your scheduler has not fired.

**Outcome** — Did the task succeed or fail? This catches runtime errors, non-zero exit codes, and uncaught exceptions. A task that runs but produces wrong results is also a failure, though that requires application-level checks.

**Duration** — How long did the task take? If a task that normally takes 30 seconds suddenly takes 20 minutes, something is wrong. It might be a slow database query, an external API hanging, or a resource constraint. Duration tracking helps you catch degradation before it becomes a failure.

Crontinel records each run's exit code and duration, and alerts when a task fails or misses its schedule. Hosted alerts go to the channels you add in the Crontinel app, such as Slack, a webhook, or PagerDuty on paid plans.

## Common Causes of Silent Cron Failures in Laravel

Understanding why crons fail silently helps you appreciate why monitoring matters. Here are the most common reasons.

**The cron daemon is not running.** This is more common than developers expect. A server reboot, a misconfigured systemd timer, or an accidental `crontab -r` can disable your scheduler without anyone noticing until the morning after.

**The PHP binary path changed.** If your cron uses `/usr/bin/php` and you updated PHP to `/usr/local/bin/php`, `schedule:run` will fail immediately with no output. The cron entry looks fine. Nothing runs.

**The working directory is wrong.** Cron jobs run from the user's home directory by default. If your scheduler expects to be run from `/var/www/html`, paths will break silently.

**The scheduler exited early.** If `schedule:run` encounters a fatal error — a missing autoloader, a PHP version mismatch, a missing .env key — it exits without running any tasks. The cron fires every minute and produces nothing.

**Tasks run but exceptions are swallowed.** Laravel's scheduler catches exceptions from scheduled commands in production mode and logs them. But "logs them" means writing to `storage/logs/`, which is not the same as alerting someone. If no one looks at the logs, no one knows.

## Setting Up Laravel Cron Monitoring with Crontinel

Crontinel installs into your Laravel app and begins reading from the scheduler's internal event system. Tasks that fire through `schedule:run` are tracked automatically.

```bash
composer require crontinel/laravel
php artisan crontinel:install
```

The installer publishes a config file and runs the necessary migrations. After installation, the Crontinel dashboard at `/crontinel` shows every scheduled task your app knows about.

To report runs to Crontinel, add your app's API key to `.env`:

```bash
CRONTINEL_API_KEY=your-app-key
```

Each run is then sent to Crontinel when it finishes. To get an alert when a task does not run on time, register your schedule with Crontinel:

```bash
php artisan crontinel:schedule
```

This lists your scheduled tasks and sends them to Crontinel, which turns on missed-run alerts for them. The cron settings in `config/crontinel.php`:

```php
// config/crontinel.php
'cron' => [
    'enabled' => true,
    'background_correlation' => env('CRONTINEL_BACKGROUND_CORRELATION', false),
    'capture_output' => env('CRONTINEL_CAPTURE_OUTPUT', false),
    'late_alert_after_seconds' => 120,
    'retain_days' => 30,
],
```

## Alerting That Actually Reaches You

Monitoring without alerting is just a dashboard. With an API key set, a failed run raises an alert in Crontinel as soon as the run is reported. A task that misses its schedule raises a missed-run alert once you have run `crontinel:schedule`.

The package can also alert on its own, without the hosted app. Pick a channel (`mail`, `slack` or `webhook`) and schedule `crontinel:check`, which checks for failed and late tasks:

```bash
CRONTINEL_ALERT_CHANNEL=slack
CRONTINEL_SLACK_WEBHOOK=https://hooks.slack.com/services/...
```

```php
// routes/console.php
Schedule::command('crontinel:check')->everyMinute();
```

## Why Laravel Developers Specifically Need This

Generic uptime monitoring catches server-down scenarios. Log aggregation catches errors that produce output. But the Laravel scheduler's silent failures sit in a gap those tools do not cover.

A scheduled task that does not fire does not produce logs. A `schedule:run` that crashes produces a single line at most. The failure is structural, not behavioral — the system is working correctly except for the part that matters most.

Laravel's queue system (Horizon) has its own monitoring because its failures are visible to developers who have been burned by silent queue failures. The scheduler deserves the same treatment. If you are running scheduled tasks in production, you need to know when they do not run, when they fail, and when they slow down.

## Getting Started

The [quick start guide](/quick-start/) walks through installation and first alert in under five minutes. If you already use Laravel Horizon, Crontinel shares your Redis connection and starts monitoring immediately after installation.

Your scheduler has been running silently in the background this whole time. It is time to give it a voice.

[Start monitoring your Laravel cron jobs →](/quick-start/)