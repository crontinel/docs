---
title: CLI Health Check
description: "Run php artisan crontinel:check in CI or from an external monitor so a failed cron or a stalled queue fails the pipeline."
---

```bash
php artisan crontinel:check
```

Prints a table of all monitor statuses and exits:
- `0`  –  all monitors healthy
- `1`  –  one or more alerts active

## JSON output

```bash
php artisan crontinel:check --format=json
```

Returns an object with four keys:

- `horizon`: the Horizon status, or `null` when Horizon monitoring is off
- `missing_supervisors`: configured Horizon supervisors that are not running
- `queues`: one entry per watched queue
- `crons`: one entry per scheduled command

The exit code is the same as the table output. There is no overall `status` key; use the exit code.

## CI/CD usage

```yaml
# GitHub Actions
- name: Check job health
  run: php artisan crontinel:check --format=json
```

```bash
# Deploy script
php artisan crontinel:check || echo "Warning: monitors unhealthy after deploy"
```

## No-alert mode

By default the command also evaluates and sends [local alerts](/alerts/channels/). Run the check without firing alerts (useful for health endpoints):

```bash
php artisan crontinel:check --no-alerts
```

## What the check covers

The command reads the same three monitors as the dashboard: Horizon (running, paused, failed jobs per minute, missing supervisors), each watched queue (depth against its threshold), and the latest run of each scheduled command (exit code, late). A pipeline can print the JSON output when the exit code is `1`.

`crontinel:check` ships with the [Laravel package](/sdks/laravel/) and needs `php artisan`. If your job runs in another runtime, use an [HTTP check-in](/check-in/recipes/) and [register the schedule](/check-in/schedule/) instead; the hosted app does the alerting.

## Related

- [Alert channels](/alerts/channels/) for where fired alerts are sent
- [Cron monitor](/monitors/cron/), [queue monitor](/monitors/queues/), and [Horizon monitor](/monitors/horizon/) for the thresholds behind each status
- [Configuration reference](/reference/configuration/) for every threshold key
- [Troubleshooting](/troubleshooting/) if the command exits `1` and you do not know why
