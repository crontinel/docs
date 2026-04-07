---
title: Available MCP Tools
description: All tools exposed by the Crontinel MCP server
---

| Tool | Description |
|---|---|
| `list_scheduled_jobs` | List all monitored cron commands with last run status |
| `get_cron_status` | Last run details for a specific command (exit code, duration, output) |
| `get_queue_status` | Depth, failed count, and wait time for all queues or a specific queue |
| `get_horizon_status` | Horizon supervisor health snapshot (status, paused, failed/min) |
| `list_recent_alerts` | Alerts fired in the last N hours |
| `acknowledge_alert` | Dismiss an active alert by its key |

## `list_scheduled_jobs`

**Parameters:**
- `app_slug` (required) — app slug from your Crontinel dashboard

Returns all commands tracked by Crontinel for that app with their most recent status.

## `get_cron_status`

**Parameters:**
- `app_slug` (required) — app slug
- `command` (required) — command name or partial match

Returns: command name, last status, exit code, duration, started_at, output.

## `get_queue_status`

**Parameters:**
- `app_slug` (required) — app slug
- `queue` (optional) — queue name. Returns all queues if omitted.

Returns: queue name, depth, failed count, oldest job age in seconds.

## `get_horizon_status`

**Parameters:**
- `app_slug` (required) — app slug

Returns: overall status, paused indicator, supervisors list, failed jobs per minute.

## `list_recent_alerts`

**Parameters:**
- `app_slug` (required) — app slug
- `hours` (optional, default 24) — look-back window

Returns: alert key, fired_at, fire_count, resolved_at (if resolved).

## `acknowledge_alert`

**Parameters:**
- `app_slug` (required) — app slug
- `alert_key` (required) — e.g. `horizon:paused`, `queue:emails:depth`

Marks the alert as acknowledged.
