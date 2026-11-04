---
title: Configuration API
description: Manage cron schedules, heartbeats, outcome rules, quality checks, mutes, escalation and maintenance windows over REST with a scoped key.
---

The configuration API manages the same records as the dashboard. Both go through one service, so validation, plan limits, roles and audit entries are identical. A schedule created by `PUT` looks the same as one added on the Cron schedules page.

Base URL: `https://app.crontinel.com/api/v1/apps/{slug}`, where `{slug}` is the app's slug from [`GET /apps`](/reference/api/#get-apps).

## Keys and scopes

The app ingest key can't call these endpoints. Create a scoped key in the app under **Settings > AI connections** (`/settings/ai-connections`):

1. Name the key, pick the organization and the apps it may touch.
2. Tick `monitor:read` to list and get. Tick `monitor:write` to create, update, delete and mute. `monitor:write` starts unticked.
3. Copy the `ct_mcp_...` secret. It's shown once. Keys expire after at most 90 days.

```bash
export CRONTINEL_KEY=ct_mcp_...
```

What a key can do is the intersection of:

- its scopes (`GET` needs `monitor:read`, every other method needs `monitor:write`)
- the apps you picked (other apps return 404)
- the key owner's current role on the app (viewers can read but not write)
- the organization's plan limits

Every write is audit-logged with the key owner as the actor, plus `via: api_key` and the key's grant id.

## Upsert semantics

`PUT` on a collection creates or updates by a stable key. Send the same body twice and you get one record: `201` the first time, `200` after that. Fields you leave out go back to their defaults (for example `tags` becomes empty and `enabled` becomes `true`), so `PUT` the full definition each time.

| Resource | Stable key |
|---|---|
| Cron schedule | `command` |
| Heartbeat | `name` |
| Outcome rule | `command`, `job_name`, `environment`, `expression`, `key`, `kind` |
| Quality check | `command`, `job_name`, `environment`, `expression` |

`PATCH` on one record changes only the fields you send. Renaming a record onto a stable key that another record already uses returns `409`.

## Avoiding lost updates

Every record in a response has a `version`. It changes whenever the record changes. To make sure you don't overwrite someone else's edit, send the version you read back as `if_version` on `PUT` or `PATCH`:

```bash
curl -X PATCH "$CRONTINEL_URL/api/v1/apps/billing/cron-schedules/42" \
  -H "Authorization: Bearer $CRONTINEL_KEY" -H "Content-Type: application/json" \
  -d '{"grace_seconds": 600, "if_version": "3f9c2a1b7d6e4c08"}'
```

If the record changed since that read, the request returns `409` `conflict` and nothing is saved. Read it again and retry with the new version. Leave `if_version` out and the last write wins. The escalation policy has one `version` for all its steps. Deletes and mutes don't check versions.

Changing a cron schedule's command, expression or time zone restarts monitoring at that moment, the same as adding a new schedule. Earlier occurrences aren't checked.

The dashboard follows the same rule: adding a schedule or outcome rule whose stable key already exists updates it.

## Cron schedules

| Method and path | Scope |
|---|---|
| `GET /cron-schedules?tag=` | `monitor:read` |
| `PUT /cron-schedules` | `monitor:write` |
| `GET /cron-schedules/{id}` | `monitor:read` |
| `PATCH /cron-schedules/{id}` | `monitor:write` |
| `DELETE /cron-schedules/{id}` | `monitor:write` |
| `POST /cron-schedules/{id}/ping-token` | `monitor:write` |

| Field | Required | Notes |
|---|---|---|
| `command` | yes | The exact command your runs report, up to 255 characters |
| `expression` | yes | Five-field cron expression |
| `timezone` | yes | IANA name, for example `UTC` or `Europe/Berlin` |
| `grace_seconds` | yes | 0 to 86400. How late a start may be |
| `max_runtime_seconds` | yes | 60 to 604800 |
| `enabled` | no | Default `true` |
| `tags` | no | See [Tags](#tags) |

```bash
curl -fsS -X PUT https://app.crontinel.com/api/v1/apps/billing/cron-schedules \
  -H "Authorization: Bearer $CRONTINEL_KEY" -H "Content-Type: application/json" \
  -d '{"command":"reports:send","expression":"0 6 * * *","timezone":"UTC",
       "grace_seconds":300,"max_runtime_seconds":3600,"tags":["billing","nightly"]}'
```

```json
{
  "data": {
    "id": 42,
    "command": "reports:send",
    "expression": "0 6 * * *",
    "timezone": "UTC",
    "grace_seconds": 300,
    "max_runtime_seconds": 3600,
    "enabled": true,
    "tags": ["billing", "nightly"],
    "status": "unknown",
    "muted_until": null,
    "last_checked_at": null,
    "updated_at": "2026-11-02T09:00:00+00:00",
    "activated_at": "2026-11-02T09:00:00+00:00",
    "ping_url": "https://app.crontinel.com/ping/…"
  }
}
```

`ping_url` is a credential. It's returned only when the schedule is created and when you regenerate it, never by list or get. Regenerating stops the old URL at once:

```bash
curl -fsS -X POST https://app.crontinel.com/api/v1/apps/billing/cron-schedules/42/ping-token \
  -H "Authorization: Bearer $CRONTINEL_KEY"
```

Pause a schedule without deleting it:

```bash
curl -fsS -X PATCH https://app.crontinel.com/api/v1/apps/billing/cron-schedules/42 \
  -H "Authorization: Bearer $CRONTINEL_KEY" -H "Content-Type: application/json" \
  -d '{"enabled":false}'
```

Deleting a schedule closes its open alerts without sending recovery notifications. An app can have up to 20 cron schedules.

## Heartbeats

Same routes under `/heartbeats`. Fields: `name` (required, the stable key), `interval_minutes` (required, 1 to 10080), `grace_minutes` (1 to 1440), `enabled`, `tags`.

```bash
curl -fsS -X PUT https://app.crontinel.com/api/v1/apps/billing/heartbeats \
  -H "Authorization: Bearer $CRONTINEL_KEY" -H "Content-Type: application/json" \
  -d '{"name":"queue-worker","interval_minutes":5,"grace_minutes":2,"tags":["ops"]}'
```

## Outcome rules

| Method and path | Scope |
|---|---|
| `GET /outcome-rules` | `monitor:read` |
| `PUT /outcome-rules` | `monitor:write` |
| `GET /outcome-rules/{id}` | `monitor:read` |
| `DELETE /outcome-rules/{id}` | `monitor:write` |

| Field | Required | Notes |
|---|---|---|
| `command` | yes | Which runs the rule applies to |
| `job_name`, `environment`, `expression` | no | Narrow the match |
| `key` | yes | Metric or timestamp name in the run receipt |
| `kind` | yes | `numeric_min`, `numeric_max` or `freshness` |
| `threshold` | yes | The bound, or the maximum age in seconds for `freshness` |
| `missing` | no | `unknown` (default) or `fail`. What happens when a run reports no value. See [unknown outcomes](/check-in/start-finish/#missing-value-policy) |

```bash
curl -fsS -X PUT https://app.crontinel.com/api/v1/apps/billing/outcome-rules \
  -H "Authorization: Bearer $CRONTINEL_KEY" -H "Content-Type: application/json" \
  -d '{"command":"reports:send","key":"emails_sent","kind":"numeric_min","threshold":1,"missing":"fail"}'
```

Rule ids are UUIDs. An app can have up to 20 rules. Rules apply to runs received after the change.

## Quality checks

`GET`, `PUT`, `GET /{id}` and `DELETE /{id}` under `/quality-checks`. A quality check sends run output to the hosted model for grading, so two things are required:

- `"consent": true` in the body, every time
- the organization's AI switch turned on (otherwise `403 unsupported_feature`)

Fields: `command` (required), `job_name`, `environment`, `expression`, `rubric` (10 to 1000 characters), `pass_score` (1 to 5), `consent`.

```bash
curl -fsS -X PUT https://app.crontinel.com/api/v1/apps/billing/quality-checks \
  -H "Authorization: Bearer $CRONTINEL_KEY" -H "Content-Type: application/json" \
  -d '{"command":"agent:digest","rubric":"Lists every open pull request with its author.","pass_score":3,"consent":true}'
```

The response records `consented_by` (the key owner) and `consented_at`. An app can have up to 10 quality checks. See [AI quality checks](/mcp/ai-agent-monitoring/#quality-check-ai-optional).

## Mute and unmute

Mute holds back notifications. Incidents still open and close.

| Method and path | Body |
|---|---|
| `PUT /mute` | `{"minutes": 60}`. One of 0, 60, 240, 1440, 10080. 0 unmutes |
| `DELETE /mute` | none, unmutes the app |
| `PUT /monitors/{id}/mute` | same as the app |
| `DELETE /monitors/{id}/mute` | none |

```bash
curl -fsS -X PUT https://app.crontinel.com/api/v1/apps/billing/mute \
  -H "Authorization: Bearer $CRONTINEL_KEY" -H "Content-Type: application/json" \
  -d '{"minutes":240}'
```

An app mute wins over a monitor mute.

## Escalation policy

Read or replace the app's [escalation steps](/alerts/channels/#escalation-saas).

| Method and path | Body |
|---|---|
| `GET /escalation` | none |
| `PUT /escalation` | `{"steps": [{"wait_minutes": 15, "channel_ids": [12]}]}`. Replaces every step. `{"steps": []}` removes escalation |

Up to 5 steps. `wait_minutes` is 5 to 1440, counted from the previous step. `channel_ids` are alert channels of this app or its organization.

```bash
curl -fsS -X PUT https://app.crontinel.com/api/v1/apps/billing/escalation \
  -H "Authorization: Bearer $CRONTINEL_KEY" -H "Content-Type: application/json" \
  -d '{"steps":[{"wait_minutes":15,"channel_ids":[12]},{"wait_minutes":30,"channel_ids":[14]}]}'
```

## Maintenance windows

Read and change the app's [maintenance windows](/alerts/channels/#maintenance-windows-saas). `PUT` upserts by `name`.

| Method and path | Body |
|---|---|
| `GET /maintenance-windows` | none |
| `PUT /maintenance-windows` | a window, see below |
| `GET /maintenance-windows/{id}` | none |
| `DELETE /maintenance-windows/{id}` | none |

| Field | Notes |
|---|---|
| `name` | Required, up to 100 characters. Stable key |
| `type` | Required. `once` or `weekly` |
| `starts_at`, `ends_at` | `once` only. ISO 8601. Without an offset, read in the app's time zone. Stored in UTC. `ends_at` must be after `starts_at` |
| `days` | `weekly` only. List of 0 (Sunday) to 6 |
| `start_time` | `weekly` only. `HH:MM` in the app's time zone (UTC if unset). Follows daylight saving |
| `duration_minutes` | `weekly` only. 5 to 10080 |
| `monitor_ids` | Optional. Monitors of this app |
| `tags` | Optional. Monitors with any of these tags. No `monitor_ids` and no `tags` covers the whole app |

```bash
curl -fsS -X PUT https://app.crontinel.com/api/v1/apps/billing/maintenance-windows \
  -H "Authorization: Bearer $CRONTINEL_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Patch night","type":"weekly","days":[2],"start_time":"02:00","duration_minutes":90,"tags":["db"]}'
```

The response adds an `id`. An app can have up to 20 windows.

## Tags

Cron schedules and heartbeats take up to 10 tags. Tags are lowercase slugs: letters, numbers, dashes and underscores, up to 32 characters. Uppercase input is lowercased and duplicates are dropped.

Filter lists with `?tag=`:

```bash
curl -fsS "https://app.crontinel.com/api/v1/apps/billing/cron-schedules?tag=nightly" \
  -H "Authorization: Bearer $CRONTINEL_KEY"
```

In the dashboard, set tags on the schedule and monitor forms (comma-separated). The app's Monitors tab and the [Analytics](/analytics/) page filter by tag. On Analytics a tag narrows the jobs table to commands of schedules with that tag; incident counts and queues stay app-wide.

## Errors

Errors are JSON with an `error` code and a `message`. Validation errors add `errors`, keyed by field.

```json
{
  "error": "validation_failed",
  "message": "The interval minutes field must be at least 1.",
  "errors": { "interval_minutes": ["The interval minutes field must be at least 1."] }
}
```

| Status | `error` | When |
|---|---|---|
| 401 | `unauthenticated` | Missing, invalid, expired or revoked key |
| 403 | `insufficient_scope` | The key lacks the scope, or it's an app ingest key |
| 403 | `forbidden` | The key owner is a viewer on this app |
| 403 | `unsupported_feature` | Quality check while the organization's AI switch is off |
| 404 | `not_found` | Unknown record, or an app the key wasn't given |
| 409 | `conflict` | A `PATCH` would give two records the same stable key, or `if_version` no longer matches the record |
| 422 | `validation_failed` | Field errors in `errors` |
| 429 | `quota_exceeded` | Plan monitor limit, or a per-app cap (20 schedules, 20 rules, 10 quality checks). Updating an existing record still works |
| 429 | `rate_limited` | More than 60 requests a minute. Wait `Retry-After` seconds |

## Not in the API yet

- MCP covers saving cron schedules, heartbeats and outcome rules ([MCP tools](/mcp/tools/#configuration-writes-hosted-mcp)). Use this API for deletes, mutes, escalation, maintenance windows and quality checks.
- Pagination. Lists return every record, bounded by the per-app caps and your plan's monitor limit.

The machine-readable contract is in [openapi.json](https://app.crontinel.com/openapi.json) under the `Configuration` tag.
