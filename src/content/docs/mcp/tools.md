---
title: Available MCP Tools
description: MCP tools to list scheduled jobs, read a cron run, check queue depth and Horizon, manage alerts, and save monitors and outcome rules.
---

| Tool | Description |
|---|---|
| `list_scheduled_jobs` | List the jobs Crontinel tracks (from any runtime) with last run status |
| `get_cron_status` | Last run details for a specific command (exit code, duration, output) |
| `list_runs` | Recent runs for an app, with outcome status and the AI quality grade when enabled |
| `list_deploys` | Deploy markers for an app (version, environment, commit SHA, time). Hosted MCP, needs `run:read` |
| `get_queue_status` | Laravel only. Depth, failed count, and wait time for all queues or a specific queue |
| `get_horizon_status` | Laravel only. Horizon supervisor health snapshot (status, paused, failed/min) |
| `list_recent_alerts` | Alerts fired in the last N hours |
| `acknowledge_alert` | Dismiss an active alert by its key |
| `create_alert` | Create a new alert channel (Slack, email, or webhook) for an app |
| `save_cron_schedule` | Hosted MCP, needs `monitor:write`. Create or update the schedule monitor for one command |
| `save_heartbeat` | Hosted MCP, needs `monitor:write`. Create or update a heartbeat monitor by name |
| `save_outcome_rule` | Hosted MCP, needs `monitor:write`. Create or update the evidence a run must report to count as done |

## `list_scheduled_jobs`

**Parameters:**
- `app_slug` (required)  –  app slug from your Crontinel dashboard

Returns all jobs tracked by Crontinel for that app with their most recent status. A job appears once it has sent a receipt or been [registered](/check-in/schedule/), whatever runtime runs it.

## `get_cron_status`

**Parameters:**
- `app_slug` (required)  –  app slug
- `command` (required)  –  command name or partial match

Returns: command name, last status, exit code, duration, started_at, output.

## `list_runs`

**Parameters:**
- `app_id` (required)  –  numeric app ID
- `limit` (optional, 1 to 100)  –  runs per page
- `after_id` (optional)  –  continue from `next_after_id` in the last response

Returns per run: status, exit code, duration, times, attempt, `outcome_status`, `outcome_missing_keys`, and `quality`. `outcome_status` is `passed`, `failed`, `unknown`, or null when no outcome rule applies. `unknown` means the receipt did not include the evidence named in `outcome_missing_keys`; it is not a success. `quality` is null unless the job has an [AI quality check](/mcp/ai-agent-monitoring/#quality-check-ai-optional). When set, it holds `status`, `score`, `pass_score`, `graded_at`, and `advisory: true`. Output, command arguments, and the model's reasons are not returned.

## `get_queue_status`

**Parameters:**
- `app_slug` (required)  –  app slug
- `queue` (optional)  –  queue name. Returns all queues if omitted.

Returns: queue name, depth, failed count, oldest job age in seconds. Queue data comes from the Laravel package. An app that never reports it has no queue data, which is not the same as an empty queue.

## `get_horizon_status`

**Parameters:**
- `app_slug` (required)  –  app slug

Returns: overall status, paused indicator, supervisors list, failed jobs per minute. Horizon is Laravel only. Missing data is not a stopped supervisor and not a healthy one.

## `list_recent_alerts`

**Parameters:**
- `app_slug` (required)  –  app slug
- `hours` (optional, default 24)  –  look-back window

Returns: alert key, fired_at, fire_count, resolved_at (if resolved).

## `acknowledge_alert`

**Parameters:**
- `app_slug` (required)  –  app slug
- `alert_key` (required)  –  e.g. `horizon:paused`, `queue:emails:depth`

Marks the alert as acknowledged.

## `create_alert`

:::note
Not limited to a retired “Pro or Team” gate. Supported channel types follow the account’s plan features; some types stay paid-only. Ordinary evidence reads do not spend hosted AI starts.
:::

**Parameters:**
- `app_slug` (required)  –  app slug
- `type` (required)  –  `slack`, `email`, or `webhook`
- `config` (required)  –  channel-specific config object (see below)

**Config by type:**

| type | required fields |
|---|---|
| `slack` | `webhook_url`  –  Incoming Webhook URL |
| `email` | `address`  –  recipient email address |
| `webhook` | `url`  –  endpoint URL, optionally `secret` for HMAC signing |

**Example  –  create a Slack alert:**

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

## Configuration writes (hosted MCP)

The three `save_*` tools appear only when the connection has `monitor:write`. It is never granted by default: tick it when you create an API key, or let your assistant request it over OAuth, where the consent screen says what it allows.

- The key or OAuth user needs operator access to the app. Viewers cannot write.
- Each tool creates the record or updates the one with the same key (command for schedules, name for heartbeats, command plus metric key for outcome rules). Calling it twice does not make a duplicate.
- Changes use the same checks, plan limits and audit log as the dashboard and the [Configuration API](/reference/config-api/). The audit entry shows `via: mcp`.
- Ping URLs are not returned over MCP. Copy them from the dashboard.
- Each save returns a `version`. Pass it back as `if_version` on the next save, and the save is refused if someone changed the record in between.
- Deleting monitors, muting and maintenance windows are not MCP tools. Use the dashboard or the Configuration API.

