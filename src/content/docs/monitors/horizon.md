---
title: Horizon Monitor
description: Monitoring Laravel Horizon internals with Crontinel
---

The Horizon monitor reads Horizon's Redis keys directly  –  the same data source the Horizon dashboard uses.

## What it monitors

| Signal | How |
|---|---|
| Overall status | `horizon:status` Redis key |
| Per-supervisor state | `horizon:{id}:supervisor` heartbeat timestamp |
| Paused state | `horizon:status` = `paused` |
| Failed jobs per minute | `horizon:{id}:{queue}:throughput` buckets |

## Configuration

```php
// config/crontinel.php
'horizon' => [
    'enabled' => true,
    'supervisor_alert_after_seconds' => 60,
    'failed_jobs_per_minute_threshold' => 5,
    'connection' => 'horizon', // Redis connection used by Horizon
],
```

## What "supervisor down" means

Crontinel tracks each supervisor separately via its heartbeat. If a supervisor's `lastHeartbeat` is more than `supervisor_alert_after_seconds` old, Crontinel considers it down  –  even if the top-level `horizon:status` key still says `running`.

This is the key difference from generic monitors: you get an alert for a supervisor crash in the `emails` queue while your `default` queue supervisor is still healthy.

## Disabling

If you don't use Horizon:

```php
'horizon' => ['enabled' => false],
```

Queue and cron monitoring continue to work independently.
