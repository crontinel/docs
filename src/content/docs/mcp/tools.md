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
| `create_alert` | Create a new alert channel (Slack, email, or webhook) for an app |

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

## `create_alert`

:::note
Requires a **Pro or Team plan**. Returns an error on free accounts.
:::

**Parameters:**
- `app_slug` (required) — app slug
- `type` (required) — `slack`, `email`, or `webhook`
- `config` (required) — channel-specific config object (see below)

**Config by type:**

| type | required fields |
|---|---|
| `slack` | `webhook_url` — Incoming Webhook URL |
| `email` | `address` — recipient email address |
| `webhook` | `url` — endpoint URL, optionally `secret` for HMAC signing |

**Example — create a Slack alert:**

```json
{
  "app_slug": "my-app",
  "type": "slack",
  "config": {
    "webhook_url": "https://hooks.slack.com/services/T000/B000/xxxx"
  }
}
```

Returns the new alert channel ID on success.
