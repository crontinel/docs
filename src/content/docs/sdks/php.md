---
title: PHP
description: Prefer the HTTP check-in recipes or the Laravel package. crontinel/php is not a supported outcome-receipt path until it has a maintenance owner.
---

import { Aside } from '@astrojs/starlight/components';

<Aside type="caution">
For outcome monitoring, use the [HTTP check-in recipes](/check-in/recipes/). This language package is **not** a supported path for the current offer until it sends the outcome receipt and has a maintenance owner. Prefer curl, Node `fetch`, `outcome_checkin.py`, Sidekiq/`Net::HTTP`, or GitHub Actions.
</Aside>

## Quickstart

Historical package install steps below. Prefer [check-in recipes](/check-in/recipes/) for new setups.

Get from zero to your first data in under 3 minutes.

### 1. Prerequisites

- PHP 8.1+
- A Crontinel account ([sign up free](https://app.crontinel.com/register))
- An app created in the dashboard
- Your API key (`crn_live_...`) from app settings

### 2. Install

```bash
composer require crontinel/php
```

### 3. Configure

Create a `quickstart.php` file:

```php
<?php
require 'vendor/autoload.php';

$crontinel = new \Crontinel\Client(getenv('CRONTINEL_API_KEY'));

$crontinel->scheduleRun([
    'command' => 'hello-from-php',
    'duration_ms' => 100,
    'exit_code' => 0,
]);

echo "Data sent to Crontinel!\n";
```

Set your API key and run it:

```bash
export CRONTINEL_API_KEY=crn_live_xxxxxxxxxxxx
php quickstart.php
```

### 4. Dashboard verification

1. Go to [app.crontinel.com](https://app.crontinel.com) → **Apps** → your app
2. Check the **Cron** section — you should see the `hello-from-php` job with exit code `0` and `100ms` duration
3. Your first data is on the dashboard!

<Aside>
If the cron section shows "no data yet", give it a few seconds and refresh. The API ingests data in near-real-time.
</Aside>

---

## Requirements

- PHP 8.1+

## Install

```bash
composer require crontinel/php
```

## Quick Start

```php
<?php
require 'vendor/autoload.php';

$crontinel = new \Crontinel\Client(getenv('CRONTINEL_API_KEY'));

// Report a cron job run
$crontinel->scheduleRun([
    'command' => 'reports:generate',
    'duration_ms' => 2340,
    'exit_code' => 0,
]);

// Report queue worker activity
$crontinel->queueProcessed([
    'queue' => 'emails',
    'processed' => 12,
    'failed' => 0,
    'duration_ms' => 8901,
]);
```

## `monitorSchedule`

Wrap any callable and auto-report outcome:

```php
$result = $crontinel->monitorSchedule('reports:generate', function () {
    return generateDailyReports();
});
// ['result' => ..., 'duration_ms' => 1840, 'exit_code' => 0]
```

## Symfony Messenger integration

```php
$crontinel->wrap(function (array $payload) use ($handler) {
    $start = microtime(true) * 1000;
    try {
        $result = $handler($payload);
        $crontinel->queueProcessed([
            'queue' => 'default', 'processed' => 1, 'failed' => 0,
            'duration_ms' => (int)(microtime(true) * 1000 - $start),
        ]);
        return $result;
    } catch (\Throwable $e) {
        $crontinel->queueProcessed([
            'queue' => 'default', 'processed' => 0, 'failed' => 1,
            'duration_ms' => (int)(microtime(true) * 1000 - $start),
        ]);
        throw $e;
    }
});
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `CRONTINEL_API_KEY` | — | Your Crontinel API key (required) |
| `CRONTINEL_API_URL` | `https://app.crontinel.com` | SaaS or self-hosted endpoint |

## Laravel

For Laravel, use [`crontinel/laravel`](https://github.com/crontinel/laravel) instead — it auto-instruments Horizon, the scheduler, and queue workers with zero code changes.
