---
title: Available MCP Tools
description: MCP tools to list scheduled jobs, read a cron run, check queue depth and Horizon, manage alerts, and save monitors and outcome rules.
---

There are two MCP servers with different tools:

- **Hosted MCP** at `https://app.crontinel.com/mcp`. Connect with OAuth or a scoped key from `/settings/ai-connections`. This is the default.
- **Legacy MCP** at `https://app.crontinel.com/api/mcp`, used by the `@crontinel/mcp-server` stdio package with an app API key. The tools act on the app the key belongs to.

## Hosted MCP tools

Every hosted tool except `get_connection` takes a numeric `app_id`. The investigation tools appear only when hosted AI investigations are enabled.

| Tool | Scope | Description |
|---|---|---|
| `get_connection` | any | The organization, app restrictions and scopes of this connection |
| `list_monitors` | `monitor:read` | Monitor status metadata for an app. Configurations and secrets are omitted |
| `list_runs` | `run:read` | Recent runs, with outcome status and the AI quality grade when enabled |
| `list_deploys` | `run:read` | Deploy markers (version, environment, commit SHA, time) |
| `list_incidents` | `incident:read` | Incident start and resolution times |
| `get_incident_evidence` | all three read scopes | A redacted evidence packet for one incident |
| `get_fix_context` | all three read scopes | An evidence packet for a coding agent |
| `check_monitoring_coverage` | all three read scopes | Saved monitors compared with the evidence actually received |
| `explain_schedule` | `monitor:read` | Validate a saved cron monitor and preview up to five upcoming starts |
| `start_investigation` | read scopes + `investigation:run` | Start a hosted AI investigation. Spends one AI start |
| `get_investigation` | all three read scopes | Status and evidence of an investigation this connection started |
| `cancel_investigation` | read scopes + `investigation:run` | Cancel a queued or running investigation |
| `save_cron_schedule` | `monitor:write` | Create or update the schedule monitor for one command |
| `save_heartbeat` | `monitor:write` | Create or update a heartbeat monitor by name |
| `save_outcome_rule` | `monitor:write` | Create or update the evidence a run must report to count as done |

## `list_runs`

**Parameters:**
- `app_id` (required)  –  numeric app ID
- `limit` (optional, 1 to 100)  –  runs per page
- `after_id` (optional)  –  continue from `next_after_id` in the last response

Returns per run: status, exit code, duration, times, attempt, `outcome_status`, `outcome_missing_keys`, and `quality`. `outcome_status` is `passed`, `failed`, `unknown`, or null when no outcome rule applies. `unknown` means the receipt did not include the evidence named in `outcome_missing_keys`; it is not a success. `quality` is null unless the job has an [AI quality check](/mcp/ai-agent-monitoring/#quality-check-ai-optional). When set, it holds `status`, `score`, `pass_score`, `graded_at`, and `advisory: true`. Output, command arguments, and the model's reasons are not returned.

## Configuration writes (hosted MCP)

The three `save_*` tools appear only when the connection has `monitor:write`. It is never granted by default: tick it when you create an API key, or let your assistant request it over OAuth, where the consent screen says what it allows.

- The key or OAuth user needs operator access to the app. Viewers cannot write.
- Each tool creates the record or updates the one with the same key (command for schedules, name for heartbeats, command plus metric key for outcome rules). Calling it twice does not make a duplicate.
- Changes use the same checks, plan limits and audit log as the dashboard and the [Configuration API](/reference/config-api/). The audit entry shows `via: mcp`.
- Ping URLs are not returned over MCP. Copy them from the dashboard.
- Each save returns a `version`. Pass it back as `if_version` on the next save, and the save is refused if someone changed the record in between.
- Deleting monitors, muting and maintenance windows are not MCP tools. Use the dashboard or the Configuration API.

## Legacy MCP tools

| Tool | Description |
|---|---|
| `list_scheduled_jobs` | Commands that have reported runs, with their last run status |
| `get_cron_status` | Last run details for a command (exit code, duration, output) |
| `get_queue_status` | Laravel only. Depth, failed count, and oldest job age per queue |
| `get_horizon_status` | Laravel only. Horizon status, paused flag, supervisors, failed jobs per minute |
| `list_recent_alerts` | Alerts fired in the last N hours |
| `acknowledge_alert` | Resolve an active alert by its key |
| `create_alert` | Create an alert channel for the app |

## `list_scheduled_jobs`

No parameters. Returns the commands that have reported runs for the key's app, with their most recent status.

## `get_cron_status`

**Parameters:**
- `command` (required)  –  command name or partial match

Returns: command, status, exit code, duration, started_at, finished_at, output.

## `get_queue_status`

**Parameters:**
- `queue` (optional)  –  queue name. Returns all queues if omitted.

Returns: queue name, depth, failed count, oldest job age in seconds. Queue data comes from the Laravel package. An app that never reports it has no queue data, which is not the same as an empty queue.

## `get_horizon_status`

No parameters. Returns: overall status, paused indicator, supervisors list, failed jobs per minute. Horizon is Laravel only. Missing data is not a stopped supervisor and not a healthy one.

## `list_recent_alerts`

**Parameters:**
- `hours` (optional, default 24)  –  look-back window

Returns: alert key, state (`firing` or `resolved`), fired_at, fire_count, resolved_at.

## `acknowledge_alert`

**Parameters:**
- `alert_key` (required)  –  the key from `list_recent_alerts`

Marks the alert as resolved. It is not the same as acknowledging in the dashboard: the alert closes, and it opens as a new alert if the condition fires again.

## `create_alert`

**Parameters:**
- `type` (required)  –  `slack`, `email`, `webhook`, `discord`, `teams`, `telegram`, `pagerduty`, `sms`, or `opsgenie`
- One set of fields for the type, passed at the top level:

| type | required fields |
|---|---|
| `slack`, `discord`, `teams` | `webhook_url` |
| `email` | `to` |
| `webhook` | `url` |
| `telegram` | `bot_token` and `chat_id` |
| `pagerduty` | `routing_key` |
| `sms` | `phone_number` (E.164, such as `+15551234567`) |
| `opsgenie` | `api_key` |

`pagerduty`, `sms`, and `opsgenie` need a paid plan.

**Example  –  create a Slack alert:**

```json
{
  "type": "slack",
  "webhook_url": "https://hooks.slack.com/services/T000/B000/xxxx"
}
```

Returns `created`, `channel_id`, and `type` on success.
