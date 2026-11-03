---
title: Laravel
description: Deep Laravel package for schedule attach, queue depth, and Horizon. Outcome receipts still use the same HTTP body as every other runtime.
---

Not on Laravel? Post the [HTTP check-in](/check-in/recipes/) from curl, Node, Python, Sidekiq, or GitHub Actions. You do not need this package.

## Requirements

- PHP 8.2+
- Laravel 11, 12, or 13
- Composer 2+

## Install

```bash
composer require crontinel/laravel
php artisan crontinel:install
```

`crontinel:install` publishes the config and runs the package migration. Visit `/crontinel` for the local dashboard.

For hosted monitoring, set:

```env
CRONTINEL_API_KEY=your-app-ingest-key
CRONTINEL_API_URL=https://app.crontinel.com
```

That key is the app ingest key. It is not an MCP / assistant key.

## Business result

Exit code 0 means the process finished. It does not mean the work happened. Record the count or artifact time inside the job. The package sends that on the terminal receipt and omits it when you record nothing. A monitoring error does not fail the job.

```php
use Crontinel\Outcome;

Outcome::metric('processed_records', $count);
Outcome::timestamp('latest_artifact', $backup->toIso8601String());
```

Zero is a real value. Background tasks need `CRONTINEL_BACKGROUND_CORRELATION=true` so the count survives the child process.

An AI agent job can report its spend the same way. The hosted app checks `tokens_used`, `cost_usd` and `tool_calls` against an agent ceiling:

```php
Outcome::metric('tokens_used', $usage->totalTokens);
Outcome::metric('cost_usd', 0.42);
Outcome::metric('tool_calls', 17);
```

## Run output

Requires `crontinel/laravel` 0.9.0 or later. A successful run sends no output unless you choose to. Set the text for the run:

```php
Outcome::output('Sent 42 invoices, skipped 3 with no email.');
```

It goes on the terminal receipt only and is cut to the first 10,000 characters. A failed run keeps the exception message and adds this text after it. Background tasks need `CRONTINEL_BACKGROUND_CORRELATION=true` for it, the same as metrics.

To send the task's output file instead, set `CRONTINEL_CAPTURE_OUTPUT=true` (`crontinel.cron.capture_output`) and give the task a file with `sendOutputTo()`, `appendOutputTo()` or `storeOutput()`:

```php
$schedule->command('reports:send')->daily()->storeOutput();
```

At the end of the run the package reads the last 10,000 characters of that file and sends them, for `runInBackground()` tasks too. `Outcome::output()` wins when both are set. A missing or unreadable file sends the receipt without output. With `appendOutputTo()` the tail can include earlier runs.

Capture is off by default because command output can hold customer data or secrets. Turn it on only where you are fine storing that output in Crontinel.

The hosted AI quality check grades this output. It is opt-in per job in the hosted app; sending output does not turn it on.

## Stable job names

Name the schedule when the command string can change, including a closure:

```php
$schedule->command('reports:send')->dailyAt('02:00')->environments('production')->name('nightly-import');
$schedule->call(function () {
    // the job
})->daily()->name('nightly-import');
```

The receipt keeps the command and also sends `job_name`, `environment` when only one environment is set, and `expression`.

Name the schedule in Crontinel and set the `processed_records` minimum that means the run counted:

```bash
php artisan crontinel:schedule --minimum=1
```

From v0.9.2 this also turns on missed-run alerts: each task's cron expression and timezone (the task's own, else `app.schedule_timezone`, else `app.timezone`) are stored, and a run that doesn't start on time alerts. Run it again after you change the schedule or upgrade from an earlier version. Crontinel's own `crontinel:report` task is not listed or reported as a run.

## Horizon and queues

Horizon supervisor freshness and queue depth are Laravel-only evidence. Outside Laravel, absence of a snapshot is normal, not an incident. See the [Horizon](/monitors/horizon/) and [queues](/monitors/queues/) pages.

## Optional command agent

The package can run an allowlisted cloud-triggered agent. Outcome monitoring does not require it.

```bash
php artisan crontinel:agent
```

See the [Agent Guide](/agent/guide/).

## Configuration

Review `config/crontinel.php` after install. Full options: [configuration reference](/reference/configuration).
