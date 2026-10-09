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

## Stable job names

Name the schedule when the command string can change, including a closure:

```php
$schedule->command('reports:send')->dailyAt('02:00')->environments('production')->name('nightly-import');
$schedule->call(function () {
    // the job
})->daily()->name('nightly-import');
```

The receipt keeps the command and also sends `job_name`, `environment` when only one environment is set, and `expression`.

List the schedule in Crontinel and set the `processed_records` minimum that means the run counted:

```bash
php artisan crontinel:schedule --minimum=1
```

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
