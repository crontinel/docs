---
title: Queue Monitor
description: Watch Laravel queue depth, failed jobs, and wait time, and see when a queue climbs or a worker stops processing new jobs.
---

## What it monitors

- **Depth**  –  number of pending jobs in each queue
- **Failed count**  –  rows for that queue in Laravel's `failed_jobs` table
- **Oldest job age**  –  how long the oldest waiting job has been sitting

## Supported drivers

- `redis`  –  queries queue lengths from Redis directly
- `database`  –  queries the `jobs` and `failed_jobs` tables

## Configuration

```php
'queues' => [
    'enabled' => true,
    'watch' => [],                    // empty = auto-discover all queues
    'connections' => [],              // queues on other connections (v0.9.9+)
    'depth_alert_threshold' => 1000,
    'wait_time_alert_seconds' => 300,
],
```

To watch specific queues only:

```php
'watch' => ['default', 'emails', 'notifications'],
```

From package v0.9.9, `queues.connections` reports queues on connections other than the default one, as `['connection' => ['queue', ...]]`. An empty list for a connection discovers its queues. These queues are reported as `connection:queue`. See the [configuration reference](/reference/configuration/#queuesconnections).

## Alert conditions

In the package, `depth_alert_threshold` and `wait_time_alert_seconds` drive local alerts only, which are sent when `crontinel:check` runs. They are not sent to the hosted app; the hosted app uses the per-app settings below.

## Per-app queue thresholds (SaaS)

On [Crontinel SaaS](https://app.crontinel.com), the app settings page has one depth setting, **Queue depth (jobs)**, default 1000. It applies to every queue in that app.

The same settings page has three optional thresholds. Each is off while blank, so an app gets no new alerts until you set one.

| Setting | Alerts when |
|---|---|
| Oldest job age (seconds) | The oldest waiting job in any queue is older than this |
| Failed jobs (count) | A queue's failed job count is above this |
| Horizon failures per minute | Horizon's failed jobs per minute is above this |

Each alert resolves when the value drops back under its threshold. Queue and Horizon numbers come from the Laravel package.

## Related

- [Horizon monitor](/monitors/horizon/): supervisor and paused-state checks for Horizon-managed queues
- [Cron monitor](/monitors/cron/): scheduled commands that dispatch the jobs
- [Alert channels](/alerts/channels/): where a depth or wait-time alert goes
- [Configuration reference](/reference/configuration/): every `queues` key and its default
- [Billing and plans](/billing/): hosted ingest allowances
- [Troubleshooting](/troubleshooting/): queue monitor showing no data
