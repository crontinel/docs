---
title: Cron Monitor
description: "Record every scheduled command's exit code and duration, including runs that fail while the scheduler process itself stays up."
---

## From any runtime

You do not need Laravel. Post a receipt when the job ends, and [register the job](/check-in/schedule/) with its cron expression so Crontinel can alert when a run never starts. Add a `running` receipt at the start to catch a run that never finishes. See [check-in recipes](/check-in/recipes/) and [start and finish receipts](/check-in/start-finish/).

The rest of this page describes the Laravel package.

## How it works (Laravel)

Crontinel hooks into three Laravel scheduler events:

- `ScheduledTaskStarting`
- `ScheduledTaskFinished`
- `ScheduledTaskFailed`

No code changes to your `schedule()` method are needed. Every command defined there is tracked automatically after installation.

## What's recorded

| Field | Description |
|---|---|
| `command` | Artisan command name |
| `exit_code` | 0 = success, non-zero = failure |
| `duration_ms` | How long it ran |
| `output` | Captured output (if any) |
| `started_at` | Exact start timestamp |
| `status` | `completed`, `failed`, or `late` |

## Late detection

A run is marked `late` if the command didn't execute within `late_alert_after_seconds` of its expected window. This catches the case where the scheduler itself is running but a command is being skipped.

## Slow runs (SaaS)

When a job has a cron schedule monitor with a maximum runtime, a completed run that took longer opens a **cron ran too long** alert. The next run that finishes inside the limit resolves it.

If the same run already opened a **cron never finished** alert, the slow-run alert is skipped, so one overrun alerts once. Set the limit with `max_runtime_seconds` when you [register the job](/check-in/schedule/).

## Configuration

```php
'cron' => [
    'enabled' => true,
    'late_alert_after_seconds' => 120,
    'retain_days' => 30,
],
```

## Related

- [Register expected jobs](/check-in/schedule/): how a run that never starts gets detected, from any runtime
- [Start and finish receipts](/check-in/start-finish/): catch a run that starts and never ends
- [Check-in recipes](/check-in/recipes/): curl, Node, Python, Sidekiq, and GitHub Actions
- [Queue monitor](/monitors/queues/) and [Horizon monitor](/monitors/horizon/)
- [Configuration reference](/reference/configuration/): the `cron` keys above and their defaults
- [Troubleshooting](/troubleshooting/): cron runs not showing up
