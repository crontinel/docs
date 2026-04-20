---
title: PHP
description: Install and configure crontinel/php for any PHP application
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
