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

## Configuration

```php
'cron' => [
    'enabled' => true,
    'late_alert_after_seconds' => 120,
    'retain_days' => 30,
],
```
