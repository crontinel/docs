---
title: Ping URLs (no API key)
description: Every cron schedule has its own ping URL. Hit it with curl when a job finishes, starts, or fails. No API key or JSON needed.
---

Each cron schedule in Crontinel has a ping URL. The token in the URL is the credential, so the job needs no API key and no JSON. Find the URL on the app's **Cron schedules** page, next to each schedule. Only members who can configure the app see it.

A ping goes through the same path as a [JSON receipt](/check-in/recipes/). Schedule checks, outcome rules, AI quality checks, alerts, and the monthly ingest allowance all work the same way.

## Endpoints

`GET` and `POST` both work.

| URL | Records |
|---|---|
| `https://app.crontinel.com/ping/<token>` | A completed run |
| `https://app.crontinel.com/ping/<token>/start` | A running run |
| `https://app.crontinel.com/ping/<token>/fail` | A failed run |
| `https://app.crontinel.com/ping/<token>/<exit_code>` | Completed for `0`, failed for anything else. The exit code is stored. |

A successful ping returns `200` with the body `OK`.

## Examples

```bash
# Finished
curl -fsS -m 10 --retry 3 https://app.crontinel.com/ping/<token>

# Failed
curl -fsS -m 10 --retry 3 https://app.crontinel.com/ping/<token>/fail

# Report the job's exit code
./backup.sh
curl -fsS -m 10 --retry 3 https://app.crontinel.com/ping/<token>/$?

# Send the job's output (first 10,000 characters are kept)
./backup.sh > /tmp/backup.log 2>&1
curl -fsS -m 10 --retry 3 --data-binary @/tmp/backup.log https://app.crontinel.com/ping/<token>/$?
```

In a crontab line:

```bash
0 2 * * * /opt/jobs/backup.sh && curl -fsS -m 10 --retry 3 https://app.crontinel.com/ping/<token>
```

## Start and finish

Ping `/start` when the job begins to get an alert for a run that starts and never finishes within the schedule's maximum runtime.

```bash
RID="$(date -u +%Y%m%dT%H%M%SZ)"
curl -fsS -m 10 --retry 3 "https://app.crontinel.com/ping/<token>/start?rid=$RID"
./backup.sh
curl -fsS -m 10 --retry 3 "https://app.crontinel.com/ping/<token>/$??rid=$RID"
```

- `rid` (run id) pairs the start with the finish. Use 1 to 64 letters, digits, `.`, `-`, `_` or `:`. Pass it in the query string.
- Without `rid`, a finish closes the latest open run that this URL started. That works when runs of the job never overlap.
- Repeating a finish for a run that already finished returns `OK` and changes nothing, so `--retry` is safe.
- The run's duration is the time between the start and finish pings.

## Errors

| Status | Meaning |
|---|---|
| `404` | Unknown or regenerated token. The body is `Not found`, with no other details. |
| `422` | Invalid `rid` |
| `429` | Too many pings: 60 per minute per URL. Or the organization used its monthly ingest allowance; that response is the same JSON as the [ingest API](/reference/api/). |

## Regenerate the URL

If a URL leaks, click **Regenerate ping URL** on the schedule. The old URL stops working at once and returns `404`. The change is recorded in the audit log.

## Outcome rules with pings

A ping carries no `outcomes` metrics. If an outcome rule applies to the job, its runs will show the outcome as [unknown](/check-in/start-finish/#outcome-rules-and-missing-evidence). Use a [JSON receipt](/check-in/recipes/) when the job needs to report numbers such as `processed_records`.
