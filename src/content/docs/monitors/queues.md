---
title: Queue Monitor
description: Monitoring queue depths, failed counts, and wait times
---

## What it monitors

- **Depth** — number of pending jobs in each queue
- **Failed count** — jobs in the failed jobs table or dead-letter list
- **Oldest job age** — how long the oldest waiting job has been sitting

## Supported drivers

- `redis` — queries queue lengths from Redis directly
- `database` — queries the `jobs` and `failed_jobs` tables

## Configuration

```php
'queues' => [
    'enabled' => true,
    'watch' => [],                    // empty = auto-discover all queues
    'depth_alert_threshold' => 1000,
    'wait_time_alert_seconds' => 300,
],
```

To watch specific queues only:

```php
'watch' => ['default', 'emails', 'notifications'],
```

## Alert conditions

An alert fires when any watched queue exceeds `depth_alert_threshold` jobs or `wait_time_alert_seconds` wait time. The alert auto-resolves when the queue drains.

## Per-app queue thresholds (SaaS)

On [Crontinel SaaS](https://app.crontinel.com), you can override the depth threshold per app and per queue from the app settings page. This is useful when different apps have naturally different queue volumes.

The lookup order for thresholds is:
1. Per-queue override (`queue_thresholds.{queue_name}`)
2. Per-app default (`queue_thresholds.default`)
3. Global config value (`depth_alert_threshold`, default 1000)
