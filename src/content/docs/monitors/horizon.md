---
title: Horizon Monitor
description: Read Laravel Horizon supervisor status, paused queues, and worker health from inside the app, instead of checking whether a URL returns 200.
---

The Horizon monitor reads Horizon's Redis keys directly  –  the same data source the Horizon dashboard uses.

## What it monitors

| Signal | How |
|---|---|
| Overall status | The newest master in the `masters` sorted set (refreshed within the last 14 seconds), then the `status` field of its `master:<name>` hash. No fresh master means stopped |
| Per-supervisor state | Supervisors in the `supervisors` sorted set refreshed within the last 29 seconds, with each `supervisor:<name>` hash's status, processes and queues |
| Paused state | The master's status is `paused`, or a supervisor's status is `paused` |
| Failed jobs per minute | Entries in the `failed_jobs` sorted set from the last 60 seconds |

Horizon stores these keys under its own Redis prefix on the `horizon.connection` connection.

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

Crontinel compares the supervisors listed in `horizon.environments` for the current environment with the supervisors that are running. A configured supervisor that is not running for `supervisor_alert_after_seconds` is reported as down, while the master is running. Package v0.9.10 and later.

So you get an alert when the `emails` supervisor is gone while your `default` supervisor is still healthy. Supervisors are matched by name across hosts, and the check needs a cache store shared between runs (`file` or `redis`, not `array`).

## Disabling

If you don't use Horizon:

```php
'horizon' => ['enabled' => false],
```

Queue and cron monitoring continue to work independently.

## Related

- [Queue monitor](/monitors/queues/): depth and wait time for the queues Horizon feeds
- [Cron monitor](/monitors/cron/): the scheduler side of the same app
- [Alert channels](/alerts/channels/): where a supervisor-down alert goes
- [Configuration reference](/reference/configuration/): every `horizon` key and its default
- [Troubleshooting](/troubleshooting/): Horizon monitor not working
- [CLI health check](/alerts/cli/): fail a deploy when Horizon is paused or a supervisor is down
